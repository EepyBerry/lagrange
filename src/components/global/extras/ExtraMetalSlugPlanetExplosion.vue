<template>
  <div class="explosion-container" role="presentation">
    <img v-for="i in explosions" :key="i" ref="smallExplosionRef" src="/extras/placeholder.png" class="explosion sm" />
    <img ref="largeExplosionRef" src="/extras/placeholder.png" class="explosion lg" />
  </div>
</template>

<script setup lang="ts">
import { clampedPRNG, clampedPRNGSpaced } from '@/core/utils/math-utils';
import { sleep } from '@/core/utils/utils';
import { useTemplateRef } from 'vue';

const smallExplosionSrc = '/extras/explosion-small.gif';
const largeExplosionSrc = '/extras/explosion-large.gif';

const smallExplosionRefs = useTemplateRef('smallExplosionRef');
const largeExplosionRef = useTemplateRef('largeExplosionRef');

const $props = withDefaults(defineProps<{ smDelay?: number; lgDelay?: number; explosions?: number }>(), {
  smDelay: 100,
  lgDelay: 200,
  explosions: 5,
});
const $emit = defineEmits(['obliteration']);

defineExpose({
  doEffect: async () => {
    const explosionTopLeft = [clampedPRNG(-4, 4), clampedPRNG(-1, 7)];
    for (let i = 0; i < $props.explosions - 1; i++) {
      if (i > 0) {
        await sleep($props.smDelay);
      }
      explosionTopLeft[0] = clampedPRNGSpaced(explosionTopLeft[0], -4, 4, 3, 2);
      explosionTopLeft[1] = clampedPRNGSpaced(explosionTopLeft[1], -1, 7, 3, 2);

      const explosionElem = smallExplosionRefs.value!.at(i)!;
      explosionElem.style.top = explosionTopLeft[0] + 'rem';
      explosionElem.style.left = explosionTopLeft[1] + 'rem';
      explosionElem.src = smallExplosionSrc + '?t=' + Date.now();
    }
    await sleep($props.lgDelay);
    largeExplosionRef.value!.src = largeExplosionSrc;
    $emit('obliteration');
    await sleep(1500);
  },
});
</script>

<style lang="scss">
.explosion-container {
  pointer-events: none;
  z-index: 5;
  position: absolute;
  transform: translateY(-1rem);
  width: 16rem;
  height: 16rem;

  .explosion {
    position: absolute;
    width: 10rem;
    transform-origin: 50% 50%;
  }
  .explosion.lg {
    width: 16rem;
    height: 16rem;
    transform: scale(1.375);
  }
}
</style>
