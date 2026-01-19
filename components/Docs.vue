<script setup lang="ts">
import { 
  Folder01Icon, 
  File01Icon, 
  ArrowRight01Icon 
} from 'hugeicons-vue'

const categories = [
  {
    title: 'Kora',
    items: [
      'Getting Started',
      'Installation',
      'Quick Start',
      'Full Demo Guide',
      'JSON RPC API',
      'Operators Guide'
    ]
  },
  {
    title: 'Solana',
    items: [
      'Account Model',
      'Transactions',
      'Programs',
      'Cross Program Invocation',
      'Fees'
    ]
  }
]

const activeDoc = ref('Getting Started')
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-0 border border-gray-900 bg-[#050505] lg:h-[800px]">
    <!-- Sidebar -->
    <div class="border-b lg:border-b-0 lg:border-r border-gray-900 bg-[#0a0a0a] flex flex-col max-h-[300px] lg:max-h-full">
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
    <div class="lg:col-span-3 p-8 lg:p-12 overflow-y-auto custom-scrollbar bg-[#050505] min-h-[500px] lg:h-full">
      <div class="max-w-3xl">
        <div class="mb-8 pb-4 border-b border-gray-800">
          <span class="text-[#cc5500] text-xs font-bold uppercase tracking-widest mb-2 block">/ Docs / {{ activeDoc }}</span>
          <h1 class="text-4xl font-bold text-white uppercase tracking-tighter">{{ activeDoc }}</h1>
        </div>

        <div class="prose prose-invert prose-orange max-w-none">
          <p class="text-gray-400 text-lg leading-relaxed mb-6">
            Welcome to the official documentation for RentOps and the Kora Protocol. This section provides comprehensive guides on operating nodes, managing rent reclamation, and understanding the underlying Solana architecture.
          </p>

          <div class="bg-[#111] border border-gray-800 p-6 my-8">
            <h3 class="text-white font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <File01Icon size="18" class="text-[#cc5500]" /> Quick Summary
            </h3>
            <p class="text-sm text-gray-400">
              RentOps automates the recovery of rent-exempt SOL from inactive Associated Token Accounts (ATAs). 
              By introspecting Kora node transactions, it identifies sponsored accounts that have become dormant and safely reclaims the 0.002 SOL rent deposit.
            </p>
          </div>

          <h2 class="text-2xl text-white font-bold uppercase mt-12 mb-4">Core Concepts</h2>
          <ul class="space-y-2 text-gray-400 list-disc pl-5 marker:text-[#cc5500]">
            <li><strong>Rent Exemption:</strong> Accounts on Solana must hold a minimum balance to remain open.</li>
            <li><strong>Sponsorship:</strong> Kora nodes often pay this rent for users during onboarding.</li>
            <li><strong>Reclamation:</strong> Closing an empty account returns the rent SOL to the wallet that closes it (or the authority).</li>
          </ul>

          <div class="mt-12 p-4 border border-[#cc5500]/30 bg-[#cc5500]/5 text-[#cc5500] text-xs font-mono uppercase">
            > Documentation content is currently being migrated from the legacy wiki.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
