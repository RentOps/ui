import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  try {
    const whitelistPath = path.resolve(process.cwd(), '../whitelist.json')
    
    // Ensure we are saving a valid structure
    const dataToSave = {
      accounts: Array.isArray(body.accounts) ? body.accounts : [],
      programs: Array.isArray(body.programs) ? body.programs : []
    }
    
    fs.writeFileSync(whitelistPath, JSON.stringify(dataToSave, null, 2))
    
    return { success: true }
  } catch (e) {
    console.error('[ERROR] Failed to save whitelist:', e)
    throw createError({ statusCode: 500, message: 'Failed to save whitelist' })
  }
})
