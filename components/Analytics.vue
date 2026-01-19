<script setup lang="ts">
import BarChartInteractive from './charts/BarChartInteractive.vue'
import BarChartHorizontal from './charts/BarChartHorizontal.vue'
import PieChart from './charts/PieChart.vue'
import LineChartInteractive from './charts/LineChartInteractive.vue'

defineProps<{
  logs?: any[]
  scanNodes?: any[]
}>()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-900 bg-[#050505]">
    <!-- Row 1 Left -->
    <div class="flex flex-col gap-0 border-b md:border-r border-gray-900">
      <div class="p-6">
        <BarChartInteractive :logs="logs" />
      </div>
      <div class="bg-[#0a0a0a] border-t border-gray-900 p-6 h-full">
        <h3 class="text-sm font-bold uppercase tracking-[0.2em] mb-2 text-[#cc5500]">AI Insight</h3>
        <p class="text-gray-400 text-xs leading-relaxed">
          Visitor traffic shows a strong correlation with weekend marketing campaigns. Peak desktop usage suggests B2B engagement is driving the majority of growth.
        </p>
      </div>
    </div>

    <!-- Row 1 Right -->
    <div class="flex flex-col gap-0 border-b border-gray-900">
      <div class="p-6">
        <BarChartHorizontal :logs="logs" :scan-nodes="scanNodes" />
      </div>
      <div class="bg-[#0a0a0a] border-t border-gray-900 p-6 h-full">
        <h3 class="text-sm font-bold uppercase tracking-[0.2em] mb-2 text-[#cc5500]">AI Insight</h3>
        <p class="text-gray-400 text-xs leading-relaxed">
           Top node performance analysis. Upward trend confirmed for Q2. Desktop users remain the primary demographic.
        </p>
      </div>
    </div>

    <!-- Row 2 Left -->
    <div class="flex flex-col gap-0 border-b md:border-b-0 md:border-r border-gray-900">
      <div class="p-6">
        <PieChart :logs="logs" />
      </div>
      <div class="bg-[#0a0a0a] border-t border-gray-900 p-6 h-full">
        <h3 class="text-sm font-bold uppercase tracking-[0.2em] mb-2 text-[#cc5500]">AI Insight</h3>
        <p class="text-gray-400 text-xs leading-relaxed">
           Distribution of detection reasons. Browser distribution indicates a technical audience, with Chrome and Firefox dominating.
        </p>
      </div>
    </div>

    <!-- Row 2 Right -->
    <div class="flex flex-col gap-0">
      <div class="p-6">
        <LineChartInteractive :logs="logs" />
      </div>
      <div class="bg-[#0a0a0a] border-t border-gray-900 p-6 h-full">
        <h3 class="text-sm font-bold uppercase tracking-[0.2em] mb-2 text-[#cc5500]">AI Insight</h3>
        <p class="text-gray-400 text-xs leading-relaxed">
           Volatility in daily active users aligns with recent feature deployments. Stability has improved in the last 14 days.
        </p>
      </div>
    </div>
  </div>
</template>