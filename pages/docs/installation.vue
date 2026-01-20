<script setup lang="ts">
import { Shield01Icon, ArrowLeft01Icon } from 'hugeicons-vue'

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
        <div class="bg-[#111] border-l-4 border-[#cc5500] p-6 mb-10">
          <h3 class="text-white font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <Shield01Icon size="18" class="text-[#cc5500]" /> Security First
          </h3>
          <p class="text-sm text-gray-400 m-0">
            RentOps deals with private keys to authorize rent reclamation. While the hosted dashboard is secure, 
            high-volume operators managing significant capital are strongly encouraged to <strong>self-host</strong> 
            their own instance on isolated infrastructure (e.g., AWS VPC, Railway, or private server).
          </p>
        </div>

        <h2 class="text-2xl text-white font-bold uppercase mb-6 mt-12">Prerequisites</h2>
        <ul class="space-y-2 text-gray-400 list-disc pl-5 marker:text-[#cc5500]">
          <li><strong>Node.js:</strong> v18 or higher</li>
          <li><strong>pnpm:</strong> Package manager</li>
          <li><strong>RPC Key:</strong> A dedicated RPC endpoint (Helius recommended)</li>
          <li><strong>Telegram Bot:</strong> (Optional) For mobile alerts</li>
        </ul>

        <h2 class="text-2xl text-white font-bold uppercase mb-6 mt-12">Step 1: Clone the Repository</h2>
        <div class="bg-black border border-gray-800 p-4 mb-6">
          <code class="text-[#cc5500] text-sm">git clone https://github.com/rentops/ui.git rentops</code>
        </div>

        <h2 class="text-2xl text-white font-bold uppercase mb-6 mt-12">Step 2: Configure Environment</h2>
        <p class="mb-4">Create a <code>.env</code> file in the <code>rentops/ui</code> directory:</p>
        <div class="bg-black border border-gray-800 p-4 mb-6">
<pre class="text-gray-400 text-xs font-mono">
# Required for scanning
HELIUS_RPC_API_KEY=your_helius_key_here

# Optional: For Telegram Bot features
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Optional: To persist daily reports
TELEGRAM_CHAT_ID=your_chat_id
</pre>
        </div>

        <h2 class="text-2xl text-white font-bold uppercase mb-6 mt-12">Step 3: Run Locally</h2>
        <p class="mb-4">Install dependencies and start the development server:</p>
        <div class="bg-black border border-gray-800 p-4 mb-6">
          <code class="text-[#cc5500] text-sm">pnpm install && pnpm dev</code>
        </div>
        <p>The dashboard will be available at <code>http://localhost:3000</code>.</p>

        <h2 class="text-2xl text-white font-bold uppercase mb-6 mt-12">Step 4: Production Deployment</h2>
        <p class="mb-4">We recommend deploying to <strong>Vercel</strong> for zero-config setups:</p>
        <ol class="space-y-4 text-gray-400 list-decimal pl-5 marker:text-gray-600">
          <li>Install Vercel CLI: <code>npm i -g vercel</code></li>
          <li>Deploy: <code>vercel deploy --prod</code></li>
          <li>Add Environment Variables in your Vercel Project Settings.</li>
        </ol>

      </div>
    </div>
  </div>
</template>