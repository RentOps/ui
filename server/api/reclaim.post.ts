import {
  createSolanaRpc,
  address,
  createTransactionMessage,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstructions,
  signTransactionMessageWithSigners,
  getBase64EncodedWireTransaction,
  createKeyPairFromBytes,
  createSignerFromKeyPair
} from '@solana/kit'
import bs58 from 'bs58'
import { globalStats } from './stats.get'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { account, koraNode, network = 'devnet', privateKey } = body

  if (!account || !koraNode || !privateKey) {
    throw createError({ statusCode: 400, message: 'account, koraNode, and privateKey required' })
  }

  const heliusKey = process.env.HELIUS_RPC_API_KEY
  const rpcUrl = network === 'devnet' 
    ? (heliusKey ? `https://devnet.helius-rpc.com/?api-key=${heliusKey}` : 'https://api.devnet.solana.com')
    : (heliusKey ? `https://mainnet.helius-rpc.com/?api-key=${heliusKey}` : 'https://api.mainnet-beta.solana.com')

  console.log(`[RECLAIM] Target: ${account} | RPC: ${network}`)
  const rpc = createSolanaRpc(rpcUrl)

  try {
    // 1. Parse Private Key
    let authorityBytes: Uint8Array
    try {
      if (privateKey.startsWith('[')) {
        authorityBytes = new Uint8Array(JSON.parse(privateKey))
      } else {
        authorityBytes = bs58.decode(privateKey)
      }
    } catch (e) {
      return { success: false, message: 'Invalid private key format. Use Base58 or [1,2,3...] JSON array.' }
    }

    if (authorityBytes.length !== 64) {
      return { success: false, message: 'Private key must be 64 bytes (Keypair format)' }
    }

    const authorityPubkey = bs58.encode(authorityBytes.slice(32, 64))
    
    // Create Signer Object EARLY
    const keyPair = await createKeyPairFromBytes(authorityBytes)
    const signer = await createSignerFromKeyPair(keyPair)

    // 2. Fetch Account Info (Explicitly request base64 to avoid RPC defaults)
    const accountInfo = await rpc.getAccountInfo(address(account), { encoding: 'base64' }).send()
    
    if (!accountInfo?.value) {
      return { success: false, message: 'Account already closed or not found' }
    }

    const lamports = Number(accountInfo.value.lamports)
    const sol = lamports / 1e9
    const owner = accountInfo.value.owner
    console.log(`[RECLAIM] Balance: ${sol} SOL, Program Owner: ${owner}`)

    // 3. Build Instructions
    const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
    const SYSTEM_PROGRAM = '11111111111111111111111111111111'
    let instructions = []

    if (owner === TOKEN_PROGRAM) {
      const data = Buffer.from(accountInfo.value.data[0], 'base64')
      const mintAddress = bs58.encode(data.subarray(0, 32))
      const tokenAccountOwner = bs58.encode(data.subarray(32, 64))
      const tokenAmount = data.readBigUInt64LE(64)
      
      console.log(`[RECLAIM] Token Account Authority: ${tokenAccountOwner}, Balance: ${tokenAmount}`)

      // Check if we have authority
      if (tokenAccountOwner !== authorityPubkey) {
         return {
           success: false,
           message: `Cannot reclaim: Account is owned by user ${tokenAccountOwner}. You (Kora Node) are ${authorityPubkey}. Only the owner can close this account.`
         }
      }

      // Sweep tokens if balance > 0
      if (tokenAmount > 0n) {
        console.log(`[RECLAIM] Sweeping ${tokenAmount} tokens to destination...`)
        instructions.push({
          programAddress: address(TOKEN_PROGRAM),
          accounts: [
            { address: address(account), role: 1 }, // Source
            { address: address(koraNode), role: 1 }, // Destination (Wait, koraNode is a wallet, we need an ATA? Or standard transfer? Transfer requires destination to be a TOKEN ACCOUNT usually, unless creating associated?)
            // If koraNode is a wallet address, we need to find/create its ATA for this mint.
            // Simplified: We assume koraNode has an ATA or we use Associated Token Program to create it?
            // Actually, `transfer` instruction expects a Destination Token Account.
            // If we send to `koraNode` (wallet), it will fail.
            // Let's look up the Associated Token Account for koraNode + mint.
            // For now, let's just fail with a clearer message if we can't easily derive/create.
            // Or better: Just allow Burn? No, unsafe.
            // Let's try to find the ATA for koraNode.
            
            // NOTE: Implementing full sweep requires deriving ATA.
            // Let's use SPL Token `Transfer` instruction.
            // Accounts: Source, Destination, Owner.
            // We need destination ATA.
            // Deriving ATA in this script might be complex without importing `getAssociatedTokenAddress`.
            // Let's stick to the safety check for now but update the message.
          ],
          data: new Uint8Array([3, ...new Uint8Array(new BigUint64Array([tokenAmount]).buffer)]) // Transfer instruction
        })
        // Reverting sweep logic for now as it requires destination ATA derivation which isn't imported.
        // Will update message to be helpful.
        return {
          success: false,
          message: `Account holds ${tokenAmount} tokens. Please transfer them out manually or ensure destination ATA exists.`
        }
      }

      instructions.push({
        programAddress: address(TOKEN_PROGRAM),
        accounts: [
          { address: address(account), role: 1 },
          { address: address(koraNode), role: 1 },
          { address: address(authorityPubkey), role: 3 }
        ],
        data: new Uint8Array([9]) // CloseAccount
      })
    } else {
      // System Account Logic
      // For System accounts, the address ITSELF is the authority/signer.
      if (account !== authorityPubkey) {
         return {
           success: false,
           message: `Cannot reclaim: System Account ${account} must sign for itself. You provided key for ${authorityPubkey}.`
         }
      }

      instructions.push({
        programAddress: address(SYSTEM_PROGRAM),
        accounts: [
          { address: address(account), role: 3 },
          { address: address(koraNode), role: 1 }
        ],
        data: new Uint8Array([2, 0, 0, 0, ...new Uint8Array(new BigUint64Array([BigInt(lamports)]).buffer)])
      })
    }

    // Correcting the System Program Instruction Logic:
    // If it's a System Account, we are TRANSFERRING out. The Source (`account`) must sign.
    // If `signer.address` !== `account`, and it's a System Account, this will fail on-chain.
    // But for the `in` operator error, we just need to pass the `signer` object where the signer is expected.
    
    // 4. Finalize & Sign
    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send()
    
    let message = createTransactionMessage({ version: 0 })
    message = setTransactionMessageFeePayerSigner(signer, message) // Use signer object
    message = setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, message)
    message = appendTransactionMessageInstructions(instructions, message)

    const signedMessage = await signTransactionMessageWithSigners(message)

    // 5. Send Transaction (Nuclear option: bypass library wrapper if it keeps failing with encoding)
    const encodedTx = getBase64EncodedWireTransaction(signedMessage)
    
    // We try the standard sendTransaction but with minimal options
    const signature = await rpc.sendTransaction(encodedTx, {
        encoding: 'base64',
        skipPreflight: true
    }).send()

    // Update global stats
    globalStats.totalReclaimed += sol
    globalStats.totalLocked = Math.max(0, globalStats.totalLocked - sol)
    globalStats.activeAccounts = Math.max(0, globalStats.activeAccounts - 1)

    return { success: true, message: `Reclaimed ${sol.toFixed(6)} SOL`, amount: sol, tx: signature }

  } catch (e) {
    console.error(`[RECLAIM ERROR]`, e)
    return { success: false, error: e.message, details: e.context || e.toString() }
  }
})