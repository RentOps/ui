import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { globalStats } from './stats.get'

const TelegramUpdateSchema = z.object({
  update_id: z.number(),
  message: z.optional(z.object({
    message_id: z.number(),
    from: z.object({
      id: z.number(),
      first_name: z.string(),
      username: z.optional(z.string()),
    }),
    chat: z.object({
      id: z.number(),
      type: z.string(),
    }),
    text: z.optional(z.string()),
  })),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  try {
    const update = TelegramUpdateSchema.parse(body)
    
    if (update.message?.text) {
      const text = update.message.text
      const chatId = update.message.chat.id
      
      if (text === '/start') {
        await sendTelegramMessage(chatId, 
`*RentOps Online*

I am your Kora Operator Assistant.

*Commands:*
/scan <NODE_ADDRESS> - Scan for rent opportunities
/status - View global system stats
/help - Show this menu

Note: This cloud bot has execution limits (60s). For continuous real-time monitoring and instant alerts without limits, please run RentOps locally.

_For secure reclamation, please use the web dashboard._`)
      } 
      else if (text.startsWith('/scan')) {
        const node = text.split(' ')[1]
        if (!node) {
          await sendTelegramMessage(chatId, "Please provide a node address:\n`/scan <ADDRESS>`")
          return { ok: true }
        }
        await sendTelegramMessage(chatId, `Scanning node \`${node.slice(0, 8)}...\` on *devnet*...`)
        
        try {
          const { scanForNode } = useScanner()
          const result = await scanForNode(node, { network: 'devnet' })
          
          const reclaimable = result.foundLogs.filter(l => l.isReclaimable).length
          const sponsored = result.foundLogs.filter(l => l.reason === 'USER_OWNED').length
          const totalRent = (result.foundLogs.length * 0.002).toFixed(4)

          let msg = `*Scan Complete*\n\n`
          msg += `*Target:* \`${node}\`\n`
          msg += `*Total Rent Detected:* ~${totalRent} SOL\n\n`
          
          if (reclaimable > 0) {
             msg += `*ACTION REQUIRED:* ${reclaimable} accounts are owned by you and reclaimable immediately via Dashboard.\n`
          }
          if (sponsored > 0) {
             msg += `*SPONSORED:* ${sponsored} accounts are User-Owned.\n`
          }
          if (reclaimable === 0 && sponsored === 0) {
             msg += `All clear. No idle rent found.`
          }

          await sendTelegramMessage(chatId, msg)
        } catch (err) {
           await sendTelegramMessage(chatId, `Scan failed: ${err.message}`)
        }
       } 
       else if (text === '/status') {
        const message = `*RentOps Status Report*
        
*Total Locked:* ${globalStats.totalLocked.toFixed(4)} SOL
*Total Reclaimed:* ${globalStats.totalReclaimed.toFixed(4)} SOL
*Idle Rent Value:* ${globalStats.idleRent.toFixed(4)} SOL
*Active Accounts:* ${globalStats.activeAccounts}

System: *OPERATIONAL*`
        await sendTelegramMessage(chatId, message)
       } 
       else if (text.startsWith('/reclaim')) {
         await sendTelegramMessage(chatId, `*Security Alert*

Reclamation requires private key signing. This is disabled on Telegram for your safety.

Please use the [RentOps Dashboard](https://rentops.davidnzube.xyz) or CLI.`)
       }
    }
    
    return { ok: true }
  } catch (e) {
    console.error('Invalid Telegram update:', e)
    return { ok: false, error: 'Invalid update' }
  }
})

async function sendTelegramMessage(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    console.warn('TELEGRAM_BOT_TOKEN not set')
    return
  }
  
  const url = `https://api.telegram.org/bot${token}/sendMessage`
  await $fetch(url, {
    method: 'POST',
    body: {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    }
  })
}
