<script setup lang="ts">
const props = defineProps<{
  data: Array<{ name: string; sol: number }>
}>()

const data = computed(() => props.data || [])
</script>

<template>
  <div class="bg-[#050505] border border-gray-900 p-6">
    <h3 class="text-sm font-bold uppercase tracking-[0.2em] mb-4 text-gray-400">SOL Locked per Node</h3>
    <div class="space-y-2">
      <div v-for="node in data" :key="node.name" class="flex justify-between items-center">
        <span class="text-gray-300 text-xs">{{ node.name }}</span>
        <div class="flex items-center gap-2">
          <div class="bg-[#cc5500] h-4 rounded" :style="{ width: (node.sol / Math.max(...data.map(n => n.sol))) * 100 + '%' }"></div>
          <span class="text-[#cc5500] font-bold text-xs">{{ node.sol.toFixed(4) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>