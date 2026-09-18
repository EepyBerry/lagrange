<template>
  <LgvDialog
    id="dialog-planet-info"
    ref="dialogRef"
    :show-spacing="true"
    :show-title="true"
    :show-actions="false"
    :closeable="true"
    :aria-label="$t('a11y.dialog_planet_info')"
  >
    <template #title>
      <iconify-icon class="contrast" icon="ph:planet" width="1.5rem" aria-hidden="true" />
      {{ $t('dialog.planet_info.$title') }}
    </template>
    <template #content>
      <LgvPlanetHero v-model="planet" />
      <LgvTabGroup ref="sidebarRef" v-if="planet" :tabs="sidebarTabs">
        <!-- BASE TAB -->
        <template #tab-overview>
          <div id="tab-overview">
            <div id="tab-overview-main">
              <PlanetOutlineGraph :planet="planet.data" />
            </div>
            <LgvDescriptionList id="tab-overview-features">
              <LgvDescriptionElement icon="fluent:leaf-two-20-regular">
                <template #label>{{ $t('dialog.planet_info.basic.has_biomes') }}</template>
                <template #value>
                  <LgvBadge :class="planet.data.biomesEnabled ? 'success' : 'warn'">
                    {{ $t(planet.data.biomesEnabled ? 'common.yes' : 'common.no') }}
                  </LgvBadge>
                </template>
              </LgvDescriptionElement>
              <LgvDescriptionElement icon="hugeicons:moon-01">
                <template #label>{{ $t('dialog.planet_info.basic.has_cracks') }}</template>
                <template #value>
                  <LgvBadge :class="planet.data.cracksEnabled ? 'success' : 'warn'">
                    {{ $t(planet.data.cracksEnabled ? 'common.yes' : 'common.no') }}
                  </LgvBadge>
                </template>
              </LgvDescriptionElement>
              <LgvDescriptionElement icon="material-symbols:explosion-outline">
                <template #label>{{ $t('dialog.planet_info.basic.has_craters') }}</template>
                <template #value>
                  <LgvBadge :class="planet.data.cratersEnabled ? 'success' : 'warn'">
                    {{ $t(planet.data.cratersEnabled ? 'common.yes' : 'common.no') }}
                  </LgvBadge>
                </template>
              </LgvDescriptionElement>
              <LgvDescriptionElement icon="material-symbols-light:cloud-outline">
                <template #label>{{ $t('dialog.planet_info.basic.has_clouds') }}</template>
                <template #value>
                  <LgvBadge :class="planet.data.cloudsEnabled ? 'success' : 'warn'">
                    {{ $t(planet.data.cloudsEnabled ? 'common.yes' : 'common.no') }}
                  </LgvBadge>
                </template>
              </LgvDescriptionElement>
              <LgvDescriptionElement icon="material-symbols:line-curve">
                <template #label>{{ $t('dialog.planet_info.basic.has_atmosphere') }}</template>
                <template #value>
                  <LgvBadge :class="planet.data.atmosphereEnabled ? 'success' : 'warn'">
                    {{ $t(planet.data.atmosphereEnabled ? 'common.yes' : 'common.no') }}
                  </LgvBadge>
                </template>
              </LgvDescriptionElement>
              <LgvDescriptionElement icon="ph:planet-thin">
                <template #label>{{ $t('dialog.planet_info.basic.has_rings') }}</template>
                <template #value>
                  <LgvBadge :class="planet.data.ringsEnabled ? 'success' : 'warn'">
                    {{ $t(planet.data.ringsEnabled ? 'common.yes' : 'common.no') }}
                  </LgvBadge>
                </template>
              </LgvDescriptionElement>
            </LgvDescriptionList>
          </div>
        </template>

        <!-- TOPOGRAPHY TAB -->
        <template #tab-topography>
          <div id="tab-topography">
            <LgvNotification type="wip">WIP</LgvNotification>
          </div>
        </template>

        <!-- BIOMES TAB -->
        <template #tab-biomes>
          <div id="tab-biomes">
            <ul id="biomes__list" class="data-list">
              <li v-for="biome in planet.data.biomesParams" :key="biome.id">
                <LgvButton
                  variant="blank"
                  :style="{
                    background:
                      cssHoveredBiome === biome.id
                        ? `linear-gradient(
                             to right,
                             #${biome.color.getHexString()}7f 0%,
                             transparent 40%,
                             transparent 60%,
                             #${biome.color.getHexString()}7f 100%
                           )`
                        : '',
                  }"
                  @focusin="cssHoveredBiome = biome.id"
                  @focusout="cssHoveredBiome = null"
                  @mouseover="cssHoveredBiome = biome.id"
                  @mouseleave="cssHoveredBiome = null"
                >
                  <div class="button__container">
                    <span
                      class="biome__background"
                      :style="{
                        borderLeftColor: biome.color.getStyle(),
                        borderRightColor: biome.color.getStyle(),
                      }"
                    />
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
                  </div>
                </LgvButton>
              </li>
            </ul>
            <BiomeGraph
              id="biomes__graph"
              v-model="cssHoveredBiome"
              :areas="planetBiomeAreas"
              @ring-hover="cssHoveredBiome = $event"
              @ring-leave="cssHoveredBiome = null"
            />
          </div>
        </template>

        <!-- RINGS TAB -->
        <template #tab-rings>
          <div id="tab-rings">
            <ul id="rings__list" class="data-list">
              <li v-for="(ring, i) in planet.data.ringsParams" :key="ring.id">
                <LgvButton
                  variant="blank"
                  :style="{
                    background:
                      cssHoveredRing === ring.id
                        ? `linear-gradient(
                             to top,
                             var(--lg-contrast-hover) 0%,
                             transparent 75%
                           )`
                        : '',
                  }"
                  @focusin="cssHoveredRing = ring.id"
                  @focusout="cssHoveredRing = null"
                  @mouseover="cssHoveredRing = ring.id"
                  @mouseleave="cssHoveredRing = null"
                >
                  <div class="button__container">
                    <span class="ring__background" />
                    <p class="ring__id">{{ String.fromCharCode(i + 65) }}</p>
                    <p class="ring__data">
                      <span class="data-value">
                        <span class="mathsymbol">r<sub>min</sub></span>
                        <span>&nbsp;=&nbsp;</span>
                        <span>{{ ring.innerRadius }}&nbsp;u</span>
                      </span>
                      <span class="data-value">
                        <span class="mathsymbol">r<sub>max</sub></span>
                        <span>&nbsp;=&nbsp;</span>
                        <span>{{ ring.outerRadius }}&nbsp;u</span>
                      </span>
                    </p>
                  </div>
                </LgvButton>
              </li>
            </ul>
            <RingsGraph
              id="rings__graph"
              v-model="cssHoveredRing"
              :planet-preview="planet.preview"
              :planet-radius="planet.data.planetRadius"
              :rings="planetRings"
              @area-hover="cssHoveredRing = $event"
              @area-leave="cssHoveredRing = null"
            />
          </div>
        </template>
      </LgvTabGroup>
    </template>
  </LgvDialog>
