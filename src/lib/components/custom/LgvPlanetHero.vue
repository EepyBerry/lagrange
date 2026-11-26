<template>
  <section v-if="planet" id="planet-hero" :style="{ background: cssPlanetGradient }">
    <div id="planet-hero__inner">
      <img
        v-if="planet.preview"
        ref="planetImage"
        id="planet-image"
        :src="planet.preview"
        :aria-label="planet?.data.planetName"
        :alt="planet.data.planetName"
      />
      <iconify-icon v-else icon="ph:planet-thin" width="auto" aria-hidden="true" />
    </div>
    <article id="planet-hero-header">
      <h3 id="planet-name">{{ planet.data.planetName }}</h3>
      <p id="planet-type-class">
        <span>{{ $t(getI18nPlanetType(planet.data.planetType)) }}</span>
        <span>·</span>
        <span>{{ $t(getI18nPlanetClass(planet.data.planetClass)) }}</span>
      </p>
    </article>
    <div id="planet-hero-side">
      <iconify-icon id="planet-star" icon="ph:star-four-fill" width="1.25rem" aria-hidden="true" />
      <SVGGizmoPlanetHeroBarcode />
    </div>
  </section>
</template>

<script setup lang="ts">
import SVGGizmoPlanetHeroBarcode from '@components/global/svg/SVGGizmoPlanetHeroBarcode.vue';
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

  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;

  $img-size: 10rem;
  #planet-star {
    color: v-bind(cssStarColor);
    filter: drop-shadow(0 0 8px v-bind(cssStarColor));
  }
  #planet-hero__inner {
    margin: 0.5rem;
    width: $img-size;
    height: $img-size;

    img#planet-image {
      width: $img-size;
      height: $img-size;
      transform: scale(v-bind(planetImageScale));
      filter: drop-shadow(0 0 4px var(--lg-shadow-dark));
    }
  }
  h3 {
    font-size: 1.25rem;
  }
  #planet-hero-header {
    z-index: 1;
    flex: 1;
    margin: 0.5rem;
    height: 100%;
    text-shadow: 0 0 4px black;

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 4px;

    #planet-type-class {
      color: var(--lg-text-alt);
      letter-spacing: 0.5px;
      font-weight: 400;

      text-wrap: nowrap;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      row-gap: 0;
    }
  }
  #planet-hero-side {
    height: 100%;
    padding: 1.25rem 0.5rem 0.5rem;
    border-left: var(--lg-var-border-width) solid var(--lg-accent);

    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}

@media screen and (max-width: 767px) {
  #planet-hero {
    #planet-hero-header {
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
    #planet-hero-header {
      align-items: center;
      text-align: center;
    }
    #planet-hero-side {
      z-index: 0;
      position: absolute;
      right: 0;
      border: none;
      svg {
        display: none;
      }
    }
  }
}
</style>
