<script setup lang="ts">
import NumberTicker from '../components/NumberTicker.vue'
import Analytics from '../components/Analytics.vue'
import Docs from '../components/Docs.vue'
import BarChartInteractive from '../components/charts/BarChartInteractive.vue'
import {
  DashboardSquare01Icon,
  Coins01Icon,
  Blockchain03Icon,
  Alert02Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  Cancel01Icon,
  Menu01Icon,
  Settings02Icon,
  Logout03Icon,
  Activity01Icon,
  Search01Icon,
  PlusSignIcon,
  PencilEdit02Icon,
  Delete02Icon,
  GlobalIcon,
  LockPasswordIcon,
  SecurityIcon,
  Copy01Icon,
  Link01Icon,
  AnalysisTextLinkIcon,
  Delete01Icon,
  Home03Icon,
  BookOpen01Icon
} from 'hugeicons-vue'

const { data: stats, refresh } = await useFetch('/api/stats')
const selectedReclaim = ref<any>(null)
const showScanModal = ref(false)
const showClearModal = ref(false)
const showMobileMenu = ref(false)
const scanNodes = ref<{ address: string, nickname: string, isEditing: boolean }[]>([])
const scanNetwork = ref({ type: 'mainnet', customUrl: '' })

function clearSession() {
  localStorage.clear()
  window.location.reload()
}

// Load from localStorage or use default
onMounted(() => {
  const savedNodes = localStorage.getItem('rentops_nodes')
  const savedNetwork = localStorage.getItem('rentops_network')
  
  if (savedNodes) {
    try { scanNodes.value = JSON.parse(savedNodes) } catch (e) {}
  }
  if (savedNetwork) {
    try { scanNetwork.value = JSON.parse(savedNetwork) } catch (e) {}
  }
  
  if (scanNodes.value.length === 0) {
    scanNodes.value = [{ address: '7xKXtg2CW87d3HEQ2BpKHpcPKBhpKGQPPRQJyccVLow9', nickname: 'Devnet Demo Node', isEditing: false }]
  }

  checkHealth()
  setInterval(refresh, 30000)
})

// Save to localStorage
watch([scanNodes, scanNetwork], ([newNodes, newNetwork]) => {
  localStorage.setItem('rentops_nodes', JSON.stringify(newNodes))
  localStorage.setItem('rentops_network', JSON.stringify(newNetwork))
}, { deep: true })

const isScanning = ref(false)
const isReclaiming = ref(false)
const showSummaryModal = ref(false)
const showWhitelistModal = ref(false)
const whitelistAccounts = ref<string[]>([])
const scanResults = ref<{ totalFound: number, nodeResults: any[] }>({ totalFound: 0, nodeResults: [] })
const currentScanIndex = ref(0)
const currentScanNode = ref('')
const statHoverKeys = ref([0, 0, 0, 0])
const logFilter = ref('all')
const currentTab = ref('home')
const solPrice = ref(150) // default fallback

async function openWhitelistModal() {
  try {
    const data: any = await $fetch('/api/whitelist')
    whitelistAccounts.value = data.accounts || []
    showWhitelistModal.value = true
  } catch (e) {
    alert('Failed to load whitelist')
  }
}

async function saveWhitelist() {
  try {
    await $fetch('/api/whitelist', {
      method: 'POST',
      body: {
        accounts: whitelistAccounts.value.filter(a => a.trim())
      }
    })
    showWhitelistModal.value = false
    alert('Whitelist updated successfully')
  } catch (e) {
    alert('Failed to save whitelist')
  }
}

function addWhitelistAccount() {
  whitelistAccounts.value.push('')
}

function removeWhitelistAccount(index: number) {
  whitelistAccounts.value.splice(index, 1)
}

async function reclaimRent(reclaim: any) {
  const privateKey = prompt(
    'Enter your authority private key (base58 or JSON array):\n\n' +
    '  Your key is ONLY used for this transaction and NOT stored.\n' +
    '  This should be the authority of the account being closed.'
  )
  
  if (!privateKey || !privateKey.trim()) {
    alert('Private key required to sign transaction')
    return
  }

  if (!confirm(
    `  FINAL CONFIRMATION\n\n` +
    `Reclaim ${reclaim.amount} SOL from:\n${reclaim.account}\n\n` +
    `Your private key will be sent to the server for signing ONLY.\n` +
    `Are you sure?`
  )) return
  
  isReclaiming.value = true
  try {
    const res: any = await $fetch('/api/reclaim', {
      method: 'POST',
      body: {
        account: reclaim.account,
        koraNode: reclaim.koraNode,
        network: scanNetwork.value.type,
        privateKey: privateKey.trim()
      }
    })
    
    if (res.success) {
      logs.value.unshift({
        id: Date.now(),
        type: 'success',
        account: reclaim.account,
        reason: 'RECLAIM_EXECUTED',
        amount: `-${res.amount.toFixed(6)}`,
        tx: res.tx,
        timestamp: new Date().toLocaleTimeString()
      })
      
      reclaim.currentStatus = 'reclaimed'
      selectedReclaim.value = { ...reclaim, currentStatus: 'reclaimed' }
      
      alert(`Success!\n\nReclaimed ${res.amount.toFixed(6)} SOL\nTX: ${res.tx}`)
      refresh()
    } else {
      alert(`Error: ${res.message || res.error}`)
    }
  } catch (e: any) {
    alert(`Failed: ${e.data?.message || e.message}`)
  } finally {
    isReclaiming.value = false
  }
}


