<template>
  <LgvDialog
    id="dialog-planet-info"
    ref="dialogRef"
    :show-title="true"
    :show-actions="false"
    :closeable="true"
    :aria-label="$t('a11y.dialog_planet_info')"
  >
    <template #title>
      <iconify-icon class="contrast" icon="ph:planet" width="1.5rem" aria-hidden="true" />
      {{ $t('dialog.planet_info.$title') }}
    </template>
    <template #content v-if="planet">
      <div class="__layout">
        <span class="__spacing" />
        <div class="__main">
          <section id="planet-hero" :style="{ background: cssPlanetGradient }">
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
              <h3>{{ planet.data.planetName }}</h3>
              <p id="planet-type-class">
                <span>{{ $t(getI18nPlanetType(planet.data.planetType)) }}</span>
                <span>·</span>
                <span>{{ $t(getI18nPlanetClass(planet.data.planetClass)) }}</span>
              </p>
            </article>
          </section>
          <LgvTabGroup ref="sidebarRef" :tabs="sidebarTabs">
            <!-- BASE TAB -->
            <template #tab-0 id="tab-base"> </template>

            <!-- BIOMES TAB -->
            <template #tab-1>
              <div id="tab-biomes">
                <LgvNotification type="info"
                  >Each biome is represented on the graph below as an area. Its bounds are defined by the biome's
                  min/max temperature and humidity values: a high-humidity biome will be more on the right, a
                  high-temperature biome will be more to the top, and vice versa.
                </LgvNotification>
                <div id="biomes__container">
                  <ul id="biomes__list" class="data-list">
                    <li
                      v-for="biome in planet.data.biomesParams"
                      :key="biome.id"
                      :style="{
                        borderColor: biome.color.getStyle(),
                        background:
                          cssHoveredBiomeArea === biome.id
                            ? `linear-gradient(
                                 to right,
                                 #${biome.color.getHexString()}7f 0%,
                                 transparent 40%,
                                 transparent 60%,
                                 #${biome.color.getHexString()}7f 100%
                               )`
                            : '',
                      }"
                    >
                      <p class="biome__id">{{ biome.id }}</p>
                      <p class="biome__coords">
                        <span class="data-value"
                          >X&nbsp;=&nbsp;{{ (biome.humiMin * 100).toFixed(1) }} -
                          {{ (biome.humiMax * 100).toFixed(1) }}</span
                        >
                        <span class="data-value"
                          >Y&nbsp;=&nbsp;{{ (biome.tempMin * 100).toFixed(1) }} -
                          {{ (biome.tempMax * 100).toFixed(1) }}</span
                        >
                      </p>
                    </li>
                  </ul>
                  <BiomeGraph
                    id="biomes__graph"
                    :areas="planetBiomeAreas"
                    @area-hover="cssHoveredBiomeArea = $event"
                    @area-leave="cssHoveredBiomeArea = null"
                  />
                </div>
              </div>
            </template>

            <!-- CRACKS TAB -->
            <template #tab-2> </template>

            <!-- CRATERS TAB -->
            <template #tab-3> </template>

            <!-- RINGS TAB -->
            <template #tab-4> </template>
          </LgvTabGroup>
        </div>
      </div>
    </template>
  </LgvDialog>
