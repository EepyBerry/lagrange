<template>
  <svg :width="width" :height="height" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" :width="width/10" :height="height/10" patternUnits="userSpaceOnUse">
        <rect :width="width/10" :height="height/10" fill="transparent"/>
        <path d="M 0 0 L 48 0 48 48" fill="none" stroke="var(--lg-accent)" stroke-width="2"/>
      </pattern>
      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse" fill="white">
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
    <rect 
      v-for="bd of biomeData"
      :key="bd.id"
      :x="width*bd.rect.x"
      :y="height-(height*bd.rect.h)-(height*bd.rect.y)"
      :width="width*bd.rect.w"
      :height="height*bd.rect.h"
      :fill="bd.color"
    />
    <line x1="0" :y1="height" :x2="width" :y2="height" stroke="white" stroke-width="4" marker-end="url(#arrow)" />
    <line x1="0" :y1="height" :x2="0" :y2="0" stroke="white" stroke-width="4" marker-end="url(#arrow)" />
  </svg>
</template>
<script setup lang="ts">
import { BiomeParameters } from '@/core/models/biome-parameters.model';
import Rect from '@/core/utils/math/rect';
import { onMounted, ref, type Ref } from 'vue';

const width = 480, height = 360

const props = defineProps<{ biomes: BiomeParameters[] }>()
const biomeData: Ref<{id: string, color: string, rect: Rect}[]> = ref([])

onMounted(() => {
  console.log(props.biomes)
  props.biomes.toReversed().forEach(b => biomeData.value.push({
    id: b.id,
    color: '#'+b.color.getHexString(),
    rect: new Rect(b.humiMin, b.tempMin, b.humiMax-b.humiMin, b.tempMax-b.tempMin)
  }))
})
</script>