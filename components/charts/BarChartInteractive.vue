<script setup lang="ts">
import type { ChartConfig } from "@/components/ui/chart"
import { VisAxis, VisGroupedBar, VisXYContainer } from "@unovis/vue"
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

// Process logs into daily SOL volume
const chartData = computed(() => {
  if (!props.logs || props.logs.length === 0) {
    // Return empty placeholders if no data
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (6 - i))
      return { date: d, sol: 0 }
    })
  }

  const volumeMap = new Map<string, number>()
  
  // Initialize last 7 days with 0
  const today = new Date()
  for(let i=6; i>=0; i--) {
     const d = new Date(today)
     d.setDate(d.getDate() - i)
     const key = d.toLocaleDateString()
     volumeMap.set(key, 0)
  }

  props.logs.forEach(log => {
    if (log.type === 'detected' || log.type === 'success') {
      // Use current date for logs since we don't have historical dates in this session-based mock
      // In a real app, log.timestamp would be a full date. 
      // For this demo, we'll map everything to "Today" to show activity
      const dateKey = new Date().toLocaleDateString()
      const amount = Math.abs(parseFloat(log.amount)) || 0
      volumeMap.set(dateKey, (volumeMap.get(dateKey) || 0) + amount)
    }
  })

  // Convert map to array
  return Array.from(volumeMap.entries()).map(([dateStr, val]) => ({
    date: new Date(dateStr),
    sol: val
  })).sort((a,b) => a.date.getTime() - b.date.getTime())
})

type Data = typeof chartData.value[number]

const chartConfig = {
  sol: {
    label: "SOL Detected",
    color: "#cc5500",
  },
} satisfies ChartConfig

const totalSol = computed(() => chartData.value.reduce((acc, curr) => acc + curr.sol, 0))
</script>

<template>
  <Card class="py-4 sm:py-0 border-gray-800 bg-[#050505]">
    <CardHeader class="flex flex-col items-stretch border-b border-gray-800 !p-0 sm:flex-row">
      <div class="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
        <CardTitle class="text-white">Recent Activity</CardTitle>
        <CardDescription class="text-gray-400">
          Daily SOL volume detected
        </CardDescription>
      </div>
      <div class="flex">
        <div class="flex flex-1 flex-col justify-center gap-1 px-6 py-4 text-left sm:px-8 sm:py-6 bg-gray-800/20">
          <span class="text-gray-500 text-xs uppercase tracking-wider">
            Total Volume
          </span>
          <span class="text-lg leading-none font-bold sm:text-3xl text-[#cc5500]">
            {{ totalSol.toFixed(4) }} SOL
          </span>
        </div>
      </div>
    </CardHeader>
    <CardContent class="px-2 sm:p-6">
      <ChartContainer :config="chartConfig" class="aspect-auto h-[250px] w-full">
        <VisXYContainer
          :data="chartData"
          :margin="{ left: 0, right: 0 }"
          :y-domain="[0, undefined]"
        >
          <VisGroupedBar
            :x="(d: Data) => d.date"
            :y="(d: Data) => d.sol"
            color="#cc5500"
            :bar-padding="0.2"
            :rounded-corners="0"
          />
          <!-- Hidden Axes for sleek look -->
          <VisAxis
            type="x"
            :x="(d: Data) => d.date"
            :tick-line="false"
            :domain-line="false"
            :grid-line="false"
            :tick-text-color="'#666'"
            :tick-format="(d: number) => {
              const date = new Date(d)
              return date.toLocaleDateString('en-US', { weekday: 'short' })
            }"
          />
          <VisAxis
            type="y"
            :tick-line="false"
            :domain-line="false"
            :grid-line="false"
            :tick-format="() => ''" 
          />
          <ChartTooltip />
        </VisXYContainer>
      </ChartContainer>
    </CardContent>
  </Card>
</template>