</template>
<script setup lang="ts">
import type { PlanetInfoDialogExposes } from '@components/codex/dialogs/PlanetInfoDialog.types.ts';
import type { LgvDialogExposes } from '@lib/components/custom/LgvDialog.types.ts';
import type { LgvTabGroupExposes, LvgTabGroupTab } from '@lib/components/layout/LgvTabGroup.types.ts';
import BiomeGraph, { type BiomeArea } from '@components/codex/graphs/BiomeGraph.vue';
import { EXTRAS_CRT_EFFECT, EXTRAS_HOLOGRAM_EFFECT } from '@core/extras';
import { getI18nPlanetClass, getI18nPlanetType } from '@core/utils/i18n-utils.ts';
import Rect from '@core/utils/math/rect.ts';
import LgvDialog from '@lib/components/custom/LgvDialog.vue';
import LgvNotification from '@lib/components/custom/LgvNotification.vue';
import LgvTabGroup from '@lib/components/layout/LgvTabGroup.vue';
import { prominent } from 'color.js';
import { computed, type ComputedRef, ref, type Ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import type { IDBPlanet } from '@/dexie.config';

defineExpose<PlanetInfoDialogExposes>({ open });

const i18n = useI18n();
const dialogRef = useTemplateRef<LgvDialogExposes>('dialogRef');
const sidebarRef = useTemplateRef<LgvTabGroupExposes>('sidebarRef');

const planet: Ref<IDBPlanet | null> = ref(null);
const sidebarTabs: ComputedRef<LvgTabGroupTab[]> = computed(() => [
  { icon: 'pepicons-pencil:planet', iconWidth: '1.5rem', title: i18n.t('dialog.planet_info.tabs.basic') },
  {
    icon: 'material-symbols-light:nest-eco-leaf-outline',
    iconWidth: '2rem',
    title: i18n.t('dialog.planet_info.tabs.biomes'),
    disabled: !planet.value?.data.biomesEnabled,
  },
  {
    icon: 'material-symbols-light:explosion-outline',
    iconWidth: '1.75rem',
    title: i18n.t('dialog.planet_info.tabs.cracks'),
    disabled: !planet.value?.data.cracksEnabled,
  },
  {
    icon: 'hugeicons:moon-01',
    iconWidth: '1.5rem',
    title: i18n.t('dialog.planet_info.tabs.craters'),
    disabled: !planet.value?.data.cratersEnabled,
  },
  {
    icon: 'pepicons-pencil:planet-ring',
    iconWidth: '1.75rem',
    title: i18n.t('dialog.planet_info.tabs.rings'),
    disabled: !planet.value?.data.ringsEnabled,
  },
]);

const cssHoveredBiomeArea: Ref<string | null> = ref(null);
const cssPlanetRadius: Ref<string> = ref('100%');
const cssPlanetGradient: Ref<string> = ref('');
const cssStarColor: Ref<string> = ref('');

const planetImageScale: ComputedRef<number> = computed(() => 0.9 / (planet.value?.data.planetRadius ?? 0.75));
const planetBiomeAreas: ComputedRef<BiomeArea[]> = computed(
  () =>
    planet.value?.data.biomesParams.map((b) => ({
      id: b.id,
      color: b.color,
      rect: new Rect(b.humiMin, b.tempMin, b.humiMax - b.humiMin, b.tempMax - b.tempMin),
    })) ?? [],
);

async function open(p: IDBPlanet) {
  planet.value = p;
  await updateCssProperties(p);
  sidebarRef.value!.reset();
  dialogRef.value?.open();
}

async function updateCssProperties(planet: IDBPlanet) {
  cssStarColor.value = planet.data.sunLightColor.getStyle();
  cssPlanetRadius.value = planet.data.planetRadius * 100 + '%';
  const dominantColor = await prominent(planet.preview!, { amount: 2, format: 'hex', sample: 8, group: 20 });
  cssPlanetGradient.value = `linear-gradient(90deg, ${dominantColor[1] + '60'} 0%, var(--lg-panel) 100%)`;
}
</script>

<style scoped lang="scss">
#dialog-planet-info {
  width: 840px;

  .__layout {
    overflow: hidden;
    border-top: 2px solid var(--lg-accent);

    display: grid;
    grid-template-columns: auto 1fr;

    & > .__spacing {
      width: 24px;
      border-right: 2px solid var(--lg-accent);
    }

    & > .__main {
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
  }

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
}

#tab-base {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

#tab-biomes {
  width: 100%;
  padding: 0.5rem;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;

  #biomes__container {
    width: 100%;
    max-height: 300px;
    overflow: hidden;

    display: grid;
    grid-template-columns: 1fr 2fr;
    align-items: flex-start;
    justify-content: center;
    gap: 0.5rem;

    #biomes__list {
      height: 100%;
      overflow-x: hidden;
      overflow-y: auto;

      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;

      li {
        width: 100%;

        border-width: 4px;
        border-style: solid;
        border-top: none;
        border-bottom: none;
        background: var(--lg-panel);

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        gap: 4px;

        .biome__id {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 16ch;
        }
        .biome__coords {
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
      }
    }
  }
}
#tab-rings {
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.data-value {
  padding: 0.25rem 0.5rem;
  background: var(--lg-panel);
  border: 1px solid var(--lg-input);
}

@media screen and (max-width: 767px) {
  #tab-biomes {
    #biomes__container {
      grid-template-columns: 1fr 1fr;
    }
  }
}

@media screen and (max-width: 567px) {
  #dialog-planet-info {
    .__layout {
      grid-template-columns: 1fr;
    }
    .__spacing {
      display: none;
    }
  }
  #planet-hero {
    flex-direction: column;
    & > article {
      align-items: center;
    }
  }
  #tab-biomes {
    .notification {
      display: none;
    }
    #biomes__container {
      grid-template-columns: 1fr;
      #biomes__graph {
        display: none;
      }
    }
  }
}
</style>
