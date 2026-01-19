export default defineEventHandler(async (event) => {
  try {
    const response: any = await $fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
    return response
  } catch (error) {
    console.error('Failed to fetch SOL price from CoinGecko:', error)
    // Return empty object or handle error so frontend falls back
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to fetch price from upstream provider'
    })
  }
})