const scanProgress = computed(() => {
  const activeNodes = scanNodes.value.filter(n => n.address.trim())
  if (activeNodes.length === 0) return 0
  return ((currentScanIndex.value) / activeNodes.length) * 100
})
const logs = ref<any[]>([])

// Initial logs
logs.value = []

const filteredLogs = computed(() => {
  if (logFilter.value === 'all') return logs.value
  return logs.value.filter(log => 
    log.type === logFilter.value || 
    log.koraNode === logFilter.value
  )
})

const solPerNodeData = computed(() => {
  const nodeMap = new Map()
  logs.value.forEach(log => {
    if (log.type === 'detected' && log.koraNode) {
      const amount = parseFloat(log.amount)
      const current = nodeMap.get(log.koraNode) || { name: log.koraNode.slice(0, 8) + '...', sol: 0 }
      current.sol += amount
      nodeMap.set(log.koraNode, current)
    }
  })
  return Array.from(nodeMap.values()).sort((a, b) => b.sol - a.sol)
})

function addNode() {
  scanNodes.value.push({ address: '', nickname: 'New Node', isEditing: true })
}

function removeNode(index: number) {
  scanNodes.value.splice(index, 1)
}

function toggleEdit(index: number) {
  scanNodes.value[index].isEditing = !scanNodes.value[index].isEditing
}

function getNodeNickname(address: string) {
  if (!address) return 'SYSTEM'
  const node = scanNodes.value.find(n => n.address === address)
  return node ? node.nickname : (address.slice(0, 8) + '...')
}

async function triggerScan() {
  const activeNodes = scanNodes.value.filter(n => n.address.trim())
  
  if (activeNodes.length === 0) {
    alert('Please enter at least one wallet address.')
    return
  }

  // Reset state
  showScanModal.value = false
  isScanning.value = true
  currentScanIndex.value = 0
  scanResults.value = { totalFound: 0, nodeResults: [] }

  const network = scanNetwork.value.type
  const customRpc = scanNetwork.value.customUrl

  try {
    for (let i = 0; i < activeNodes.length; i++) {
      const node = activeNodes[i]
      currentScanIndex.value = i
      currentScanNode.value = node.address

      // Call API for single node
      const res: any = await $fetch('/api/scan', { 
        method: 'POST',
        body: { 
          koraNodes: [node.address], // Send as array of 1
          network, 
          customRpc 
        }
      })
      
      // Process results
      if (res.logs && res.logs.length > 0) {
        // Filter out summary/info logs for the main stream if needed, or keep them
        logs.value = [...res.logs, ...logs.value]
      }

      // Extract specific stats for this node from the response (we might need to tweak API to return stats cleanly)
      // For now, calculate from logs returned
      const foundCount = res.logs.filter((l: any) => l.type === 'detected').length
      
      scanResults.value.nodeResults.push({
        nickname: node.nickname,
        address: node.address,
        found: foundCount,
        status: foundCount > 0 ? 'success' : 'empty'
      })
      scanResults.value.totalFound += foundCount
      
      // Small artificial delay for UX so they see the bar move
      await new Promise(r => setTimeout(r, 800))
    }

    // Done
    isScanning.value = false
    await fetchSolPrice()
    showSummaryModal.value = true
    refresh()
    
  } catch (e) {
    isScanning.value = false
    alert('Scan interrupted: ' + e.message)
  }
}

function openDrawer(reclaim: any) {
  if (reclaim.type !== 'info' && reclaim.type !== 'system') {
    selectedReclaim.value = reclaim
  }
}

async function fetchSolPrice() {
  try {
    const data: any = await $fetch('/api/price')
    if (data && data.solana && data.solana.usd) {
      solPrice.value = data.solana.usd
    }
  } catch (e) {
    console.warn('Failed to fetch SOL price, using default')
  }
}

async function checkHealth() {
  try {
    await $fetch('/api/health')
    logs.value.push({
      id: 0,
      type: 'system',
      account: 'CORE',
      reason: 'RentOps Neural Network: Online',
      amount: 'OK',
      tx: '-',
      timestamp: new Date().toLocaleTimeString()
    })
  } catch (e) {
    logs.value[0] = {
      id: 0,
      type: 'error',
      account: 'SYSTEM',
      reason: 'Backend Offline',
      amount: 'ERR',
      tx: '-',
      timestamp: new Date().toLocaleTimeString()
    }
  }
}
</script>

