<template>
  <section v-if="planet" id="planet-hero" :style="{ background: cssPlanetGradient }">
    <div :class="{ 'extra-hologram': EXTRAS_HOLOGRAM_EFFECT }">
      <img
        v-if="planet.preview"
        ref="planetImage"
        id="planet-image"
        :src="planet.preview"
        :aria-label="planet?.data.planetName"
        :alt="planet.data.planetName"
      />
      <iconify-icon v-else icon="ph:planet-thin" width="auto" aria-hidden="true" />
      <span v-if="EXTRAS_CRT_EFFECT" class="effect-crt"></span>
    </div>
    <iconify-icon id="planet-star" icon="ph:star-four-fill" width="1.25rem" aria-hidden="true" />
    <article>
      <h3 id="planet-name">{{ planet.data.planetName }}</h3>
      <p id="planet-type-class">
        <span>{{ $t(getI18nPlanetType(planet.data.planetType)) }}</span>
        <span>·</span>
        <span>{{ $t(getI18nPlanetClass(planet.data.planetClass)) }}</span>
      </p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { EXTRAS_CRT_EFFECT, EXTRAS_HOLOGRAM_EFFECT } from '@core/extras.ts';
import { getI18nPlanetClass, getI18nPlanetType } from '@core/utils/i18n-utils.ts';
import { prominent } from 'color.js';
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import type { IDBPlanet } from '@/dexie.config.ts';

const planet = defineModel<IDBPlanet>();
const cssPlanetRadius: Ref<string> = ref('100%');
const cssPlanetGradient: Ref<string> = ref('');
const cssStarColor: Ref<string> = ref('');
const planetImageScale: ComputedRef<number> = computed(() => 0.9 / (planet.value?.data.planetRadius ?? 0.75));

watch(planet, applyStyle);
async function applyStyle() {
  cssStarColor.value = planet.value!.data.sunLightColor.getStyle();
  cssPlanetRadius.value = planet.value!.data.planetRadius * 100 + '%';
  const dominantColor = await prominent(planet.value!.preview!, { amount: 2, format: 'hex', sample: 8, group: 20 });
  cssPlanetGradient.value = `linear-gradient(90deg, ${dominantColor[1] + '60'} 0%, var(--lg-panel) 100%)`;
}
</script>

<style scoped lang="scss">
#planet-hero {
  position: relative;
  width: 100%;
  padding: 0.5rem;

  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;

  $img-size: 10rem;
  #planet-star {
    position: absolute;
    top: 1rem;
    right: 1rem;
    color: v-bind(cssStarColor);
    filter: drop-shadow(0 0 8px v-bind(cssStarColor));
  }
  & > div {
    width: $img-size;
    height: $img-size;

    img#planet-image {
      width: $img-size;
      height: $img-size;
      transform: scale(v-bind(planetImageScale));
      filter: drop-shadow(0 0 4px #0008);
    }
  }
  h3 {
    font-size: 1.25rem;
  }
  article {
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-shadow: 0 0 4px black;

    #planet-type-class {
      color: var(--lg-text-alt);
      letter-spacing: 0.5px;
      font-weight: 400;

      display: flex;
      gap: 8px;
    }
  }
}

@media screen and (max-width: 767px) {
  #planet-hero {
    & > article {
      #planet-name {
        font-size: 1.5rem;
      }
      #planet-type-class {
        font-size: 1.125rem;
      }
    }
  }
}
@media screen and (max-width: 567px) {
  #planet-hero {
    flex-direction: column;
    & > article {
      align-items: center;
      text-align: center;
    }
  }
}
</style>