</template>
<script setup lang="ts">
import type { PlanetInfoDialogExposes } from '@components/codex/dialogs/PlanetInfoDialog.types.ts';
import type { LgvDialogExposes } from '@lib/components/base/LgvDialog.types.ts';
import type { LgvTabGroupExposes, LvgTabGroupTab } from '@lib/components/layout/LgvTabGroup.types.ts';
import BiomeGraph, { type BiomeArea } from '@components/codex/graphs/BiomeGraph.vue';
import PlanetOutlineGraph from '@components/codex/graphs/PlanetOutlineGraph.vue';
import RingsGraph, { type Ring } from '@components/codex/graphs/RingsGraph.vue';
import Rect from '@core/utils/math/rect.ts';
import LgvButton from '@lib/components/base/LgvButton.vue';
import LgvDescriptionElement from '@lib/components/base/LgvDescriptionElement.vue';
import LgvDescriptionList from '@lib/components/base/LgvDescriptionList.vue';
import LgvDialog from '@lib/components/base/LgvDialog.vue';
import LgvBadge from '@lib/components/custom/LgvBadge.vue';
import LgvNotification from '@lib/components/custom/LgvNotification.vue';
import LgvPlanetHero from '@lib/components/custom/LgvPlanetHero.vue';
import LgvTabGroup from '@lib/components/layout/LgvTabGroup.vue';
import { computed, type ComputedRef, ref, type Ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import type { IDBPlanet } from '@/dexie.config';

defineExpose<PlanetInfoDialogExposes>({ open });

const i18n = useI18n();
const dialogRef = useTemplateRef<LgvDialogExposes>('dialogRef');
const sidebarRef = useTemplateRef<LgvTabGroupExposes>('sidebarRef');

const planet: Ref<IDBPlanet | undefined> = ref(undefined);
const sidebarTabs: ComputedRef<LvgTabGroupTab[]> = computed(() => [
  {
    name: 'overview',
    icon: 'material-symbols:overview-outline',
    iconWidth: '1.5rem',
    title: i18n.t('dialog.planet_info.tabs.overview'),
  },
  {
    name: 'topography',
    icon: 'hugeicons:moon-01',
    iconWidth: '1.5rem',
    title: i18n.t('dialog.planet_info.tabs.topography'),
    disabled: !planet.value?.data.cracksEnabled && !planet.value?.data.cratersEnabled,
  },
  {
    name: 'biomes',
    icon: 'fluent:leaf-two-20-regular',
    iconWidth: '2rem',
    title: i18n.t('dialog.planet_info.tabs.biomes'),
    disabled: !planet.value?.data.biomesEnabled,
  },
  {
    name: 'rings',
    icon: 'ph:planet',
    iconWidth: '1.75rem',
    title: i18n.t('dialog.planet_info.tabs.rings'),
    disabled: !planet.value?.data.ringsEnabled,
  },
]);

const cssHoveredBiome: Ref<string | null> = ref(null);
const planetBiomeAreas: ComputedRef<BiomeArea[]> = computed(
  () =>
    planet.value?.data.biomesParams.map((b) => ({
      id: b.id,
      color: b.color,
      rect: new Rect(b.humiMin, b.tempMin, b.humiMax - b.humiMin, b.tempMax - b.tempMin),
    })) ?? [],
);

const cssHoveredRing: Ref<string | null> = ref(null);
const planetRings: ComputedRef<Ring[]> = computed(
  () =>
    planet.value?.data.ringsParams.map((r) => ({
      id: r.id,
      colorRamp: r.colorRamp,
      innerRadius: r.innerRadius,
      outerRadius: r.outerRadius,
    })) ?? [],
);

async function open(p: IDBPlanet) {
  planet.value = p;
  sidebarRef.value?.reset();
  dialogRef.value?.open();
}
</script>

<style scoped lang="scss">
#dialog-planet-info {
  width: 840px;
}

