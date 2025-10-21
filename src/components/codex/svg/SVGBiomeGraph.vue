<template>
  <svg id="svggraph-biomes" ref="svgNodeRef" :viewBox="`${svgRect.x} ${svgRect.y} ${svgRect.w} ${svgRect.h}`">
    <defs>
      <pattern id="grid" width="45" height="28" patternUnits="userSpaceOnUse">
        <path d="M 0 0 L 45 0 45 45" fill="none" stroke="var(--lg-accent)" stroke-width="2"/>
      </pattern>
      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse" fill="white">
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
      <!-- <marker id="notch" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
        <circle cx="4" cy="4" r="4" stroke="none" fill="red" />
      </marker> -->
    </defs>
    <svg :x="graphRect.x" :y="graphRect.y" :width="graphRect.w" :height="graphRect.h" overflow="visible">
      <g id="svggraph-biomes-grid">
        <rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />
      </g>
      <g id="svggraph-biomes-data">
        <rect 
          v-for="bd of biomeData.toReversed()"
          :key="bd.id"
          :x="`${bd.rect.x*100}%`"
          :y="`${bd.rect.y*100}%`"
          :width="graphRect.w*bd.rect.w"
          :height="graphRect.h*bd.rect.h"
          :fill="bd.color"
        />
      </g>
      <g id="svggraph-biomes-axes">
        <line x1="0" y1="100%" x2="100%" y2="100%" stroke="white" stroke-width="3" marker-mid="url(#notch)" marker-end="url(#arrow)" />
        <text x="100%" :y="graphRect.h+20" text-anchor="end" font-size="12" fill="white" >{{ $t('dialog.planetinfo.biomes_humi') }}</text>
        <line x1="0" y1="100%" x2="0" y2="0" stroke="white" stroke-width="3" marker-mid="url(#notch)" marker-end="url(#arrow)" />
        <text x="0" :y="-10" transform="rotate(-90)" text-anchor="end" font-size="12" fill="white">{{ $t('dialog.planetinfo.biomes_temp') }}</text>
      </g>
      <g id="svggraph-biomes-order">
        <rect
          v-for="(bd, i) of biomeData"
          :key="bd.id"
          :x="18*i"
          :y="graphRect.h+8"
          width="14"
          height="14"
          :fill="bd.color"
        />
      </g>
    </svg>
  </svg>
</template>
<script setup lang="ts">
import { BiomeParameters } from '@/core/models/biome-parameters.model';
import Rect from '@/core/utils/math/rect';
import { onMounted, ref, type Ref } from 'vue';

const width = 480, height = 360
const svgRect = new Rect(0, 0, width, height)
const graphRect = new Rect(20, 10, width-30, height-80)

const props = defineProps<{ biomes: BiomeParameters[] }>()
const biomeData: Ref<{id: string, color: string, rect: Rect}[]> = ref([])
const svgNodeRef: Ref<SVGGraphicsElement|null> = ref(null)

onMounted(() => {
  console.log(props.biomes)
  props.biomes.forEach(b => biomeData.value.push({
    id: b.id,
    color: '#'+b.color.getHexString(),
    rect: new Rect(b.humiMin, b.tempMin, b.humiMax-b.humiMin, b.tempMax-b.tempMin)
  }))
})
</script>
<style scoped lang="scss">
#svg-biome-graph {
  aspect-ratio: v-bind(width)/v-bind(height);
}
</style>