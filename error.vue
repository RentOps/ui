<script setup lang="ts">
import { Alert02Icon, Home03Icon } from 'hugeicons-vue'

defineProps({
  error: Object
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="fixed inset-0 z-10 flex flex-col justify-center items-center p-8 bg-black font-oswald text-white">
    <!-- Background Image with Overlay -->
    <div class="absolute inset-0 z-0">
      <img src="/bg.jpg" class="w-full h-full object-cover opacity-70 mix-blend-luminosity grayscale" alt="Background">
      <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black"></div>
      <div class="absolute inset-0 bg-red-900/10 mix-blend-overlay"></div>
    </div>

    <div class="relative z-10 max-w-4xl w-full border-l-4 border-red-600 pl-8 py-4 mb-12 flex flex-col gap-4">
      <div class="flex items-center gap-4 text-red-600 mb-2">
        <Alert02Icon size="48" class="animate-pulse" />
        <span class="text-sm font-bold uppercase tracking-[0.3em]">Critical System Error</span>
      </div>
      
      <h1 class="text-8xl md:text-9xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
        404
      </h1>
      <p class="text-2xl md:text-3xl text-gray-300 max-w-2xl leading-relaxed uppercase tracking-widest drop-shadow-lg">
        Signal Lost.<br>
        Target coordinates not found.<br>
        Operation Aborted.
      </p>
    </div>

    <div class="relative z-20 flex flex-col md:flex-row gap-6 w-full max-w-lg">
      <button 
        @click="handleError"
        class="group flex-1 py-6 border border-red-600 bg-black text-red-600 hover:bg-red-600 hover:text-black transition-all duration-300 uppercase font-bold tracking-widest text-lg text-center flex items-center justify-center gap-3"
      >
        <Home03Icon size="24" stroke-width="2" />
        <span>Return to Base</span>
      </button>
    </div>
    
    <div class="relative z-10 mt-12 font-mono text-xs text-gray-600 uppercase tracking-widest">
      Error Code: {{ error?.statusCode || 'UNKNOWN' }} // {{ error?.message || 'Route not found' }}
    </div>
  </div>
</template>

<style scoped>
/* Ensure font is available since layout might not load */
@font-face {
  font-family: 'Oswald';
  src: url('/Oswald/Oswald-VariableFont_wght.ttf') format('truetype');
  font-weight: 200 700;
  font-display: swap;
}
</style>