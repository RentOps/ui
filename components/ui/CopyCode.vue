<script setup lang="ts">
import { Copy01Icon, CheckmarkCircle02Icon } from 'hugeicons-vue'
import { ref } from 'vue'

const props = defineProps<{
  code: string
}>()

const copied = ref(false)

function copy() {
  navigator.clipboard.writeText(props.code)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<template>
  <div 
    @click="copy"
    class="bg-black border border-gray-800 p-4 mb-6 group cursor-pointer hover:border-[#cc5500] transition-colors relative"
  >
    <code class="text-[#cc5500] text-sm font-mono break-all pr-8 block">{{ code }}</code>
    <div class="absolute top-4 right-4 text-gray-600 group-hover:text-white transition-colors">
      <component :is="copied ? CheckmarkCircle02Icon : Copy01Icon" size="16" :class="{ 'text-green-500': copied }" />
    </div>
  </div>
</template>