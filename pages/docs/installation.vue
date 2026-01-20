<script setup lang="ts">
import { Shield01Icon, ArrowLeft01Icon, Link01Icon } from 'hugeicons-vue'
import CopyCode from '../../components/ui/CopyCode.vue'

definePageMeta({
  layout: 'default'
})
</script>

<template>
  <div class="min-h-screen bg-[#050505] font-oswald text-gray-300 p-8 md:p-12">
    <div class="max-w-3xl mx-auto">
      <NuxtLink to="/app" class="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 hover:text-[#cc5500] mb-8 transition-colors">
        <ArrowLeft01Icon size="16" /> Back to Dashboard
      </NuxtLink>

      <div class="border-b border-gray-800 pb-8 mb-12">
        <h1 class="text-5xl font-black text-white uppercase tracking-tighter mb-4">Installation Guide</h1>
        <p class="text-xl text-gray-400">Deploying your own secure RentOps infrastructure.</p>
      </div>

      <div class="prose prose-invert prose-orange max-w-none">
        
        <!-- INTRO -->
        <div class="bg-[#111] border-l-4 border-[#cc5500] p-6 mb-12">
          <h3 class="text-white font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <Shield01Icon size="18" class="text-[#cc5500]" /> Why Self-Host?
          </h3>
          <p class="text-sm text-gray-400 m-0 leading-relaxed">
            RentOps is a powerful tool that interacts with your wallet's private keys to reclaim rent. 
            While our hosted version is convenient, running the infrastructure on your own machine or private server ensures 
            <strong>maximum security</strong>. Your keys never leave your control.
          </p>
        </div>

        <!-- PHASE 1: PREP -->
        <h2 class="text-3xl text-white font-bold uppercase mb-6 mt-16 border-b border-gray-800 pb-2">
          <span class="text-[#cc5500]">01.</span> Preparation
        </h2>
        <p class="mb-6">Before we touch any code, let's get the keys you'll need.</p>

        <h3 class="text-xl text-white font-bold uppercase mb-4">A. Get a Solana RPC Key</h3>
        <p class="mb-4 text-sm">
          We use <strong>Helius</strong> to scan the blockchain. Their free tier is generous and perfect for RentOps.
        </p>
        <ol class="space-y-4 text-gray-400 list-decimal pl-5 marker:text-[#cc5500] mb-8 text-sm">
          <li>Go to <a href="https://dev.helius.xyz/dashboard/app" target="_blank" class="text-[#cc5500] hover:underline font-bold inline-flex items-center gap-1">dev.helius.xyz <Link01Icon size="12"/></a> and sign up.</li>
          <li>On the Dashboard, look for "API Key".</li>
          <li>Copy this key. It starts with a UUID like <code>4f9a...</code>.</li>
        </ol>

        <h3 class="text-xl text-white font-bold uppercase mb-4">B. (Optional) Get a Telegram Bot Token</h3>
        <p class="mb-4 text-sm">
          If you want mobile alerts for rent detection:
        </p>
        <ol class="space-y-4 text-gray-400 list-decimal pl-5 marker:text-[#cc5500] mb-8 text-sm">
          <li>Open Telegram and search for <strong>@BotFather</strong>.</li>
          <li>Send the message <code>/newbot</code>.</li>
          <li>Follow the prompts to name your bot (e.g., "MyRentOpsBot").</li>
          <li>BotFather will give you a token like <code>123456:ABC-DEF...</code>. Copy this.</li>
        </ol>

        <!-- PHASE 2: INSTALL -->
        <h2 class="text-3xl text-white font-bold uppercase mb-6 mt-16 border-b border-gray-800 pb-2">
          <span class="text-[#cc5500]">02.</span> Setup
        </h2>

        <h3 class="text-xl text-white font-bold uppercase mb-4">Clone the Repository</h3>
        <p class="mb-4 text-sm">Open your terminal and run:</p>
        <CopyCode code="git clone https://github.com/rentops/ui.git rentops" />
        <CopyCode code="cd rentops" />

        <h3 class="text-xl text-white font-bold uppercase mb-4">Install Dependencies</h3>
        <p class="mb-4 text-sm">We use <code>pnpm</code> for speed, but <code>npm</code> works too.</p>
        <CopyCode code="npm install -g pnpm" />
        <CopyCode code="pnpm install" />

        <!-- PHASE 3: CONFIG -->
        <h2 class="text-3xl text-white font-bold uppercase mb-6 mt-16 border-b border-gray-800 pb-2">
          <span class="text-[#cc5500]">03.</span> Configuration
        </h2>
        
        <p class="mb-4 text-sm">Create a secret environment file to store your keys.</p>
        <CopyCode code="cp .env.example .env" />
        
        <p class="mb-4 text-sm">Open <code>.env</code> in your text editor and fill in the blanks:</p>
        <div class="bg-[#111] border border-gray-800 p-6 mb-8 font-mono text-xs">
          <p class="text-gray-500 mb-2"># .env file</p>
          <div class="space-y-4">
            <div>
              <p class="text-[#cc5500]">HELIUS_RPC_API_KEY=your_helius_key_here</p>
              <p class="text-gray-600 ml-4">// Paste the key from Step 1A</p>
            </div>
            <div>
              <p class="text-[#cc5500]">TELEGRAM_BOT_TOKEN=your_bot_token_here</p>
              <p class="text-gray-600 ml-4">// Paste the token from Step 1B</p>
            </div>
          </div>
        </div>

        <!-- PHASE 4: LAUNCH -->
        <h2 class="text-3xl text-white font-bold uppercase mb-6 mt-16 border-b border-gray-800 pb-2">
          <span class="text-[#cc5500]">04.</span> Launch
        </h2>

        <h3 class="text-xl text-white font-bold uppercase mb-4">Run Locally</h3>
        <p class="mb-4 text-sm">Start the dashboard on your machine:</p>
        <CopyCode code="pnpm dev" />
        <p class="mb-8 text-sm">Open your browser to <a href="http://localhost:3000" class="text-[#cc5500] font-bold">http://localhost:3000</a>.</p>

        <h3 class="text-xl text-white font-bold uppercase mb-4">Deploy to Production (Vercel)</h3>
        <p class="mb-4 text-sm">To keep the bot running 24/7 without your laptop:</p>
        <ol class="space-y-4 text-gray-400 list-decimal pl-5 marker:text-[#cc5500] mb-8 text-sm">
          <li>Install Vercel CLI: <code>npm i -g vercel</code></li>
          <li>Login: <code>vercel login</code></li>
          <li>Deploy: <code>vercel deploy --prod</code></li>
          <li>Go to your Vercel Dashboard -> Settings -> Environment Variables and add your keys there.</li>
        </ol>

      </div>
    </div>
  </div>
</template>