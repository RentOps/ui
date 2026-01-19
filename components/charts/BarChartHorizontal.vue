<script setup lang="ts">
import type { ChartConfig } from "@/components/ui/chart"
import { Orientation } from "@unovis/ts"
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
  scanNodes?: any[]
}>()

const chartData = computed(() => {
  const nodeMap = new Map<string, number>()
  
  // Initialize with known nodes
  props.scanNodes?.forEach(n => nodeMap.set(n.address, 0))

  props.logs?.forEach(log => {
    if ((log.type === 'detected' || log.type === 'success') && log.koraNode) {
      const amount = Math.abs(parseFloat(log.amount)) || 0
      nodeMap.set(log.koraNode, (nodeMap.get(log.koraNode) || 0) + amount)
    }
  })

  return Array.from(nodeMap.entries())
    .map(([addr, sol]) => {
      const node = props.scanNodes?.find(n => n.address === addr)
      return { 
        name: node ? node.nickname : (addr.slice(0, 8) + '...'), 
        sol 
      }
    })
    .sort((a, b) => b.sol - a.sol)
    .slice(0, 5) // Top 5
})

type Data = typeof chartData.value[number]

const chartConfig = {
  sol: {
    label: "SOL Locked",
    color: "#cc5500",
  },
} satisfies ChartConfig
</script>

<template>
  <Card class="border-gray-800 bg-[#050505] overflow-hidden">
    <CardHeader>
      <CardTitle class="text-white">Top Nodes</CardTitle>
      <CardDescription class="text-gray-400">Distribution by SOL volume</CardDescription>
    </CardHeader>
    <CardContent class="p-0 sm:p-0 pb-4">
      <ChartContainer :config="chartConfig" class="h-[250px] w-full">
        <VisXYContainer
          :data="chartData"
          :margin="{ left: 80, right: 20, top: 0, bottom: 0 }"
        >
          <VisGroupedBar
            :x="(d: Data) => d.sol"
            :y="(d: Data) => d.name"
            color="#cc5500"
            :rounded-corners="0"
            :orientation="Orientation.Horizontal"
          />
          <VisAxis
            type="y"
            :tick-line="false"
            :domain-line="false"
            :grid-line="false"
            :tick-text-color="'#888'"
            :num-ticks="chartData.length"
          />
          <VisAxis
            type="x"
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