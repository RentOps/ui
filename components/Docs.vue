<script setup lang="ts">
import { 
  Folder01Icon, 
  File01Icon, 
  ArrowRight01Icon,
  Shield01Icon,
  Search01Icon,
  Coins01Icon
} from 'hugeicons-vue'

const categories = [
  {
    title: 'Core Concepts',
    items: [
      'The Rent Problem',
      'How Kora Sponsorship Works',
      'RentOps Architecture'
    ]
  },
  {
    title: 'Safety & Logic',
    items: [
      'Smart Classification',
      'Safe Reclamation',
      'Edge Case Handling'
    ]
  },
  {
    title: 'Operations',
    items: [
      'Running a Node',
      'Using the CLI',
      'Self-Hosting Guide'
    ]
  }
]

const activeDoc = ref('The Rent Problem')
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-0 border border-gray-900 bg-[#050505] h-[calc(100vh-200px)] overflow-hidden">
    <!-- Sidebar -->
    <div class="border-b lg:border-b-0 lg:border-r border-gray-900 bg-[#0a0a0a] flex flex-col h-full overflow-hidden">
      <div class="p-6 border-b border-gray-900 flex-shrink-0">
        <h3 class="text-sm font-bold uppercase tracking-[0.2em] text-[#cc5500]">Documentation</h3>
      </div>
      
      <div class="overflow-y-auto custom-scrollbar flex-1">
        <div v-for="category in categories" :key="category.title" class="mb-0">
          <div class="px-6 py-4 bg-black/50 border-b border-gray-900">
            <h4 class="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
              <Folder01Icon size="14" /> {{ category.title }}
            </h4>
          </div>
          <div>
            <button 
              v-for="item in category.items" 
              :key="item"
              @click="activeDoc = item"
              :class="[
                'w-full text-left px-8 py-3 text-xs uppercase tracking-wider font-medium border-b border-gray-900/50 transition-colors flex items-center justify-between group',
                activeDoc === item ? 'bg-[#cc5500]/10 text-[#cc5500] border-l-2 border-l-[#cc5500]' : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-l-transparent'
              ]"
            >
              {{ item }}
              <ArrowRight01Icon v-if="activeDoc === item" size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="lg:col-span-3 p-8 lg:p-12 overflow-y-auto custom-scrollbar bg-[#050505] h-full">
      <div class="max-w-3xl">
        <div class="mb-8 pb-4 border-b border-gray-800">
          <span class="text-[#cc5500] text-xs font-bold uppercase tracking-widest mb-2 block">/ Docs / {{ activeDoc }}</span>
          <h1 class="text-4xl font-bold text-white uppercase tracking-tighter">{{ activeDoc }}</h1>
        </div>

        <div class="prose prose-invert prose-orange max-w-none">
          
          <!-- DYNAMIC CONTENT -->
          <div v-if="activeDoc === 'The Rent Problem'">
            <p class="text-gray-400 text-lg leading-relaxed mb-6">
              Solana accounts require a minimum SOL balance to remain "rent-exempt" and store data on-chain. For a standard Token Account, this is approximately <strong>0.002039 SOL</strong>.
            </p>
            <p class="text-gray-400 text-lg leading-relaxed mb-6">
              While small individually, this cost scales linearly. A Kora operator onboarding 100,000 users will lock up <strong>~200 SOL</strong> in rent deposits. If users churn or abandon their wallets, this capital is effectively lost to the "Rent Graveyard."
            </p>
          </div>

          <div v-else-if="activeDoc === 'How Kora Sponsorship Works'">
            <div class="bg-[#111] border border-gray-800 p-6 mb-8">
              <h3 class="text-white font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <Coins01Icon size="18" class="text-[#cc5500]" /> The Paymaster Model
              </h3>
              <p class="text-sm text-gray-400">
                Kora nodes act as a <strong>Fee Payer</strong>. When a user transaction requires an account creation (e.g., a new ATA for USDC), the Kora node signs the transaction and pays the rent lamports. Crucially, the Kora node is the <strong>Payer</strong>, but the user's wallet becomes the <strong>Owner</strong>.
              </p>
            </div>
            <p class="text-gray-400 mb-4">
              This distinction is vital: <strong>Sponsorship does not equal Ownership.</strong> Standard Solana security rules prevent the Payer from closing an account they do not own.
            </p>
          </div>

          <div v-else-if="activeDoc === 'RentOps Architecture'">
            <p class="text-gray-400 mb-8">RentOps is built as a highly-available operational layer consisting of three core modules:</p>
            
            <!-- Visual Architecture Diagram -->
            <div class="relative py-8 px-4 bg-[#0a0a0a] border border-gray-800 mb-8 overflow-hidden">
              <div class="absolute inset-0 bg-[url('/bg.jpg')] opacity-10 mix-blend-overlay"></div>
              
              <div class="relative z-10 flex flex-col gap-8 items-center">
                <!-- Source -->
                <div class="w-48 p-4 bg-[#111] border border-gray-700 text-center">
                  <div class="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Source</div>
                  <div class="text-[#cc5500] font-bold">KORA NODE</div>
                </div>

                <div class="h-8 w-px bg-gray-700"></div>

                <!-- Engine -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                  <div class="p-4 border border-[#cc5500] bg-[#cc5500]/10 text-center">
                    <strong class="block text-white text-xs uppercase mb-2">1. Introspection</strong>
                    <p class="text-[10px] text-gray-400">Crawls transaction history to build sponsorship graph.</p>
                  </div>
                  
                  <div class="hidden md:flex items-center justify-center text-gray-600"><ArrowRight01Icon /></div>
                  
                  <div class="p-4 border border-[#cc5500] bg-[#cc5500]/10 text-center">
                    <strong class="block text-white text-xs uppercase mb-2">2. Validation</strong>
                    <p class="text-[10px] text-gray-400">Verifies ownership & live balance via RPC.</p>
                  </div>
                </div>

                <div class="h-8 w-px bg-gray-700"></div>

                <!-- Action -->
                <div class="w-48 p-4 bg-[#111] border border-gray-700 text-center">
                  <div class="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Execution</div>
                  <div class="text-white font-bold">SECURE SIGNER</div>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div class="border border-gray-800 p-4 border-l-4 border-l-[#cc5500]">
                <strong class="text-white uppercase text-xs block mb-2">The Introspection Engine</strong>
                <p class="text-sm text-gray-400">A high-performance scanner that crawls the Kora Node's transaction signatures to build a graph of all subsidized account creations.</p>
              </div>
              <div class="border border-gray-800 p-4 border-l-4 border-l-[#cc5500]">
                <strong class="text-white uppercase text-xs block mb-2">State Validator</strong>
                <p class="text-sm text-gray-400">A real-time checker that uses batch RPC calls to verify current account balances, owners, and closure authorities.</p>
              </div>
              <div class="border border-gray-800 p-4 border-l-4 border-l-[#cc5500]">
                <strong class="text-white uppercase text-xs block mb-2">Secure Signer</strong>
                <p class="text-sm text-gray-400">Utilizes the modern @solana/kit (v2) stack to construct and sign atomic reclamation transactions with strict pre-computation validation.</p>
              </div>
            </div>
          </div>

          <div v-else-if="activeDoc === 'Smart Classification'">
            <p class="text-gray-400 text-lg leading-relaxed mb-6">
              RentOps uses a dual-layer detection engine to classify rent-locked accounts:
            </p>
            <ul class="space-y-4 text-gray-400">
              <li class="flex gap-4">
                <div class="w-8 h-8 rounded-full bg-[#cc5500]/20 flex items-center justify-center text-[#cc5500] font-bold">1</div>
                <div>
                  <strong class="text-white block">RECLAIMABLE (Action Required)</strong>
                  Accounts where the Kora Node is the <strong>Authority</strong>. These are often intermediate accounts or specific ATA configurations. RentOps allows immediate, one-click closure.
                </div>
              </li>
              <li class="flex gap-4">
                <div class="w-8 h-8 rounded-full bg-blue-900/20 flex items-center justify-center text-blue-400 font-bold">2</div>
                <div>
                  <strong class="text-white block">SPONSORED (User Owned)</strong>
                  Accounts funded by the node but owned by a user. RentOps identifies these to track capital exposure but prevents unilateral closure, respecting Solana's permission model.
                </div>
              </li>
            </ul>
          </div>

          <div v-else-if="activeDoc === 'Safe Reclamation'">
            <div class="bg-[#111] border border-gray-800 p-6 mb-8">
              <h3 class="text-white font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <Shield01Icon size="18" class="text-green-500" /> Safety First Architecture
              </h3>
              <p class="text-sm text-gray-400">
                RentOps will never accidentally burn user assets. Before constructing a reclamation transaction, the engine performs atomic checks:
              </p>
            </div>
            <ul class="space-y-2 text-gray-400 list-disc pl-5 marker:text-[#cc5500]">
              <li><strong>Zero Balance Check:</strong> Ensures the token account is completely empty. If tokens exist, the bot aborts and warns the operator.</li>
              <li><strong>Authority Verification:</strong> Verifies the signing key matches the on-chain account owner.</li>
              <li><strong>Whitelist Filter:</strong> Checks against the local <code>whitelist.json</code> to protect critical infrastructure.</li>
            </ul>
          </div>

          <div v-else-if="activeDoc === 'Edge Case Handling'">
            <p class="text-gray-400 mb-6">RentOps is designed to handle the complexities of the Solana network gracefully:</p>
            <div class="space-y-4">
              <div class="p-4 bg-[#111] border border-gray-800">
                <strong class="text-white text-xs block mb-1 uppercase">Stale Blockhashes</strong>
                <p class="text-xs text-gray-500">Automatically fetches fresh blockhashes before every transaction attempt to minimize 'Expired Transaction' errors.</p>
              </div>
              <div class="p-4 bg-[#111] border border-gray-800">
                <strong class="text-white text-xs block mb-1 uppercase">Dust Balances</strong>
                <p class="text-xs text-gray-500">Detects accounts with 1-2 lamports (dust) and treats them as actionable while preventing closure of high-value user assets.</p>
              </div>
              <div class="p-4 bg-[#111] border border-gray-800">
                <strong class="text-white text-xs block mb-1 uppercase">RPC Failures</strong>
                <p class="text-xs text-gray-500">Implements automatic fallbacks between Helius and public endpoints to ensure scanning continuity.</p>
              </div>
            </div>
          </div>

          <div v-else-if="activeDoc === 'Running a Node'">
            <p class="text-gray-400 leading-relaxed mb-6">
              To start monitoring your Kora Node, open the <strong>Dashboard</strong> and click "Initialize Scan". You will be prompted to enter your Kora Node's public address.
            </p>
            <p class="text-gray-400 leading-relaxed mb-6">
              RentOps will begin indexing your history immediately. For automated daily reports, ensure your <code>KORA_NODE_ADDRESS</code> environment variable is set in the backend.
            </p>
          </div>

          <div v-else-if="activeDoc === 'Using the CLI'">
            <p class="text-gray-400 mb-6">The RentOps CLI is designed for speed and scripting. Install it using the one-liner on the landing page.</p>
            <code class="block bg-black p-4 text-[#cc5500] text-xs mb-6 border border-gray-800">
              $ rentops scan --kora-node [ADDRESS]
            </code>
            <p class="text-gray-400 text-sm">Use <code>rentops reclaim</code> to perform high-speed cleanup of hundreds of accounts simultaneously from your terminal.</p>
          </div>

          <div v-else-if="activeDoc === 'Self-Hosting Guide'">
             <div class="p-6 border border-[#cc5500]/20 bg-[#cc5500]/5 mb-8">
               <p class="text-sm text-white font-bold mb-2 uppercase">Security Recommendation</p>
               <p class="text-xs text-gray-400">Because reclamation requires private keys, we recommend hosting RentOps on your own hardware or VPC.</p>
             </div>
             <ol class="space-y-4 text-gray-400 text-sm list-decimal pl-5">
               <li>Clone the repo: <code>git clone https://github.com/rentops/core</code></li>
               <li>Configure your <code>.env</code> with <code>HELIUS_RPC_API_KEY</code> and <code>TELEGRAM_BOT_TOKEN</code>.</li>
               <li>Deploy the UI folder to Vercel or Run <code>pnpm build && pnpm start</code>.</li>
             </ol>
          </div>

          <div v-else>
             <p class="text-gray-400 text-lg leading-relaxed">
               Select a topic from the sidebar to explore RentOps documentation.
             </p>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