<template>
  <div class="p-4 md:p-8 max-w-[1600px] mx-auto font-oswald relative">
    <!-- Header -->
    <header class="flex justify-between items-center mb-12 border-b border-gray-900 pb-6 relative">
      <div class="flex items-center gap-4 w-1/3">
        <div class="bg-[#cc5500] p-3 text-black">
          <DashboardSquare01Icon size="32" stroke-width="2" />
        </div>
        <div class="hidden sm:block">
          <h2 class="text-[#cc5500] text-sm font-bold uppercase tracking-[0.2em] mb-1">Operator Dashboard</h2>
          <h1 class="text-3xl font-bold tracking-tighter">RENTOPS<span class="text-[#cc5500]">.SYS</span></h1>
        </div>
      </div>

      <!-- Centered Tab Switcher (Desktop) -->
      <div class="hidden md:flex justify-center w-1/3">
         <div class="flex bg-black border border-gray-800 p-1">
          <button 
            @click="currentTab = 'home'"
            :class="[
              'px-6 py-2 text-xs font-bold uppercase tracking-widest transition-colors border border-transparent flex items-center gap-2',
              currentTab === 'home' ? 'bg-[#cc5500] text-black border-black' : 'text-gray-500 hover:text-white'
            ]"
          >
            <Home03Icon size="16" /> Home
          </button>
          <div class="w-px bg-gray-800 my-1 mx-1"></div>
          <button 
            @click="currentTab = 'analytics'"
            :class="[
              'px-6 py-2 text-xs font-bold uppercase tracking-widest transition-colors border border-transparent flex items-center gap-2',
              currentTab === 'analytics' ? 'bg-[#cc5500] text-black border-black' : 'text-gray-500 hover:text-white'
            ]"
          >
            <AnalysisTextLinkIcon size="16" /> Analytics
          </button>
          <div class="w-px bg-gray-800 my-1 mx-1"></div>
          <button 
            @click="currentTab = 'docs'"
            :class="[
              'px-6 py-2 text-xs font-bold uppercase tracking-widest transition-colors border border-transparent flex items-center gap-2',
              currentTab === 'docs' ? 'bg-[#cc5500] text-black border-black' : 'text-gray-500 hover:text-white'
            ]"
          >
            <BookOpen01Icon size="16" /> Docs
          </button>
         </div>
      </div>

      <!-- Mobile Menu Trigger -->
      <div class="md:hidden">
        <button @click="showMobileMenu = !showMobileMenu" class="p-2 text-gray-400 hover:text-[#cc5500]">
          <Menu01Icon size="32" />
        </button>
      </div>
      
      <!-- Right Side Status (Desktop) -->
      <div class="hidden md:block text-right w-1/3">
        <div class="flex justify-end items-center gap-6">
          <div class="flex flex-col items-end">
            <div class="text-[10px] text-gray-600 uppercase tracking-widest">System Status</div>
            <div class="text-[#cc5500] font-bold text-xs flex items-center gap-2 justify-end uppercase tracking-tighter">
              <div class="w-2 h-2 bg-[#cc5500] rounded-full animate-pulse"></div>
              OPERATIONAL
            </div>
          </div>
          
          <button 
            @click="showClearModal = true"
            class="group p-2 border border-gray-800 hover:border-red-500 hover:bg-red-500/10 transition-colors"
            title="Reset Session"
          >
            <Logout03Icon size="20" class="text-gray-600 group-hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Menu Overlay -->
    <transition name="fade">
      <div v-if="showMobileMenu" class="md:hidden fixed inset-0 z-[100] bg-black/95 flex flex-col p-8 backdrop-blur-md">
        <div class="flex justify-between items-center mb-12">
          <h2 class="text-2xl font-black tracking-tighter uppercase">RENTOPS<span class="text-[#cc5500]">.SYS</span></h2>
          <button @click="showMobileMenu = false" class="text-gray-500"><Cancel01Icon size="32" /></button>
        </div>
        
        <nav class="flex flex-col gap-4">
          <button @click="currentTab = 'home'; showMobileMenu = false" class="flex items-center gap-4 text-left py-6 px-4 border border-gray-900 font-bold uppercase tracking-widest hover:bg-[#cc5500] hover:text-black transition-colors">
            <Home03Icon /> Home
          </button>
          <button @click="currentTab = 'analytics'; showMobileMenu = false" class="flex items-center gap-4 text-left py-6 px-4 border border-gray-900 font-bold uppercase tracking-widest hover:bg-[#cc5500] hover:text-black transition-colors">
            <AnalysisTextLinkIcon /> Analytics
          </button>
          <button @click="currentTab = 'docs'; showMobileMenu = false" class="flex items-center gap-4 text-left py-6 px-4 border border-gray-900 font-bold uppercase tracking-widest hover:bg-[#cc5500] hover:text-black transition-colors">
            <BookOpen01Icon /> Docs
          </button>
          <div class="grid grid-cols-2 gap-4 mt-4">
            <button @click="showScanModal = true; showMobileMenu = false" class="flex flex-col items-center gap-2 justify-center py-6 border border-gray-900 text-xs font-bold uppercase tracking-widest hover:border-[#cc5500] hover:text-[#cc5500]">
              <Search01Icon /> Scan
            </button>
            <button @click="openWhitelistModal(); showMobileMenu = false" class="flex flex-col items-center gap-2 justify-center py-6 border border-gray-900 text-xs font-bold uppercase tracking-widest hover:border-[#cc5500] hover:text-[#cc5500]">
              <SecurityIcon /> Whitelist
            </button>
          </div>
          <button @click="showClearModal = true; showMobileMenu = false" class="mt-8 flex items-center justify-center gap-4 py-6 border border-red-900/50 text-red-500 font-bold uppercase tracking-widest hover:bg-red-500 hover:text-black transition-colors">
            <Logout03Icon /> Reset Session
          </button>
        </nav>
      </div>
    </transition>
    
    
    <div v-if="currentTab === 'home'" class="space-y-0">
      <!-- Stats Cards Row (Clustered) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-gray-900 bg-[#050505] mb-8">
        <div 
          v-for="(stat, index) in [
            { label: 'Total Locked SOL', value: stats?.totalLocked || 0, icon: Blockchain03Icon, color: 'text-white', precision: 4 },
            { label: 'Total Reclaimed', value: stats?.totalReclaimed || 0, icon: CheckmarkCircle02Icon, color: 'text-[#cc5500]', precision: 4 },
            { label: 'Active Accounts', value: stats?.activeAccounts || 0, icon: Activity01Icon, color: 'text-white', precision: 0 },
            { label: 'Idle Rent Value', value: (stats?.idleRent || 0) * solPrice, icon: Coins01Icon, color: 'text-[#cc5500]', precision: 2, prefix: '$' }
          ]" 
          :key="index"
          class="relative overflow-hidden p-6 group hover:bg-[#111] transition-colors border-b md:border-b-0 md:border-r border-gray-900 last:border-r-0 lg:border-b-0"
          @mouseenter="statHoverKeys[index]++"
        >
          <!-- Background Icon -->
          <component 
            :is="stat.icon" 
            class="absolute -bottom-6 -right-6 text-white/5 group-hover:text-[#cc5500]/10 transition-all duration-500 ease-out group-hover:scale-110 group-hover:-rotate-12 pointer-events-none"
            :size="140"
          />

          <div class="relative z-10">
            <div class="flex justify-between items-start mb-4">
              <component :is="stat.icon" size="24" :class="stat.color" />
              <span class="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Live .SYS</span>
            </div>
            <p class="text-gray-500 text-xs uppercase tracking-[0.2em] mb-1">{{ stat.label }}</p>
            <div class="flex items-baseline gap-1">
              <span v-if="stat.prefix" class="text-gray-500 text-xl font-light">{{ stat.prefix }}</span>
              <NumberTicker :value="stat.value" :precision="stat.precision" />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid (Clustered) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-gray-900">
        <!-- Column 1: Reclamation Stream (Live Feed) -->
        <div class="bg-[#050505] overflow-hidden flex flex-col h-full max-h-[800px] border-b lg:border-b-0 lg:border-r border-gray-900">
          <div class="bg-gray-900/50 px-6 py-3 flex flex-col gap-3 border-b border-gray-800 flex-shrink-0">
            <div class="flex justify-between items-center">
              <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                <Activity01Icon size="14" class="animate-pulse text-[#cc5500]" /> Real-time Scan Feed
              </h3>
              <span class="text-[10px] font-mono text-gray-600 uppercase">Buffer: {{ logs.length }} events</span>
            </div>
            
            <!-- Node Filters -->
             <div class="flex gap-2 overflow-x-auto custom-scrollbar pb-1" v-if="scanNodes.filter(n => n.address.trim()).length > 0">
               <button 
                  @click="logFilter = 'all'"
                  :class="[
                    'px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors border whitespace-nowrap',
                    logFilter === 'all' || ['detected', 'success', 'error'].includes(logFilter) 
                      ? 'bg-gray-800 text-white border-gray-700' 
                      : 'text-gray-600 border-transparent hover:text-white hover:border-gray-800'
                  ]"
                >
                  ALL NODES
                </button>
                <button 
                  v-for="node in scanNodes.filter(n => n.address.trim())" 
                  :key="node.address"
                  @click="logFilter = node.address"
                  :class="[
                    'px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors border whitespace-nowrap',
                    logFilter === node.address 
                      ? 'bg-[#cc5500]/20 text-[#cc5500] border-[#cc5500]' 
                      : 'text-gray-500 border-gray-900 hover:text-gray-300 hover:border-gray-700'
                  ]"
                >
                  {{ node.nickname }}
                </button>
             </div>
          </div>
          
          <div class="overflow-y-auto custom-scrollbar flex-grow">
            <table class="w-full text-left border-collapse">
              <thead class="sticky top-0 bg-[#050505] z-10">
                <tr class="text-[10px] uppercase text-gray-600 border-b border-gray-900">
                  <th class="px-6 py-4 font-bold tracking-widest">Type</th>
                  <th class="px-6 py-4 font-bold tracking-widest">Account / Node</th>
                  <th class="px-6 py-4 font-bold tracking-widest">Reason / Status</th>
                  <th class="px-6 py-4 font-bold tracking-widest text-right">Amount</th>
                  <th class="px-6 py-4 font-bold tracking-widest text-right">Time</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-900/50">
                <tr 
                  v-for="log in filteredLogs" 
                  :key="log.id" 
                  @click="openDrawer(log)"
                  class="group hover:bg-[#cc5500]/5 cursor-pointer transition-colors"
                >
                  <td class="px-6 py-4">
                    <span 
                      :class="[
                        'text-[9px] font-black uppercase px-2 py-0.5 tracking-tighter',
                        log.reason === 'RECLAIMABLE' ? 'bg-[#cc5500]/20 text-[#cc5500] border border-[#cc5500]' :
                        log.reason === 'USER_OWNED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        log.type === 'detected' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 
                        log.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                        log.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        'bg-gray-800 text-gray-400'
                      ]"
                    >
                      {{ log.reason === 'RECLAIMABLE' ? 'ACTION_REQ' : (log.reason === 'USER_OWNED' ? 'SPONSORED' : log.type) }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="text-sm font-mono text-gray-300 group-hover:text-white transition-colors">{{ log.account ? log.account.slice(0, 4) + '...' + log.account.slice(-4) : 'N/A' }}</span>
                      <span class="text-[9px] text-gray-600 uppercase font-bold">{{ getNodeNickname(log.koraNode) }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-xs text-gray-400 group-hover:text-gray-200 transition-colors uppercase tracking-tight">{{ log.reason }}</span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span :class="['font-mono text-sm', log.type === 'success' ? 'text-[#cc5500]' : 'text-gray-300']">
                      {{ log.amount }} <span v-if="log.amount !== 'OK' && log.amount !== 'ERR'" class="text-[10px] text-gray-600">SOL</span>
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span class="text-[10px] font-mono text-gray-600">{{ log.timestamp }}</span>
                  </td>
                </tr>
                <tr v-if="filteredLogs.length === 0">
                  <td colspan="5" class="px-6 py-20 text-center">
                    <div class="flex flex-col items-center gap-4">
                      <Blockchain03Icon size="48" class="text-gray-800" />
                      <p class="text-gray-600 uppercase text-xs tracking-[0.2em]">No operational data available</p>
                      <button @click="showScanModal = true" class="text-[#cc5500] text-[10px] font-bold uppercase border-b border-[#cc5500] pb-1 hover:text-white hover:border-white transition-all">Initialize First Scan</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Col 2: Chart & Command Center -->
        <div class="flex flex-col gap-0 bg-[#050505]">
           <!-- Row 1: Chart (SOL Locked per Node) -->
           <div class="flex flex-col gap-0 border-b border-gray-900 p-6">
              <!-- Using BarChartInteractive as "SOL Locked per Node" visual -->
              <BarChartInteractive :logs="logs" />
              
              <!-- Indepth Analytics Button -->
              <button 
                @click="currentTab = 'analytics'"
                class="self-end mt-4 py-3 px-6 border border-[#cc5500] text-[#cc5500] hover:bg-[#cc5500] hover:text-black transition-all duration-300 uppercase font-bold tracking-widest text-xs flex items-center gap-2 group"
              >
                Indepth Analytics <AnalysisTextLinkIcon size="16" class="group-hover:translate-x-1 transition-transform" />
              </button>
           </div>

           <!-- Row 2: Command Center -->
            <div class="h-full flex flex-col">
               <h3 class="text-xs font-bold uppercase tracking-[0.2em] py-4 px-6 text-gray-400 border-b border-gray-900 bg-[#050505]">Command Center</h3>
               
               <div class="flex flex-col flex-grow">
                  <!-- Action Buttons Row -->
                  <div class="flex border-b border-gray-900">
                    <button 
                      @click="showScanModal = true"
                      class="flex-1 py-6 bg-[#cc5500] text-black font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-white transition-colors"
                    >
                      <Search01Icon size="16" /> Initialize Scan
                    </button>
                    <div class="w-px bg-gray-900"></div>
                    <button 
                      @click="openWhitelistModal"
                      class="flex-1 py-6 bg-[#050505] text-gray-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:text-white hover:bg-[#111] transition-colors"
                    >
                      <SecurityIcon size="16" /> Whitelist
                    </button>
                  </div>

                  <!-- Filter Row -->
                  <div class="bg-[#050505] p-4 flex justify-between items-center flex-grow">
                     <span class="text-[10px] text-gray-500 uppercase font-bold px-2">Log Filter</span>
                     <div class="flex bg-[#111] border border-gray-900 p-1 gap-1">
                        <button 
                          v-for="filter in ['all', 'detected', 'success']" 
                          :key="filter"
                          @click="logFilter = filter"
                          :class="[
                            'px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors',
                            logFilter === filter ? 'bg-gray-800 text-white' : 'text-gray-600 hover:text-gray-300'
                          ]"
                        >
                          {{ filter }}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
        </div>
      </div>
    </div>
    
    <!-- Analytics Tab -->
    <Analytics v-else-if="currentTab === 'analytics'" :logs="logs" :scan-nodes="scanNodes" />
    
    <!-- Docs Tab -->
    <Docs v-else-if="currentTab === 'docs'" />

    <!-- SCAN MODAL -->
    <div v-if="showScanModal" class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" @click.self="showScanModal = false">
      <div class="w-full max-w-xl bg-[#050505] border border-[#cc5500]">
        <div class="bg-[#cc5500] text-black px-4 py-2 text-xs font-bold flex justify-between uppercase items-center">
          <span>Target Configuration</span>
          <button @click="showScanModal = false" class="hover:text-white transition-colors">
            <Cancel01Icon size="16" />
          </button>
        </div>
        <div class="p-6">
          <!-- Network Selector -->
          <div class="mb-6 border-b border-gray-800 pb-6">
            <div class="flex justify-between items-center mb-3">
              <p class="text-gray-400 text-sm uppercase tracking-widest flex items-center gap-2">
                <GlobalIcon size="14" /> Target Network
              </p>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <button 
                v-for="net in ['mainnet', 'devnet', 'custom']" 
                :key="net"
                @click="scanNetwork.type = net"
                :class="[
                  'py-2 border text-xs font-bold uppercase tracking-wider transition-colors',
                  scanNetwork.type === net 
                    ? 'border-[#cc5500] bg-[#cc5500]/10 text-[#cc5500]' 
                    : 'border-gray-800 bg-[#111] text-gray-500 hover:border-gray-600'
                ]"
              >
                {{ net }}
              </button>
            </div>
            <div v-if="scanNetwork.type === 'custom'" class="mt-3">
              <input 
                v-model="scanNetwork.customUrl"
                class="bg-black border border-gray-700 text-gray-300 p-2 font-mono text-xs w-full focus:border-[#cc5500] focus:outline-none transition-colors"
                placeholder="Enter Custom RPC URL..."
              />
            </div>
          </div>

          <div class="flex justify-between items-center mb-4">
            <p class="text-gray-400 text-sm uppercase tracking-widest">Kora Nodes</p>
            <button @click="addNode" class="text-[#cc5500] text-xs uppercase font-bold hover:text-white transition-colors flex items-center gap-1">
              <PlusSignIcon size="14" /> Add Node
            </button>
          </div>

          <div class="space-y-3 mb-8 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            <div v-for="(node, index) in scanNodes" :key="index" class="bg-[#111] border border-gray-800 p-3 flex flex-col gap-2">
              <div class="flex justify-between items-center">
                <div v-if="!node.isEditing" class="flex items-center gap-2">
                  <span class="text-[#cc5500] font-bold text-xs uppercase">{{ node.nickname }}</span>
                  <button @click="toggleEdit(index)" class="text-gray-600 hover:text-white"><PencilEdit02Icon size="12" /></button>
                </div>
                <input 
                  v-else 
                  v-model="node.nickname" 
                  @blur="toggleEdit(index)"
                  @keyup.enter="toggleEdit(index)"
                  class="bg-black border border-gray-700 text-xs text-[#cc5500] font-bold uppercase p-1 w-32 focus:outline-none focus:border-[#cc5500]"
                  autoFocus
                />
                
                <button v-if="scanNodes.length > 1" @click="removeNode(index)" class="text-gray-600 hover:text-red-500 transition-colors">
                  <Delete02Icon size="14" />
                </button>
              </div>
              <input 
                v-model="node.address"
                class="bg-black border border-gray-700 text-gray-300 p-2 font-mono text-xs w-full focus:border-[#cc5500] focus:outline-none transition-colors"
                placeholder="Enter Kora Public Key..."
              />
            </div>
          </div>
          
          <button 
            @click="triggerScan"
            class="w-full py-4 bg-[#cc5500] text-black hover:bg-white transition-colors uppercase font-bold tracking-widest text-sm flex items-center justify-center gap-2"
          >
            <span class="flex items-center gap-2"><Search01Icon size="18" /> Start Deep Scan</span>
          </button>
        </div>
      </div>
    </div>

    <!-- WHITELIST MODAL -->
    <div v-if="showWhitelistModal" class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" @click.self="showWhitelistModal = false">
      <div class="w-full max-w-xl bg-[#050505] border border-[#cc5500]">
        <div class="bg-[#cc5500] text-black px-4 py-2 text-xs font-bold flex justify-between uppercase items-center">
          <span>Whitelist Configuration</span>
          <button @click="showWhitelistModal = false" class="hover:text-white transition-colors">
            <Cancel01Icon size="16" />
          </button>
        </div>
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <p class="text-gray-400 text-sm uppercase tracking-widest">Protected Accounts</p>
            <button @click="addWhitelistAccount" class="text-[#cc5500] text-xs uppercase font-bold hover:text-white transition-colors flex items-center gap-1">
              <PlusSignIcon size="14" /> Add Account
            </button>
          </div>

          <div class="space-y-3 mb-8 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            <div v-if="whitelistAccounts.length === 0" class="text-gray-600 text-xs text-center py-4 border border-gray-900 border-dashed">
              No accounts in whitelist
            </div>
            <div v-for="(acc, index) in whitelistAccounts" :key="index" class="bg-[#111] border border-gray-800 p-2 flex gap-2 items-center">
              <input 
                v-model="whitelistAccounts[index]"
                class="bg-black border border-gray-700 text-gray-300 p-2 font-mono text-xs w-full focus:border-[#cc5500] focus:outline-none transition-colors"
                placeholder="Enter Address..."
              />
              <button @click="removeWhitelistAccount(index)" class="text-gray-600 hover:text-red-500 transition-colors p-2">
                <Delete02Icon size="14" />
              </button>
            </div>
          </div>
          
          <button 
            @click="saveWhitelist"
            class="w-full py-4 bg-[#cc5500] text-black hover:bg-white transition-colors uppercase font-bold tracking-widest text-sm flex items-center justify-center gap-2"
          >
            <span class="flex items-center gap-2"><CheckmarkCircle02Icon size="18" /> Save Changes</span>
          </button>
        </div>
      </div>
    </div>

    <!-- FULL SCREEN LOADER WITH SEGMENTED BAR -->
    <transition name="fade">
      <div v-if="isScanning" class="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center font-mono">
        <!-- Top Segmented Bar -->
        <div class="absolute top-0 left-0 w-full h-2 bg-gray-900 flex gap-[1px]">
          <div 
            v-for="(node, idx) in scanNodes.filter(n => n.address.trim())" 
            :key="idx"
            :class="['h-full flex-1 transition-colors duration-300', idx <= currentScanIndex ? 'bg-[#cc5500]' : 'bg-gray-800']"
          ></div>
        </div>

        <!-- Tinted Background -->
        <div class="absolute inset-0 z-0 opacity-20 bg-[#cc5500] mix-blend-overlay"></div>
        
        <div class="relative z-10 flex flex-col items-center gap-8 text-center max-w-2xl px-4">
          <div class="loader"></div>
          <h2 class="text-2xl text-white font-bold uppercase tracking-[0.3em] animate-pulse">Scanning Network</h2>
          
          <div class="space-y-2">
            <p class="text-[#cc5500] text-xs uppercase tracking-widest">Targeting Node [{{ currentScanIndex + 1 }}/{{ scanNodes.filter(n => n.address.trim()).length }}]</p>
            <p class="text-gray-400 text-sm font-mono break-all">{{ currentScanNode }}</p>
          </div>
        </div>
      </div>
    </transition>

    <!-- SUMMARY MODAL -->
    <div v-if="showSummaryModal" class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm" @click.self="showSummaryModal = false">
      <div class="w-full max-w-2xl bg-[#050505] border border-[#cc5500] flex flex-col max-h-[90vh]">
        <div class="bg-[#cc5500] text-black px-6 py-4 text-sm font-bold flex justify-between uppercase items-center">
          <span>Mission Report</span>
          <button @click="showSummaryModal = false" class="hover:text-white transition-colors">
            <Cancel01Icon size="20" />
          </button>
        </div>
        
        <div class="p-8 overflow-y-auto custom-scrollbar">
          <div class="text-center mb-10">
             <p class="text-gray-500 uppercase text-xs tracking-widest mb-2">Total Rent Opportunities Detected</p>
              <div class="text-6xl font-bold text-white mb-1">
                <NumberTicker :value="scanResults.totalFound" />
              </div>
              <p class="text-[#cc5500] font-mono text-sm">~{{ (scanResults.totalFound * 0.002).toFixed(4) }} SOL Locked ($<NumberTicker :value="(scanResults.totalFound * 0.002 * solPrice)" :precision="2" />)</p>
          </div>

          <div class="space-y-1">
            <div class="flex justify-between text-xs uppercase text-gray-500 px-4 mb-2">
              <span>Target Node</span>
              <span>Status</span>
            </div>
            <div v-for="(res, idx) in scanResults.nodeResults" :key="idx" class="bg-[#111] border border-gray-900 p-4 flex justify-between items-center group hover:border-gray-700 transition-colors">
              <div>
                <p class="text-[#cc5500] font-bold uppercase text-xs mb-1">{{ res.nickname }}</p>
                <p class="text-gray-600 font-mono text-[10px] break-all">{{ res.address }}</p>
              </div>
              <div class="text-right">
                <span v-if="res.found > 0" class="text-white font-bold text-lg">{{ res.found }} <span class="text-xs text-gray-500 font-normal">FOUND</span></span>
                <span v-else class="text-gray-600 text-xs font-bold uppercase">NO MATCHES</span>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-gray-900 bg-[#0a0a0a]">
          <button @click="showSummaryModal = false" class="w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-[#cc5500] transition-colors">
            Acknowledge
          </button>
        </div>
      </div>
    </div>

    <!-- DETAILS DRAWER -->
    <transition name="slide-right">
      <div v-if="selectedReclaim" class="fixed inset-y-0 right-0 w-full max-w-md bg-[#0a0a0a] border-l border-[#cc5500] shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 p-8 flex flex-col">
        <div class="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
          <h2 class="text-2xl font-bold uppercase text-[#cc5500]">Transaction Details</h2>
          <button @click="selectedReclaim = null" class="text-gray-500 hover:text-white transition-colors">
            <CancelCircleIcon size="24" />
          </button>
        </div>

        <div class="space-y-6 flex-1 overflow-y-auto">
          <div class="bg-black border border-gray-800 p-4">
            <p class="text-[10px] uppercase text-gray-500 mb-1">Status</p>
            <div class="flex items-center gap-2 text-white font-bold">
              <component :is="selectedReclaim.type === 'success' ? CheckmarkCircle02Icon : Alert02Icon" size="20" :class="selectedReclaim.type === 'success' ? 'text-[#cc5500]' : 'text-orange-500'" />
              {{ selectedReclaim.type === 'detected' ? 'RENT_DETECTED' : selectedReclaim.type.toUpperCase() }}
            </div>
          </div>

          <div>
            <p class="text-[10px] uppercase text-gray-500 mb-1">Target Account</p>
            <div class="flex items-center gap-2">
              <p class="font-mono text-xl tracking-wider text-gray-200">{{ selectedReclaim.account.slice(0, 8) }}...{{ selectedReclaim.account.slice(-8) }}</p>
              <button @click="navigator.clipboard.writeText(selectedReclaim.account)" class="text-gray-500 hover:text-white transition-colors" title="Copy Account">
                <Copy01Icon size="16" />
              </button>
              <a :href="`https://explorer.solana.com/account/${selectedReclaim.account}?cluster=${scanNetwork.type === 'mainnet' ? 'mainnet-beta' : 'devnet'}`" target="_blank" class="text-gray-500 hover:text-white transition-colors" title="View on Explorer">
                <Link01Icon size="16" />
              </a>
            </div>
          </div>

          <div>
            <p class="text-[10px] uppercase text-gray-500 mb-1">Source Node</p>
            <p class="font-mono text-sm tracking-wider text-gray-300">{{ selectedReclaim.koraNode ? selectedReclaim.koraNode.slice(0, 8) + '...' + selectedReclaim.koraNode.slice(-8) : 'N/A' }}</p>
          </div>

          <div>
            <p class="text-[10px] uppercase text-gray-500 mb-1">Reclaimed Amount</p>
            <p class="font-mono text-4xl text-[#cc5500]"><NumberTicker :value="parseFloat(selectedReclaim.amount)" :precision="6" /> <span class="text-sm text-gray-500">SOL</span></p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-[10px] uppercase text-gray-500 mb-1">Transaction Signature</p>
              <p class="font-mono text-xs text-gray-400 break-all">{{ selectedReclaim.tx }}</p>
            </div>
            <div>
              <p class="text-[10px] uppercase text-gray-500 mb-1">Timestamp</p>
              <p class="font-mono text-xs text-gray-400">{{ selectedReclaim.timestamp }}</p>
            </div>
          </div>

          <div>
            <p class="text-[10px] uppercase text-gray-500 mb-1">Reasoning</p>
            <p class="text-sm text-gray-300 border-l-2 border-gray-700 pl-3 py-1">{{ selectedReclaim.reason }}</p>
          </div>

          <!-- Ownership Warning -->
          <div v-if="selectedReclaim.reason === 'USER_OWNED'" class="bg-blue-900/20 border-l-2 border-blue-500 p-4">
             <p class="text-xs text-blue-400 font-bold uppercase mb-1">Sponsored Asset</p>
             <p class="text-[10px] text-gray-400 leading-relaxed">
               This account is owned by a user {{ selectedReclaim.currentOwner ? '(' + selectedReclaim.currentOwner.slice(0,8) + '...)' : '' }}. 
               The Kora node paid the rent, but does not have authority to close it. 
               Reclamation is only possible if you hold the user's private key.
             </p>
          </div>
        </div>

        <div class="mt-8 space-y-3">
          <button 
            v-if="selectedReclaim.currentStatus === 'active'"
            @click="reclaimRent(selectedReclaim)"
            :disabled="isReclaiming || (selectedReclaim.reason === 'USER_OWNED' && !confirm('You are attempting to close a User-Owned account. Do you hold the User\'s Private Key?'))"
            :class="[
              'block w-full py-4 font-bold uppercase tracking-widest transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed',
              selectedReclaim.reason === 'USER_OWNED' 
                ? 'bg-gray-800 text-gray-500 hover:bg-gray-700' 
                : 'bg-[#cc5500] text-black hover:bg-white'
            ]"
          >
            {{ isReclaiming ? 'Initiating...' : (selectedReclaim.reason === 'USER_OWNED' ? 'Authorize & Reclaim' : 'Reclaim Rent SOL') }}
          </button>
          
          <a :href="`https://explorer.solana.com/tx/${selectedReclaim.tx}?cluster=devnet`" target="_blank" class="block w-full py-4 border border-gray-800 text-gray-400 font-bold uppercase tracking-widest hover:border-[#cc5500] hover:text-[#cc5500] transition-colors text-center">
            View on Explorer
          </a>
        </div>
      </div>
    </transition>
    
    <!-- CLEAR SESSION MODAL -->
    <div v-if="showClearModal" class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" @click.self="showClearModal = false">
      <div class="w-full max-w-sm bg-[#050505] border border-red-900">
        <div class="bg-red-900/20 text-red-500 px-6 py-4 text-sm font-bold flex justify-between uppercase items-center border-b border-red-900/50">
          <span class="flex items-center gap-2"><Alert02Icon /> System Reset</span>
          <button @click="showClearModal = false" class="hover:text-white transition-colors">
            <Cancel01Icon size="20" />
          </button>
        </div>
        
        <div class="p-8 text-center">
          <PowerIcon size="48" class="text-red-500 mx-auto mb-6" />
          <h3 class="text-white font-bold uppercase tracking-widest mb-4">Confirm Reset</h3>
          <p class="text-gray-400 text-sm mb-8 leading-relaxed">
            This will clear all local configuration, cached nodes, and session history. The dashboard will reload to a fresh state.
          </p>
          
          <div class="grid grid-cols-2 gap-4">
            <button @click="showClearModal = false" class="py-3 border border-gray-800 text-gray-400 font-bold uppercase text-xs hover:text-white hover:border-gray-600 transition-colors">
              Cancel
            </button>
            <button @click="clearSession" class="py-3 bg-red-600 text-black font-bold uppercase text-xs hover:bg-red-500 transition-colors">
              Confirm Reset
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop for Drawer -->
    <transition name="fade">
      <div v-if="selectedReclaim" class="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm" @click="selectedReclaim = null"></div>
    </transition>
  </div>
</template>

<style scoped>
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}



/* Custom Loader */

.loader {
  width: 55px;
  aspect-ratio: 1;
  --g1: conic-gradient(from 90deg at 3px 3px, #0000 90deg, #fff 0);
  --g2: conic-gradient(from -90deg at 22px 22px, #0000 90deg, #fff 0);
  background: var(--g1), var(--g1), var(--g1), var(--g2), var(--g2), var(--g2);
  background-size: 25px 25px;
  background-repeat: no-repeat;
  animation: l7 1.5s infinite;
}

@keyframes l7 {
  0%   { background-position: 0 0, 0 100%, 100% 100%; }
  25%  { background-position: 100% 0, 0 100%, 100% 100%; }
  50%  { background-position: 100% 0, 0 0, 100% 100%; }
  75%  { background-position: 100% 0, 0 0, 0 100%; }
  100% { background-position: 100% 100%, 0 0, 0 100%; }
}

</style>