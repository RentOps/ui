<script setup lang="ts">
import { CommandLineIcon, Rocket01Icon, Copy01Icon, Cancel01Icon, CheckmarkCircle02Icon } from 'hugeicons-vue'

const showCliModal = ref(false)
const copied = ref(false)

function copyCliCommand() {
  navigator.clipboard.writeText('curl -sL https://raw.githubusercontent.com/rentops/binaries/main/install.sh | bash')
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<template>
  <div class="fixed inset-0 z-10 flex flex-col justify-center items-center p-8 bg-black font-oswald">
    <!-- Background Image with Overlay -->
    <div class="absolute inset-0 z-0">
      <img src="/bg.jpg" class="w-full h-full object-cover opacity-70 mix-blend-luminosity" alt="Background">
      <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black"></div>
    </div>

    <div class="relative z-10 max-w-4xl w-full border-l-2 border-[#cc5500] pl-8 py-4 mb-12">
      <h1 class="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#cc5500] to-[#ff8800]">
        RentOps
      </h1>
      <p class="text-xl md:text-2xl text-gray-200 max-w-2xl leading-relaxed uppercase tracking-widest drop-shadow-lg">
        Recover Dormant SOL.<br>
        Optimize Kora Operations.<br>
        Zero Latency.
      </p>
    </div>

    <div class="relative z-20 flex flex-col md:flex-row gap-6 w-full max-w-2xl">
      <NuxtLink 
        to="/app"
        class="group flex-1 py-6 border border-[#cc5500] bg-black text-[#cc5500] hover:bg-[#cc5500] hover:text-black transition-all duration-300 uppercase font-bold tracking-widest text-lg text-center flex items-center justify-center gap-3"
      >
        <Rocket01Icon size="24" stroke-width="2" />
        <span>Launch Console</span>
      </NuxtLink>
      
      <button 
        @click="showCliModal = true"
        class="group flex-1 py-6 border border-gray-800 bg-gray-900 text-gray-400 hover:border-[#cc5500] hover:text-[#cc5500] transition-all duration-300 uppercase font-bold tracking-widest text-lg flex items-center justify-center gap-3"
      >
        <CommandLineIcon size="24" stroke-width="2" />
        <span>Install CLI</span>
      </button>
    </div>

    <!-- CLI MODAL -->
    <div v-if="showCliModal" class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" @click.self="showCliModal = false">
      <div class="w-full max-w-lg bg-black border border-[#cc5500] p-0">
        <div class="bg-[#cc5500] text-black px-4 py-1 text-xs font-bold flex justify-between uppercase items-center">
          <span>Terminal</span>
          <button @click="showCliModal = false" class="hover:text-white transition-colors">
            <Cancel01Icon size="16" />
          </button>
        </div>
        <div class="p-8">
          <p class="text-gray-500 mb-4 text-xs uppercase tracking-widest">Install Command</p>
          <div class="bg-[#111] border border-gray-800 p-4 flex justify-between items-center group hover:border-[#cc5500] transition-colors cursor-pointer overflow-x-auto" @click="copyCliCommand">
            <code class="text-[#cc5500] whitespace-nowrap">$ curl -sL https://raw.githubusercontent.com/rentops/binaries/main/install.sh | bash</code>
            <span class="text-xs text-gray-500 group-hover:text-[#cc5500] uppercase flex items-center gap-2 flex-shrink-0 ml-4">
              <component :is="copied ? CheckmarkCircle02Icon : Copy01Icon" size="16" />
              {{ copied ? 'COPIED' : 'COPY' }}
            </span>
          </div>

          <div class="mt-8 pt-6 border-t border-gray-900">
            <p class="text-gray-500 text-xs uppercase tracking-widest mb-2">Not on Linux?</p>
            <p class="text-gray-400 text-sm leading-relaxed">
              Visit our <a href="https://github.com/rentops/cli" target="_blank" class="text-[#cc5500] hover:underline underline-offset-4 font-bold">official CLI repo</a> to build from source using Rust.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>