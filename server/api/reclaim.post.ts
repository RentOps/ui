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
    
    // 2. Fetch Account Info (Explicitly request base64 to avoid RPC defaults)
    const accountInfo = await rpc.getAccountInfo(address(account), { encoding: 'base64' }).send()
    
    if (!accountInfo?.value) {
      return { success: false, message: 'Account already closed or not found' }
    }

    const lamports = Number(accountInfo.value.lamports)
    const sol = lamports / 1e9
    const owner = accountInfo.value.owner

    // 3. Build Instructions
    const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
    const SYSTEM_PROGRAM = '11111111111111111111111111111111'
    let instructions = []

    if (owner === TOKEN_PROGRAM) {
      const data = Buffer.from(accountInfo.value.data[0], 'base64')
      const tokenAmount = data.readBigUInt64LE(64)
      if (tokenAmount > 0n) return { success: false, message: 'Account still holds tokens' }

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
      instructions.push({
        programAddress: address(SYSTEM_PROGRAM),
        accounts: [
          { address: address(account), role: 3 },
          { address: address(koraNode), role: 1 }
        ],
        data: new Uint8Array([2, 0, 0, 0, ...new Uint8Array(new BigUint64Array([BigInt(lamports)]).buffer)])
      })
    }

    // 4. Finalize & Sign
    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send()
    let message = createTransactionMessage({ version: 0 })
    message = setTransactionMessageFeePayerSigner(address(authorityPubkey), message)
    message = setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, message)
    message = appendTransactionMessageInstructions(instructions, message)

    const keyPair = await crypto.subtle.importKey(
      'raw', authorityBytes.slice(0, 32),
      { name: 'Ed25519', namedCurve: 'Ed25519' },
      false, ['sign']
    )

    const signedMessage = await signTransactionMessageWithSigners(message, [{
      privateKey: keyPair, publicKey: address(authorityPubkey)
    }])

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