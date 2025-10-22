<template>
  <svg id="svggraph-rings" :viewBox="`${svgRect.x} ${svgRect.y} ${svgRect.w} ${svgRect.h}`">
    <svg :x="graphRect.x" :y="graphRect.y" :width="graphRect.w" :height="graphRect.h">
      <g id="svggraph-rings-planet">
        <path d="M0,20 A 1 1 0 0 1 0 140" fill="none" stroke="white" stroke-width="2" />
        <line x1="0" y1="80" x2="100%" y2="80" stroke="white" opacity="50%" stroke-dasharray="4" />
        <line x1="0" y1="76" x2="0" y2="84" stroke="white" stroke-width="4" />
        <line x1="0" y1="80" x2="5" y2="80" stroke="white" stroke-width="2" />
      </g>
      <g id="svggraph-biomes-data">
        <path
          v-for="r of ringData"
          :key="r.id"
          :d="makeSVGCurve((r.inner*480)/5.0)"
          fill="none"
          stroke="var(--lg-logo)"
          :stroke-width="(r.outer-r.inner)*32.0"
        />
      </g>
    </svg>
  </svg>
</template>
<script setup lang="ts">
import type { RingParameters } from '@/core/models/ring-parameters.model';
import Rect from '@core/utils/math/rect';
import { onMounted, ref, type Ref } from 'vue';

const width = 480, height = 180
const svgRect = new Rect(0, 0, width, height)
const graphRect = new Rect(10, 10, width-20, height-20)

const props = defineProps<{ rings: RingParameters[] }>()
const ringData: Ref<{id: string, inner: number, outer: number}[]> = ref([])

onMounted(() => {
  props.rings.forEach(r => ringData.value.push({
    id: r.id,
    inner: r.innerRadius,
    outer: r.outerRadius
  }))
})

function makeSVGCurve(width: number) {
  return `M0,120 Q${width},120 ${width},80`
}

</script>
<style scoped lang="scss">
#svggraph-rings {
  margin-top: 0.5rem;
}
</style>