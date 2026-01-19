<script setup lang="ts">
import { computed, toRefs, ref, onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  precision: { type: Number, default: 0 },
  duration: { type: Number, default: 1500 }
})

const { value, precision, duration } = toRefs(props)
const isLoaded = ref(false)
const isAnimating = ref(false)
const tickerRef = ref<HTMLElement>()

const formattedValue = computed(() => value.value.toFixed(precision.value))
const digits = computed(() => formattedValue.value.split(''))
const isDigit = (char: string) => /\d/.test(char)

const triggerAnimation = async () => {
  if (isAnimating.value) return

  isAnimating.value = true
  
  // 1. Reset: Snap instantly to 0
  isLoaded.value = false
  
  // 2. Force browser repaint (1 frame)
  await nextTick()
  
  // Using double requestAnimationFrame ensures the browser paints the "0" state
  // before we tell it to animate to the new number. This eliminates the 50ms delay.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      isLoaded.value = true
      
      // Unlock after animation finishes
      setTimeout(() => {
        isAnimating.value = false
      }, duration.value + (digits.value.length * 100)) 
    })
  })
}

onMounted(() => {
  if (tickerRef.value) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) triggerAnimation()
      },
      { threshold: 0.5 }
    )
    observer.observe(tickerRef.value)
  }
})

watch(value, () => {
  isAnimating.value = false
  triggerAnimation()
})
</script>

<template>
  <div
    ref="tickerRef"
    class="inline-flex overflow-hidden font-oswald text-4xl font-light leading-[1.1] h-[1.1em] cursor-pointer select-none"
    @mouseenter="triggerAnimation"
  >
    <div 
      v-for="(char, index) in digits" 
      :key="index" 
      class="relative w-[0.6em] text-center"
    >
      <div
        v-if="isDigit(char)"
        class="absolute left-0 top-0 w-full flex flex-col will-change-transform"
        :style="{
          transform: isLoaded ? `translateY(-${parseInt(char) * 10}%)` : `translateY(0%)`,
          
          // Duration: 0ms when resetting (instant), duration prop when animating
          transitionDuration: isLoaded ? `${duration}ms` : '0ms',
          
          // Easing: Bounce effect
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          
          // Delay: Only apply delay when animating (isLoaded=true). 
          // When resetting (isLoaded=false), delay should be 0 so it snaps back instantly.
          transitionDelay: isLoaded ? `${index * 100}ms` : '0ms'
        }"
      >
        <span v-for="n in 10" :key="n" class="h-[1.1em] flex items-center justify-center">
          {{ n - 1 }}
        </span>
      </div>

      <span v-else class="h-[1.1em] flex items-center justify-center absolute left-0 top-0 w-full">
        {{ char }}
      </span>
    </div>
  </div>
</template>
