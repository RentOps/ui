import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    // Navigate up from .output/server/chunks/... or similar in prod, 
    // but for dev process.cwd() is usually the project root.
    // In the scanner.ts it was `path.resolve(process.cwd(), '../whitelist.json')`
    // Assuming process.cwd() is `rentops/ui` when running `npm dev` inside ui/
    // Checks for local dev environment
    const whitelistPath = path.resolve(process.cwd(), '../whitelist.json')
    
    if (fs.existsSync(whitelistPath)) {
      const content = fs.readFileSync(whitelistPath, 'utf-8')
      return JSON.parse(content)
    } else {
       // Fallback or create if not exists
       return { accounts: [], programs: [] }
    }
  } catch (e) {
    console.error('[ERROR] Failed to read whitelist:', e)
    throw createError({ statusCode: 500, message: 'Failed to read whitelist' })
  }
})
