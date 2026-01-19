import { createSolanaRpc, address } from '@solana/kit'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { node } = body
  const heliusKey = process.env.HELIUS_RPC_API_KEY
  
  // Check Devnet
  const devnetUrl = heliusKey 
    ? `https://devnet.helius-rpc.com/?api-key=${heliusKey}` 
    : 'https://api.devnet.solana.com'
  
  // Check Mainnet
  const mainnetUrl = heliusKey 
    ? `https://mainnet.helius-rpc.com/?api-key=${heliusKey}` 
    : 'https://api.mainnet-beta.solana.com'

  const devnetRpc = createSolanaRpc(devnetUrl)
  const mainnetRpc = createSolanaRpc(mainnetUrl)

  const results = {
    devnet: { count: 0, signatures: [] },
    mainnet: { count: 0, signatures: [] }
  }

  try {
    const devSigs = await devnetRpc.getSignaturesForAddress(address(node), { limit: 5 }).send()
    results.devnet.count = devSigs.length
    results.devnet.signatures = devSigs.map(s => s.signature)
  } catch (e) {
    results.devnet.error = e.message
  }

  try {
    const mainSigs = await mainnetRpc.getSignaturesForAddress(address(node), { limit: 5 }).send()
    results.mainnet.count = mainSigs.length
    results.mainnet.signatures = mainSigs.map(s => s.signature)
  } catch (e) {
    results.mainnet.error = e.message
  }

  return results
})