#tab-overview {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 1rem;

  & > #tab-overview-main {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  & > #tab-overview-features {
    flex-grow: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}

#tab-topography {
}

#tab-biomes {
  width: 100%;
  max-height: 300px;
  overflow: hidden;

  display: grid;
  grid-template-columns: 300px 1fr;
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

    li {
      position: relative;
      padding: 0;
      width: 100%;
      border-bottom: 1px solid var(--lg-accent);

      button {
        width: 100%;
        padding: 0.25rem;
        .button__container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
      }

      .biome__background {
        position: absolute;
        inset: 4px 0;
        border-style: solid;
        border-width: 4px;
        border-top-color: transparent;
        border-bottom-color: transparent;
      }
      .biome__id {
        z-index: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 16ch;
      }
      .biome__coords {
        z-index: 1;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }
    }
    li:last-child {
      border-bottom: none;
    }
  }
}

#tab-rings {
  height: 100%;
  width: 100%;

  display: grid;
  grid-template-rows: auto 1fr;
  align-items: flex-start;
  gap: 0.5rem;

  #rings__list {
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;

    display: flex;
    align-items: flex-start;
    gap: 0.75rem;

    li {
      position: relative;
      padding: 0;
      height: 100%;
      list-style-type: none;

      button {
        width: 100%;
        padding: 0.25rem;
        .button__container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
      }

      .ring__background {
        position: absolute;
        inset: 0;
        border-width: 3px;
        border-style: solid;
        border-color: transparent;
        border-bottom-color: var(--lg-contrast);
      }
      .ring__id {
        z-index: 1;
        font-size: 20px;
        margin-left: 6px;
      }
      .ring__data {
        z-index: 1;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }
    }
  }
}

.data-value {
  padding: 0.125rem 0.25rem;
  background: var(--lg-panel);
  border: 1px solid var(--lg-input);
}

@media screen and (max-width: 767px) {
  #tab-overview {
    padding: 0.5rem;
    flex-direction: column;
    gap: 1rem;
    & > * {
      width: 100%;
    }
  }
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
