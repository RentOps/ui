<script setup lang="ts">
import type { ChartConfig } from "@/components/ui/chart"
import { VisAxis, VisLine, VisXYContainer, VisArea } from "@unovis/vue"
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

// Process logs into cumulative SOL volume
const chartData = computed(() => {
  const today = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    return { date: d, sol: 0 }
  })

  if (!props.logs || props.logs.length === 0) return last7Days

  const dailyMap = new Map<string, number>()
  last7Days.forEach(day => dailyMap.set(day.date.toLocaleDateString(), 0))

  props.logs.forEach(log => {
    if (log.type === 'detected' || log.type === 'success') {
      const dateKey = new Date().toLocaleDateString() // Mapping all to today for demo
      if (dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, dailyMap.get(dateKey)! + (Math.abs(parseFloat(log.amount)) || 0))
      }
    }
  })

  let cumulative = 0
  return last7Days.map(day => {
    cumulative += dailyMap.get(day.date.toLocaleDateString()) || 0
    return { ...day, sol: cumulative }
  })
})

type Data = typeof chartData.value[number]

const chartConfig = {
  sol: {
    label: "Cumulative SOL",
    color: "#cc5500",
  },
} satisfies ChartConfig
</script>

<template>
  <Card class="py-4 sm:py-0 border-0 bg-transparent overflow-hidden shadow-none">
    <CardHeader class="flex flex-col items-stretch border-b border-gray-900 !p-0 sm:flex-row">
      <div class="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
        <CardTitle class="text-white">Growth Projection</CardTitle>
        <CardDescription class="text-gray-400">
          Cumulative rent detected over time
        </CardDescription>
      </div>
    </CardHeader>
    <CardContent class="p-0 sm:p-0">
      <ChartContainer :config="chartConfig" class="h-[300px] w-full">
        <VisXYContainer
          :data="chartData"
          :margin="{ left: 10, right: 10, top: 20, bottom: 20 }"
          :y-domain="[0, undefined]"
        >
          <VisArea
            :x="(d: Data) => d.date"
            :y="(d: Data) => d.sol"
            color="#cc5500"
            :opacity="0.1"
          />
          <VisLine
            :x="(d: Data) => d.date"
            :y="(d: Data) => d.sol"
            color="#cc5500"
            :line-width="2"
          />
          <VisAxis
            type="x"
            :x="(d: Data) => d.date"
            :tick-line="false"
            :domain-line="false"
            :grid-line="false"
            :tick-text-color="'#444'"
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