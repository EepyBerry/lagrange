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
      <div id="planet-info-container">
        <aside id="planet-info-tabs">
          <LgvButton
            tabindex="0"
            variant="icon"
            icon="pepicons-pencil:planet"
            icon-width="1.5rem"
            :class="{ active: selectedTab === 'base' }"
            :title="$t('dialog.planet_info.tabs.base')"
            @click="selectedTab = 'base'"
          />
          <LgvButton
            tabindex="0"
            variant="icon"
            icon="material-symbols-light:nest-eco-leaf-outline"
            icon-width="2rem"
            :class="{ active: selectedTab === 'biomes' }"
            :title="$t('dialog.planet_info.tabs.biomes')"
            :disabled="!planet.data.biomesEnabled"
            @click="selectedTab = 'biomes'"
          />
          <LgvButton
            tabindex="0"
            variant="icon"
            icon="material-symbols-light:explosion-outline"
            icon-width="1.75rem"
            :class="{ active: selectedTab === 'cracks' }"
            :title="$t('dialog.planet_info.tabs.cracks')"
            :disabled="!planet.data.cracksEnabled"
            @click="selectedTab = 'cracks'"
          />
          <LgvButton
            tabindex="0"
            variant="icon"
            icon="hugeicons:moon-01"
            :class="{ active: selectedTab === 'craters' }"
            :title="$t('dialog.planet_info.tabs.craters')"
            :disabled="!planet.data.cratersEnabled"
            @click="selectedTab = 'craters'"
          />
          <LgvButton
            tabindex="0"
            variant="icon"
            icon="pepicons-pencil:planet-ring"
            icon-width="1.75rem"
            :class="{ active: selectedTab === 'rings' }"
            :title="$t('dialog.planet_info.tabs.rings')"
            :disabled="!planet.data.ringsEnabled"
            @click="selectedTab = 'rings'"
          />
        </aside>
        <div id="planet-info-content">
          <!-- BASE TAB -->
          <section v-if="selectedTab === 'base'" id="tab-base">
            <section id="planet-hero" :style="{ background: cssPlanetGradient }">
              <div :class="{ 'extra-hologram': EXTRAS_HOLOGRAM_EFFECT }">
                <img
                  v-if="planet.preview"
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
          </section>

          <!-- BIOMES TAB -->
          <section v-if="selectedTab === 'biomes'" id="tab-biomes">
            <h3>{{ $t('dialog.planet_info.biomes') }}</h3>
            <div class="graph-container">
              <SVGBiomeGraph :key="planet.data.biomesParams[0].id" :biomes="planet.data.biomesParams" />
            </div>
          </section>

          <section v-if="selectedTab === 'cracks'" id="tab-cracks">test</section>

          <!-- RINGS TAB -->
          <section v-if="selectedTab === 'rings'" id="tab-rings">
            <h3>{{ $t('dialog.planet_info.rings') }}</h3>
            <div class="graph-container">
              <SVGRingsGraph
                :key="planet.data.ringsParams[0].id"
                :planet-radius="planet.data.planetRadius"
                :rings="planet.data.ringsParams"
              />
            </div>
          </section>
        </div>
      </div>
    </template>
  </LgvDialog>
</template>
<script setup lang="ts">
import type { PlanetInfoDialogExposes } from '@components/codex/dialogs/PlanetInfoDialog.types.ts';
import type { LgvDialogExposes } from '@lib/components/custom/LgvDialog.types.ts';
import { EXTRAS_CRT_EFFECT, EXTRAS_HOLOGRAM_EFFECT } from '@core/extras';
import { getI18nPlanetClass, getI18nPlanetType } from '@core/utils/i18n-utils.ts';
import LgvButton from '@lib/components/base/LgvButton.vue';
import LgvDialog from '@lib/components/custom/LgvDialog.vue';
import { prominent } from 'color.js';
import { ref, type Ref, useTemplateRef } from 'vue';
import type { IDBPlanet } from '@/dexie.config';
import SVGBiomeGraph from '../svg/SVGBiomeGraph.vue';
import SVGRingsGraph from '../svg/SVGRingsGraph.vue';

const dialogRef = useTemplateRef<LgvDialogExposes>('dialogRef');
defineExpose<PlanetInfoDialogExposes>({ open });

const planet: Ref<IDBPlanet | null> = ref(null);
const selectedTab: Ref<'base' | 'biomes' | 'cracks' | 'craters' | 'rings'> = ref('base');
const cssPlanetRadius: Ref<string> = ref('100%');
const cssPlanetGradient: Ref<string> = ref('');
const cssStarColor: Ref<string> = ref('');

function open(p: IDBPlanet) {
  planet.value = p;
  cssStarColor.value = p.data.sunLightColor.getStyle();
  cssPlanetRadius.value = p.data.planetRadius * 100 + '%';
  selectedTab.value = 'base';
  calculatePlanetGradient().then(() => dialogRef.value?.open());
}

async function calculatePlanetGradient() {
  const dominantColor = await prominent(planet.value!.preview!, { amount: 2, format: 'hex', sample: 8, group: 20 });
  cssPlanetGradient.value = `linear-gradient(90deg, ${dominantColor[1] + '7f'} 0%, var(--lg-panel) 100%)`;
}
</script>

<style lang="scss">
#dialog-planet-info {
  width: 800px;

  .dialog-header {
    border-bottom: 1px solid var(--lg-accent);
  }

  #planet-info-container {
    position: relative;
    overflow: hidden;
    min-height: calc(5 * 2.75rem);
    height: 100%;

    display: grid;
    grid-auto-columns: auto 1fr;

    #planet-info-tabs {
      grid-column: 1;
      margin-top: 1px;
      overflow: hidden;
      border-right: 1px solid var(--lg-accent);

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;

      button {
        width: 2.75rem;
        height: 2.75rem;

        &.active {
          color: var(--lg-contrast);
          pointer-events: none;
        }
      }
      button.active::after {
        content: '';
        position: absolute;
        inset: 0 -1px 0 auto;
        background: var(--lg-contrast);
        width: 5px;
        clip-path: polygon(0 4px, 100% 0, 100% 100%, 0 calc(100% - 4px));
      }
    }
    #planet-info-content {
      grid-column: 2;
      margin-top: 1px;
      overflow-y: auto;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  }
}
#tab-base {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  #planet-hero {
    position: relative;
    width: 100%;
    padding: 0.5rem;
    background: var(--lg-panel);
    border-bottom: 1px solid var(--lg-accent);

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
#tab-biomes {
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
#tab-rings {
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.graph-container {
  padding: 1px;
  background: var(--lg-input);
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%);

  svg {
    width: 600px;
    padding: 0.5rem;
    background: var(--lg-panel);
    clip-path: polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%);
  }
}

@media screen and (max-width: 767px) {
}
@media screen and (max-width: 567px) {
}
</style>
