<template>
  <svg id="svggraph-rings" :viewBox="`${svgRect.x} ${svgRect.y} ${svgRect.w} ${svgRect.h}`">
    <defs>
      <marker id="svggraph-rings-grad" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="10" markerHeight="10" orient="auto-start-reverse" stroke="white" stroke-width="1">
        <path d="M4.5,0 4.5,10" />
      </marker>
    </defs>
    <svg :x="graphRect.x" :y="graphRect.y" :width="graphRect.w" :height="graphRect.h">
      <g id="svggraph-rings-planet">
        <circle cx="0" cy="90" :r="props.planetRadius*460.0/5.0" fill="none" stroke="white" stroke-width="2" />
        <path :d="makeSVGLinearPath([0, 90], [460, 90], 4)" stroke="white" opacity="37.5%" stroke-dasharray="2" marker-mid="url(#svggraph-rings-grad)" marker-end="url(#svggraph-rings-grad)"/>
        <line x1="1" y1="86" x2="1" y2="94" stroke="white" stroke-width="2" />
        <line x1="0" y1="90" x2="5" y2="90" stroke="white" stroke-width="2" />
        <line :x1="(props.planetRadius*460.0/5.0)-3" y1="90" :x2="(props.planetRadius*460.0/5.0)+3" y2="90" stroke="white" stroke-width="2" />

        <text x="5" y="84" text-anchor="start" font-style="italic" font-size="10" fill="white">c</text>
        <text :x="(props.planetRadius*460.0/5.0)+5" y="84" text-anchor="start" font-style="italic" font-size="10" fill="white">s</text>
        <text x="100%" y="8" text-anchor="end" font-size="10" fill="white">c = {{ $t('dialog.planetinfo.rings_center') }}</text>
        <text x="100%" y="20" text-anchor="end" font-size="10" fill="white">s = {{ $t('dialog.planetinfo.rings_surface') }}</text>
      </g>
      <g id="svggraph-biomes-data">
        <g v-for="(r,i) of ringData" :key="r.id">
          <path
            :d="makeSVGRingArc((r.center*460.0)/5.0)"
            fill="none"
            stroke="var(--lg-logo)"
            :stroke-width="(r.width*460.0)/5.0"
          />
          <line :x1="(r.center*460.0)/5.0" y1="90" :x2="(r.center*460.0)/5.0" y2="58" stroke="white" stroke-width="1" />
          <text :x="(r.center*460.0)/5.0" y="50" text-anchor="middle" font-size="14" fill="white">
            {{ String.fromCharCode(i+65) }}
          </text>
        </g>
      </g>
    </svg>
  </svg>
</template>
<script setup lang="ts">
import type { RingParameters } from '@/core/models/ring-parameters.model';
import { makeSVGLinearPath } from '@/core/utils/render-utils';
import Rect from '@core/utils/math/rect';
import { onMounted, ref, type Ref } from 'vue';

const width = 480, height = 200
const svgRect = new Rect(0, 0, width, height)
const graphRect = new Rect(10, 10, width-20, height-20)

const props = defineProps<{ planetRadius: number, rings: RingParameters[] }>()
const ringData: Ref<{id: string, center: number, width: number}[]> = ref([])

onMounted(() => {
  props.rings.toSorted((a,b) => a.innerRadius - b.innerRadius).forEach(r => ringData.value.push({
    id: r.id,
    center: (r.innerRadius+r.outerRadius)/2.0,
    width: r.outerRadius-r.innerRadius
  }))
})

function makeSVGRingArc(radius: number) {
  return `M${radius.toFixed(2)},90 a${radius.toFixed(2)},${radius.toFixed(2)} 0 0 1 ${-radius.toFixed(2)},${radius.toFixed(2)}`
}

</script>
<style scoped lang="scss">
#svggraph-rings {
  margin-top: 0.5rem;
}
</style>