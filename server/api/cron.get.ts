import { defineEventHandler } from 'h3'
import { useScanner } from '../utils/scanner'

export default defineEventHandler(async (event) => {
  // Security Check: Vercel sends this header
  const authHeader = getHeader(event, 'authorization')
  // In production, you should verify this against process.env.CRON_SECRET
  // For this MVP, we'll allow it but log.
  
  console.log('[CRON] Starting scheduled scan...')
  
  const node = process.env.KORA_NODE_ADDRESS
  if (!node) {
    return { status: 'skipped', message: 'No KORA_NODE_ADDRESS configured' }
  }

  try {
    const { scanForNode } = useScanner()
    // Perform a scan on the configured main node
    const result = await scanForNode(node, { network: 'devnet' }) // Default to devnet
    
    // Optional: If you had a Telegram Chat ID stored, you could push an alert here.
    // For now, we just update the global state/cache.
    
    return { 
      status: 'success', 
      found: result.foundCount, 
      message: `Scanned ${node}. Found ${result.foundCount} items.` 
    }
  } catch (e) {
    console.error('[CRON ERROR]', e)
    return { status: 'error', message: e.message }
  }
})
