<script setup lang="ts">
import { Alert02Icon, CheckmarkCircle02Icon, Cancel01Icon } from 'hugeicons-vue'

defineProps<{
  title: string
  message: string
  type?: 'success' | 'error' | 'info'
  show: boolean
}>()

const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" @click.self="emit('close')">
    <div class="w-full max-w-sm bg-[#050505] border border-gray-800 shadow-2xl">
      <div :class="['px-6 py-4 flex justify-between items-center border-b', type === 'error' ? 'bg-red-900/20 border-red-900/50 text-red-500' : type === 'success' ? 'bg-green-900/20 border-green-900/50 text-green-500' : 'bg-gray-900/50 border-gray-800 text-white']">
        <h3 class="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          <Alert02Icon v-if="type === 'error'" size="18" />
          <CheckmarkCircle02Icon v-else-if="type === 'success'" size="18" />
          {{ title }}
        </h3>
        <button @click="emit('close')" class="hover:text-white transition-colors"><Cancel01Icon size="18" /></button>
      </div>
      <div class="p-8">
        <p class="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{{ message }}</p>
        <button @click="emit('close')" class="mt-8 w-full py-3 bg-[#111] border border-gray-800 text-gray-400 font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors">
          Acknowledge
        </button>
      </div>
    </div>
  </div>
</template>