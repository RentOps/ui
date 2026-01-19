import { createSolanaRpc, address } from '@solana/kit'
import fs from 'fs'
import path from 'path'
import { globalStats } from '../api/stats.get'

export const useScanner = () => {

  // Load whitelist
  let whitelist: string[] = []
  try {
    const whitelistPath = path.resolve(process.cwd(), '../whitelist.json')
    if (fs.existsSync(whitelistPath)) {
      const content = JSON.parse(fs.readFileSync(whitelistPath, 'utf-8'))
      whitelist = content.accounts || []
    }
  } catch (e) {
    console.warn('[WARN] Could not load whitelist.json:', e.message)
  }

  const scanForNode = async (nodeAddress: string, options: { network?: string, customRpc?: string } = {}) => {
    const { network = 'devnet', customRpc } = options
    const heliusKey = process.env.HELIUS_RPC_API_KEY
    
    let rpcUrl = ''
    
    if (network === 'custom' && customRpc) {
      rpcUrl = customRpc
      console.log(`[LOG] Using custom RPC: ${rpcUrl}`)
    } else if (network === 'devnet') {
      rpcUrl = heliusKey 
        ? `https://devnet.helius-rpc.com/?api-key=${heliusKey}`
        : 'https://api.devnet.solana.com'
      console.log(`[LOG] Using Devnet RPC`)
    } else if (network === 'mainnet') {
      rpcUrl = heliusKey 
        ? `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`
        : 'https://api.mainnet-beta.solana.com'
      console.log(`[LOG] Using Mainnet RPC`)
    }

    console.log(`[LOG] Starting deep scan for Kora node: ${nodeAddress} on ${network}`)
    const rpc = createSolanaRpc(rpcUrl)
    
    try {
      console.log(`[LOG] Fetching signatures for ${nodeAddress}...`)
      const signatures = await rpc.getSignaturesForAddress(address(nodeAddress), { limit: 100 }).send()
      console.log(`[LOG] Found ${signatures.length} total signatures`)
      
      const foundLogs = []
      let foundCount = 0
      let analyzedCount = 0
      
      if (signatures.length === 0) {
        console.log(`[WARN] No transactions found for ${nodeAddress} on ${network}`)
        foundLogs.push({
          id: `summary_${nodeAddress}_${Date.now()}`,
          type: 'system',
          account: 'SCAN_COMPLETE',
          reason: `No transactions found on ${network.toUpperCase()}. Verify address and network selection.`,
          amount: '0.000',
          tx: '-',
          timestamp: new Date().toLocaleTimeString(),
          koraNode: nodeAddress
        })
        return { foundCount: 0, foundLogs }
      }

      console.log(`[LOG] Analyzing ${signatures.length} transactions for rent patterns...`)
      
      for (const sigInfo of signatures) {
        try {
          const txResponse = await rpc.getTransaction(sigInfo.signature, { 
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed'
          }).send()

          if (!txResponse || !txResponse.meta) {
            continue
          }

          analyzedCount++
          const meta = txResponse.meta
          const message = txResponse.transaction.message
          
          // Extract account keys
          let accountKeys = []
          if (Array.isArray(message.accountKeys)) {
            accountKeys = message.accountKeys.map(k => {
              if (typeof k === 'string') return k
              if (k.pubkey) return k.pubkey
              if (k.toString) return k.toString()
              return String(k)
            })
          } else if (Array.isArray(message.staticAccountKeys)) {
            accountKeys = message.staticAccountKeys.map(k => String(k))
          }

          if (accountKeys.length === 0 || !meta.preBalances || !meta.postBalances) {
            continue
          }

          // Find node's index and check if it paid
          const nodeIndex = accountKeys.findIndex(addr => String(addr) === nodeAddress)
          let nodePaidForRent = false
          
          if (nodeIndex !== -1) {
            const nodePre = Number(meta.preBalances[nodeIndex])
            const nodePost = Number(meta.postBalances[nodeIndex])
            const nodeSpent = nodePre - nodePost
            
            if (nodeSpent > 10000) {
              nodePaidForRent = true
            }
          }

          // Look for new accounts (0 balance -> positive balance)
          for (let i = 0; i < meta.postBalances.length; i++) {
            const pre = Number(meta.preBalances[i] || 0n)
            const post = Number(meta.postBalances[i] || 0n)
            const accountAddress = String(accountKeys[i] || '')
            
            // Skip if no address or same as node
            if (!accountAddress || accountAddress === nodeAddress) continue
            
            // Whitelist check
            if (whitelist.includes(accountAddress)) {
              console.log(`[LOG] Skipping whitelisted account: ${accountAddress.slice(0, 8)}...`)
              foundLogs.push({
                id: `${sigInfo.signature}_${i}_whitelist`,
                type: 'skip',
                account: accountAddress,
                reason: 'Whitelisted_Protected',
                amount: `+${(post / 1_000_000_000).toFixed(6)}`,
                tx: sigInfo.signature,
                timestamp: new Date().toLocaleTimeString(),
                koraNode: nodeAddress
              })
              continue
            }
            
            // Detect new account creation (0 -> positive)
            const isNewAccount = pre === 0 && post > 0
            
            if (isNewAccount) {
              const reason = nodePaidForRent 
                ? 'Node_Sponsored_Creation' 
                : 'Third_Party_Creation'

              const logEntry = {
                id: `${sigInfo.signature}_${i}`,
                type: 'detected',
                account: accountAddress,
                reason,
                amount: `+${(post / 1_000_000_000).toFixed(6)}`,
                tx: sigInfo.signature,
                timestamp: new Date().toLocaleTimeString(),
                koraNode: nodeAddress,
                isDirectSponsorship: nodePaidForRent,
                preBalance: (pre / 1e9).toFixed(9),
                postBalance: (post / 1e9).toFixed(9),
                currentStatus: 'active', // Default to active, check later if needed
                currentBalance: (post / 1e9).toFixed(9)
              }

              foundLogs.push(logEntry)
              foundCount++
              
               console.log(`[DETECT] ${accountAddress.slice(0, 8)}... received ${(post / 1e9).toFixed(6)} SOL (new account)`)

               // Update global stats
               globalStats.totalLocked += Number(post / 1e9)
               globalStats.activeAccounts += 1
               globalStats.idleRent += Number(post / 1e9)
            }
          }
        } catch (txErr) {
          console.warn(`[WARN] Error processing tx ${sigInfo.signature.slice(0, 8)}...: ${txErr.message}`)
        }
      }

      console.log(`[LOG] ====== SCAN SUMMARY ======`)
      console.log(`[LOG] Total signatures: ${signatures.length}`)
      console.log(`[LOG] Successfully analyzed: ${analyzedCount}`)
      console.log(`[LOG] Rent events found: ${foundCount}`)
      console.log(`[LOG] ===========================`)

      // Add summary log
      if (foundCount === 0) {
        foundLogs.push({
          id: `summary_${nodeAddress}_${Date.now()}`,
          type: 'system',
          account: 'SCAN_COMPLETE',
          reason: `Analyzed ${analyzedCount} transactions on ${network.toUpperCase()}. No new account creations detected.`,
          amount: '0.000',
          tx: '-',
          timestamp: new Date().toLocaleTimeString(),
          koraNode: nodeAddress
        })
      }

      return { foundCount, foundLogs }
    } catch (e) {
      console.error(`[ERROR] Scan failed for ${nodeAddress}: ${e.message}`)
      console.error(e.stack)
      throw e
    }
  }

  return { scanForNode }
}
