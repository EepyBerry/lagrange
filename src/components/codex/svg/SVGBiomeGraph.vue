<template>
  <svg id="svggraph-biomes" :viewBox="`${svgRect.x} ${svgRect.y} ${svgRect.w} ${svgRect.h}`">
    <defs>
      <pattern id="grid" :width="graphRect.w/10" :height="graphRect.h/10" patternUnits="userSpaceOnUse">
        <path d="M 0 0 L 45 0 45 45" fill="none" stroke="var(--lg-accent)" stroke-width="2"/>
      </pattern>
      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse" fill="white">
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
      <marker id="notch" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
        <circle cx="4" cy="4" r="4" stroke="none" fill="red" />
      </marker>
    </defs>
    <svg :x="graphRect.x" :y="graphRect.y" :width="graphRect.w" :height="graphRect.h" overflow="visible">
      <g id="svggraph-biomes-grid">
        <rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />
      </g>
      <g id="svggraph-biomes-data">
        <rect 
          v-for="bd of biomeData.toReversed()"
          ref="graphAreas"
          :key="bd.id"
          :x="`${bd.rect.x*100}%`"
          :y="`${bd.rect.y*100}%`"
          :width="graphRect.w*bd.rect.w"
          :height="graphRect.h*bd.rect.h"
          :fill="bd.color"
        />
      </g>
      <g id="svggraph-biomes-axes">
        <line x1="-1" y1="100%" x2="100%" y2="100%" stroke="white" stroke-width="3" marker-mid="url(#notch)" marker-end="url(#arrow)" />
        <text x="100%" :y="graphRect.h+20" text-anchor="end" font-size="12" fill="white" >{{ $t('dialog.planetinfo.biomes_humi') }}</text>
        <line x1="0" y1="100%" x2="0" y2="0" stroke="white" stroke-width="3" marker-mid="url(#notch)" marker-end="url(#arrow)" />
        <text x="0" :y="-10" transform="rotate(-90)" text-anchor="end" font-size="12" fill="white">{{ $t('dialog.planetinfo.biomes_temp') }}</text>
      </g>
      <g id="svggraph-biomes-order">
        <rect
          v-for="(bd, i) of biomeData"
          ref="graphToggles"
          :key="bd.id"
          :x="20*i"
          :y="graphRect.h+6"
          width="16"
          height="16"
          :fill="bd.color"
          :stroke="bd.color"
          @click="toggleGraphBiome(biomeData.length-1-i)"
        />
      </g>
    </svg>
  </svg>
</template>
<script setup lang="ts">
import { BiomeParameters } from '@/core/models/biome-parameters.model';
import Rect from '@/core/utils/math/rect';
import { onMounted, ref, type Ref } from 'vue';

const width = 480, height = 270
const svgRect = new Rect(0, 0, width, height)
const graphRect = new Rect(20, 10, width-30, height-36)

const props = defineProps<{ biomes: BiomeParameters[] }>()
const biomeData: Ref<{id: string, color: string, rect: Rect, show: boolean}[]> = ref([])

const graphAreas: Ref<(SVGRectElement|null)[]> = ref([])
const graphToggles: Ref<(SVGRectElement|null)[]> = ref([])

onMounted(() => {
  props.biomes.forEach(b => biomeData.value.push({
    id: b.id,
    color: '#'+b.color.getHexString(),
    rect: new Rect(b.humiMin, b.tempMin, b.humiMax-b.humiMin, b.tempMax-b.tempMin),
    show: true
  }))
})

function toggleGraphBiome(index: number) {
  biomeData.value[index].show = !biomeData.value[index].show
  const rectElem = graphAreas.value![index]!
  const rectToggle = graphToggles.value![biomeData.value.length-1-index]!

  if (biomeData.value[index].show) {
    rectElem.style.display = 'initial'
    rectToggle.classList.remove('active')
  } else {
    rectElem.style.display = 'none'
    rectToggle.classList.add('active')
  }
}

</script>
<style scoped lang="scss">
#svggraph-biomes-order {
  rect:hover { 
    cursor: pointer;
    filter: brightness(75%);
  }
  rect:not(.active) {
    stroke-width: 0;
  }
  rect.active {
    width: 14px;
    height: 14px;
    transform: translate(1px, 1px);
    fill: transparent;
    stroke-width: 2;
  }
}
#svggraph-biomes-axes {
  text { user-select: none; }
}
@media screen and (max-width: 767px) {
  #svggraph-biomes-order {
    pointer-events: none;
  }
}
</style>