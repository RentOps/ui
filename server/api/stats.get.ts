// In-memory stats (resets on server restart)
let globalStats = {
  totalLocked: 0,
  totalReclaimed: 0,
  activeAccounts: 0,
  idleRent: 0
}

export default defineEventHandler(async (event) => {
  return globalStats
})

export { globalStats }