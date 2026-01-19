import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'

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
        await sendTelegramMessage(chatId, "Welcome to RentOps! I'll monitor your Kora node's rent status.")
      } else if (text.startsWith('/scan')) {
        const node = text.split(' ')[1] || process.env.KORA_NODE_ADDRESS
        if (!node) {
          await sendTelegramMessage(chatId, "Please provide a node address: /scan <ADDRESS>")
          return { ok: true }
        }
        await sendTelegramMessage(chatId, `[LOG] Scanning for node ${node}...`)
        const { scanForNode } = useScanner()
        const result = await scanForNode(node)
        await sendTelegramMessage(chatId, `[SUCCESS] Scan complete! Found ${result.foundCount} sponsored accounts. Check your dashboard for details.`)
       } else if (text === '/status') {
         const stats = await $fetch('/api/stats')
        
        const message = `📊 *RentOps Status Report*
        
💰 Total Locked: ${stats.totalLocked.toFixed(4)} SOL
✅ Total Reclaimed: ${stats.totalReclaimed.toFixed(4)} SOL
⚠️ Idle Rent: ${stats.idleRent.toFixed(4)} SOL
active Accounts: ${stats.activeAccounts}

System: ONLINE`
        await sendTelegramMessage(chatId, message)
       } else if (text.startsWith('/reclaim')) {
         await sendTelegramMessage(chatId, "❌ Reclaim not supported via Telegram. Use the dashboard for secure private key entry.")
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
  if (!token) return
  
  const url = `https://api.telegram.org/bot${token}/sendMessage`
  await $fetch(url, {
    method: 'POST',
    body: {
      chat_id: chatId,
      text: text,
    }
  })
}
