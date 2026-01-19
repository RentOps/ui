import { h, defineComponent } from 'vue'

export type ChartConfig = Record<string, { label: string; color?: string }>

export const ChartContainer = defineComponent({
  props: ['config'],
  setup(props, { slots, attrs }) {
    return () => h('div', { ...attrs, class: ['chart-container', attrs.class] }, slots.default?.())
  }
})

export const ChartTooltip = defineComponent({
  setup(props, { slots }) {
    return () => h('div', { class: 'hidden' }, slots.default?.()) // Mock
  }
})

export const ChartTooltipContent = defineComponent({
  setup() {
    return () => h('div', 'Tooltip')
  }
})

export const ChartCrosshair = defineComponent({
    props: ['template', 'color'],
    setup() { return () => null }
})


export function componentToString(config: any, component: any, opts: any) {
  return () => ''
}
