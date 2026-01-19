import {
  createSolanaRpc,
  address,
  createTransactionMessage,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstructions,
  signTransactionMessageWithSigners,
  getBase64EncodedWireTransaction
} from '@solana/kit'
import bs58 from 'bs58'
import { globalStats } from './stats.get'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { account, koraNode, network = 'devnet', privateKey } = body

  if (!account || !koraNode || !privateKey) {
    throw createError({ 
      statusCode: 400, 
      message: 'account, koraNode, and privateKey required' 
    })
  }

  console.log(`[RECLAIM] Attempting reclaim: ${account}`)

  const heliusKey = process.env.HELIUS_RPC_API_KEY
  const rpcUrl = network === 'devnet' 
    ? (heliusKey ? `https://devnet.helius-rpc.com/?api-key=${heliusKey}` : 'https://api.devnet.solana.com')
    : (heliusKey ? `https://mainnet.helius-rpc.com/?api-key=${heliusKey}` : 'https://api.mainnet-beta.solana.com')

  const rpc = createSolanaRpc(rpcUrl)

  try {
    // 1. Decode and validate private key
    let authorityBytes: Uint8Array
    try {
      // Try base58 first
      authorityBytes = bs58.decode(privateKey)
    } catch {
      try {
        // Try JSON array format
        authorityBytes = new Uint8Array(JSON.parse(privateKey))
      } catch {
        return {
          success: false,
          message: 'Invalid private key format. Use base58 or JSON array [1,2,3...]'
        }
      }
    }

    if (authorityBytes.length !== 64) {
      return {
        success: false,
        message: 'Private key must be 64 bytes'
      }
    }

    const authorityPubkey = bs58.encode(authorityBytes.slice(32, 64))
    console.log(`[RECLAIM] Authority: ${authorityPubkey}`)

    // 2. Check account exists
    const accountInfo = await rpc.getAccountInfo(address(account)).send()
    
    if (!accountInfo?.value) {
      return { 
        success: false, 
        message: 'Account not found or already closed'
      }
    }

    const lamports = Number(accountInfo.value.lamports)
    const sol = lamports / 1e9
    const owner = accountInfo.value.owner

    console.log(`[RECLAIM] Balance: ${sol} SOL, Owner: ${owner}`)

    // 3. Build close instruction based on account type
    const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
    const SYSTEM_PROGRAM = '11111111111111111111111111111111'
    
    let instructions = []

    if (owner === TOKEN_PROGRAM) {
      // Token account - check if empty
      const data = Buffer.from(accountInfo.value.data[0], 'base64')
      const tokenAmount = data.readBigUInt64LE(64)
      
      if (tokenAmount > 0n) {
        return {
          success: false,
          message: 'Token account still holds tokens - transfer them first'
        }
      }

      // Close instruction (rent goes to destination)
      instructions.push({
        programAddress: address(TOKEN_PROGRAM),
        accounts: [
          { address: address(account), role: 1 }, // writable
          { address: address(koraNode), role: 1 }, // writable (receives rent)
          { address: address(authorityPubkey), role: 3 } // signer
        ],
        data: new Uint8Array([9]) // CloseAccount instruction
      })

    } else if (owner === SYSTEM_PROGRAM) {
      // System account - transfer all lamports then close
      instructions.push({
        programAddress: address(SYSTEM_PROGRAM),
        accounts: [
          { address: address(account), role: 3 }, // signer + writable
          { address: address(koraNode), role: 1 } // writable
        ],
        data: new Uint8Array([
          2, 0, 0, 0, // Transfer instruction
          ...new Uint8Array(new BigUint64Array([BigInt(lamports)]).buffer)
        ])
      })

    } else {
      return {
        success: false,
        message: `Account owned by program ${owner} - cannot auto-reclaim`
      }
    }

    // 4. Get latest blockhash
    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send()

    // 5. Build transaction message
    let message = createTransactionMessage({ version: 0 })
    message = setTransactionMessageFeePayerSigner(address(authorityPubkey), message)
    message = setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, message)
    message = appendTransactionMessageInstructions(instructions, message)

    // 6. Sign transaction
    const keyPair = await crypto.subtle.importKey(
      'raw',
      authorityBytes.slice(0, 32),
      { name: 'Ed25519', namedCurve: 'Ed25519' },
      false,
      ['sign']
    )

    const signedMessage = await signTransactionMessageWithSigners(message, [{
      privateKey: keyPair,
      publicKey: address(authorityPubkey)
    }])

    // 7. Send transaction
    const encodedTx = getBase64EncodedWireTransaction(signedMessage)
    const signature = await rpc.sendTransaction(encodedTx, {
      encoding: 'base64',
      skipPreflight: false
    }).send()

      console.log(`[RECLAIM] Success! TX: ${signature}`)

      // Update stats
      globalStats.totalReclaimed += sol
      globalStats.totalLocked = Math.max(0, globalStats.totalLocked - sol)
      globalStats.idleRent = Math.max(0, globalStats.idleRent - sol)
      globalStats.activeAccounts = Math.max(0, globalStats.activeAccounts - 1)

    return {
      success: true,
      message: `Reclaimed ${sol.toFixed(6)} SOL`,
      amount: sol,
      tx: signature
    }

  } catch (e) {
    console.error(`[RECLAIM ERROR]`, e)
    return { 
      success: false, 
      error: e.message,
      details: e.toString()
    }
  }
})
