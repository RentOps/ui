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
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <!-- Row 1 -->
    <div class="flex flex-col gap-4">
      <BarChartInteractive :logs="logs" />
      <div class="bg-[#050505] border border-gray-900 p-6">
        <h3 class="text-sm font-bold uppercase tracking-[0.2em] mb-2 text-[#cc5500]">AI Insight</h3>
        <p class="text-gray-400 text-xs leading-relaxed">
          Visitor traffic shows a strong correlation with weekend marketing campaigns. Peak desktop usage suggests B2B engagement is driving the majority of growth.
        </p>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <BarChartHorizontal :logs="logs" :scan-nodes="scanNodes" />
      <div class="bg-[#050505] border border-gray-900 p-6">
        <h3 class="text-sm font-bold uppercase tracking-[0.2em] mb-2 text-[#cc5500]">AI Insight</h3>
        <p class="text-gray-400 text-xs leading-relaxed">
           Top node performance analysis.
        </p>
      </div>
    </div>

    <!-- Row 2 -->
    <div class="flex flex-col gap-4">
      <PieChart :logs="logs" />
      <div class="bg-[#050505] border border-gray-900 p-6">
        <h3 class="text-sm font-bold uppercase tracking-[0.2em] mb-2 text-[#cc5500]">AI Insight</h3>
        <p class="text-gray-400 text-xs leading-relaxed">
           Distribution of detection reasons.
        </p>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <LineChartInteractive :logs="logs" />
       <div class="bg-[#050505] border border-gray-900 p-6">
        <h3 class="text-sm font-bold uppercase tracking-[0.2em] mb-2 text-[#cc5500]">AI Insight</h3>
        <p class="text-gray-400 text-xs leading-relaxed">
           Volatility in daily active users aligns with recent feature deployments. Stability has improved in the last 14 days.
        </p>
      </div>
    </div>
  </div>
</template>