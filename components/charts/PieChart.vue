<script setup lang="ts">
import type { ChartConfig } from "@/components/ui/chart"
import { Donut } from "@unovis/ts"
import { VisDonut, VisSingleContainer } from "@unovis/vue"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"
import { computed } from "vue"

const props = defineProps<{
  logs?: any[]
}>()

const chartData = computed(() => {
  const reasonMap = new Map<string, number>()
  
  props.logs?.forEach(log => {
    if (log.type === 'detected' || log.type === 'success') {
      const reason = log.reason || 'Unknown'
      reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1)
    }
  })

  const colors = ['#cc5500', '#ff8800', '#993300', '#662200', '#331100']
  
  return Array.from(reasonMap.entries())
    .map(([reason, count], i) => ({
      reason,
      count,
      color: colors[i % colors.length]
    }))
})

type Data = typeof chartData.value[number]

const chartConfig = {
  count: {
    label: "Events",
    color: "#cc5500",
  },
} satisfies ChartConfig
</script>

<template>
  <Card class="flex flex-col border-gray-800 bg-[#050505] overflow-hidden">
    <CardHeader class="items-center pb-0">
      <CardTitle class="text-white">Detection Profile</CardTitle>
      <CardDescription class="text-gray-400">Distribution by reason type</CardDescription>
    </CardHeader>
    <CardContent class="flex-1 pb-0">
      <ChartContainer
        :config="chartConfig"
        class="mx-auto h-[300px] w-full"
      >
        <VisSingleContainer
          :data="chartData"
          :margin="{ top: 20, bottom: 20 }"
        >
          <VisDonut
            :value="(d: Data) => d.count"
            :color="(d: Data) => d.color"
            :arc-width="40"
          />
          <ChartTooltip />
        </VisSingleContainer>
      </ChartContainer>
    </CardContent>
  </Card>
</template>