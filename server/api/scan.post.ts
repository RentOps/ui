export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { koraNodes, network, customRpc } = body || {}

  if (!koraNodes || !Array.isArray(koraNodes) || koraNodes.length === 0) {
    throw createError({ statusCode: 400, message: 'Array of koraNodes addresses is required' })
  }

  const { scanForNode } = useScanner()
  let allLogs = []
  let totalFound = 0
  
  try {
    for (const node of koraNodes) {
      if (!node.trim()) continue
      const result = await scanForNode(node.trim(), { network, customRpc })
      totalFound += result.foundCount
      allLogs = [...allLogs, ...result.foundLogs]
    }
    
    return { 
      success: true, 
      message: `Scan complete. Found ${totalFound} transactions across ${koraNodes.length} nodes.`,
      logs: allLogs
    }
  } catch (e) {
    return { success: false, error: e.message }
  }
})