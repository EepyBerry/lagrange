<template>
  <DialogElement
    id="dialog-planet-info"
    ref="dialogRef"
    :show-title="true"
    :show-actions="false"
    :closeable="true"
    :aria-label="$t('a11y.dialog_planetinfo')"
  >
    <template #title>
      <iconify-icon icon="mingcute:planet-line" width="1.5rem" aria-hidden="true" />
      {{ $t('dialog.planetinfo.$title') }}
    </template>
    <template #content>
      <div class="info-grid" role="grid">
        <!-- planet name -->
        <section id="planet-name">
          <div class="banner" role="presentation">
            <h3>{{ planet?.data.planetName }}</h3>
          </div>
          <SeparatorGreebleDeco />
        </section>

        <!-- Planet preview image -->
        <section id="planet-preview" :class="{ 'extra-hologram': !!EXTRAS_HOLOGRAM_EFFECT }">
          <svg viewBox="0 0 256 256" role="presentation">
            <path
              :d="makeSVGCircleArc(128, 128, getPlanetCircleRadius() + 8, 30, 150)"
              fill="none"
              stroke="var(--lg-contrast)"
              stroke-width="1.5"
            />
            <path
              :d="makeSVGCircleArc(128, 128, getPlanetCircleRadius() + 11.5, 55, 60)"
              fill="none"
              stroke="var(--lg-contrast)"
              stroke-width="6"
            />
            <path
              :d="makeSVGCircleArc(128, 128, getPlanetCircleRadius() + 11.5, 63, 90)"
              fill="none"
              stroke="var(--lg-contrast)"
              stroke-width="6"
            />
            <path
              :d="makeSVGCircleArc(128, 128, getPlanetCircleRadius() + 11.5, 110, 125)"
              fill="none"
              stroke="var(--lg-contrast)"
              stroke-width="6"
            />
          </svg>
          <img
            v-if="planet?.preview"
            class="planet-image"
            :src="planet?.preview"
            :aria-label="planet?.data.planetName"
            :alt="planet?.data.planetName"
          />
          <iconify-icon v-else icon="ph:planet-thin" width="auto" aria-hidden="true" />
          <span v-if="!!EXTRAS_CRT_EFFECT" class="effect-crt"></span>
        </section>

        <!-- Basic planet data -->
        <section id="planet-basic-data" role="grid">
          <GenericBoxElement
            id="planet-basic-data-type"
            ref="planetBasicDataTypeRef"
            :value-label="$t('dialog.planetinfo.basic.type')"
            role="gridcell"
          >
            {{ $t(getI18nPlanetType(planet?.data.planetType)) }}
          </GenericBoxElement>
          <GenericBoxElement
            id="planet-basic-data-class"
            ref="planetBasicDataClassRef"
            :value-label="$t('dialog.planetinfo.basic.class')"
            :background-color="getPlanetClassStyle()[0]"
            :text-color="getPlanetClassStyle()[1]"
            role="gridcell"
          >
            {{ $t(getI18nPlanetClass(planet?.data.planetClass)) }}
          </GenericBoxElement>

          <MeasurementBoxElement
            :str-value="planet?.data.planetRadius.toFixed(2)"
            icon="lucide:radius"
            :value-label="$t('dialog.planetinfo.basic.radius')"
            role="gridcell"
          />
          <MeasurementBoxElement
            :str-value="planet?.data.planetAxialTilt.toFixed(2)"
            unit="°"
            icon="tabler:angle"
            :value-label="$t('dialog.planetinfo.basic.axialtilt')"
            role="gridcell"
          />
          <div id="planet-basic-data-features" role="gridcell">
            <p id="label__planet-basic-data-features">{{ $t('dialog.planetinfo.basic.features') }}:</p>
            <ul>
              <li>
                <PlanetCardFeatureBoxElement
                  icon="mingcute:mountain-2-line"
                  :active="planet?.data.biomesEnabled"
                  :aria-label="
                    $t(
                      planet?.data.biomesEnabled
                        ? 'dialog.planetinfo.basic.has_biomes'
                        : 'dialog.planetinfo.basic.no_biomes',
                    ).toLocaleLowerCase() + ','
                  "
                  :title="
                    $t(
                      planet?.data.biomesEnabled
                        ? 'dialog.planetinfo.basic.has_biomes'
                        : 'dialog.planetinfo.basic.no_biomes',
                    )
                  "
                  role="gridcell"
                />
              </li>
              <li>
                <PlanetCardFeatureBoxElement
                  icon="mingcute:clouds-line"
                  :active="planet?.data.cloudsEnabled"
                  :aria-label="
                    $t(
                      planet?.data.cloudsEnabled
                        ? 'dialog.planetinfo.basic.has_clouds'
                        : 'dialog.planetinfo.basic.no_clouds',
                    ).toLocaleLowerCase() + ','
                  "
                  :title="
                    $t(
                      planet?.data.cloudsEnabled
                        ? 'dialog.planetinfo.basic.has_clouds'
                        : 'dialog.planetinfo.basic.no_clouds',
                    )
                  "
                  role="gridcell"
                />
              </li>
              <li>
                <PlanetCardFeatureBoxElement
                  icon="material-symbols:line-curve-rounded"
                  :active="planet?.data.atmosphereEnabled"
                  :aria-label="
                    $t(
                      planet?.data.atmosphereEnabled
                        ? 'dialog.planetinfo.basic.has_atmosphere'
                        : 'dialog.planetinfo.basic.no_atmosphere',
                    ).toLocaleLowerCase() + ','
                  "
                  :title="
                    $t(
                      planet?.data.atmosphereEnabled
                        ? 'dialog.planetinfo.basic.has_atmosphere'
                        : 'dialog.planetinfo.basic.no_atmosphere',
                    )
                  "
                  role="gridcell"
                />
              </li>
              <li>
                <PlanetCardFeatureBoxElement
                  icon="mingcute:planet-line"
                  :active="planet?.data.ringsEnabled"
                  :aria-label="
                    $t(
                      planet?.data.ringsEnabled
                        ? 'dialog.planetinfo.basic.has_rings'
                        : 'dialog.planetinfo.basic.no_rings',
                    ).toLocaleLowerCase()
                  "
                  :title="
                    $t(
                      planet?.data.ringsEnabled
                        ? 'dialog.planetinfo.basic.has_rings'
                        : 'dialog.planetinfo.basic.no_rings',
                    )
                  "
                  role="gridcell"
                />
              </li>
            </ul>
          </div>
        </section>

        <!-- Planet biomes (if present) -->
        <section
          v-if="planet?.data.biomesEnabled && planet?.data.biomesParams.length > 0"
          class="planet-details biomes"
        >
          <SeparatorGreebleDeco class="flip-x" />
          <span class="deco-polygon"></span>
          <h3 id="planet-details-biomes-title">{{ $t('dialog.planetinfo.biomes') }}</h3>
          <SVGBiomeGraph :key="planet.data.biomesParams[0].id" :biomes="planet.data.biomesParams" />
        </section>

        <!-- Planet rings (if present) -->
        <section v-if="planet?.data.ringsEnabled && planet?.data.ringsParams.length > 0" class="planet-details rings">
          <SeparatorGreebleDeco />
          <span class="deco-polygon"></span>
          <h3 id="planet-details-rings-title">{{ $t('dialog.planetinfo.rings') }}</h3>
          <SVGRingsGraph
            :key="planet.data.ringsParams[0].id"
            :planet-radius="planet.data.planetRadius"
            :rings="planet.data.ringsParams"
          />
        </section>
      </div>
    </template>
  </DialogElement>
</template>
<script setup lang="ts">
import type { IDBPlanet } from '@/dexie.config';
import DialogElement from '@components/global/elements/DialogElement.vue';
import { ref, type Ref } from 'vue';
import { EXTRAS_CRT_EFFECT, EXTRAS_HOLOGRAM_EFFECT } from '@core/extras';
import SVGBiomeGraph from '../svg/SVGBiomeGraph.vue';
import SVGRingsGraph from '../svg/SVGRingsGraph.vue';
import SeparatorGreebleDeco from '@/components/global/decoration/SeparatorGreebleDeco.vue';
import PlanetCardFeatureBoxElement from '../elements/PlanetCardFeatureBoxElement.vue';
import { makeSVGCircleArc } from '@/core/utils/svg-utils';
import MeasurementBoxElement from '@/components/global/elements/MeasurementBoxElement.vue';
import GenericBoxElement from '@/components/global/elements/GenericBoxElement.vue';
import { getI18nPlanetClass, getI18nPlanetType } from '@/core/utils/i18n-utils';
import { PlanetClass } from '@/core/types';

const planet: Ref<IDBPlanet | null> = ref(null);
const planetRadius: Ref<string> = ref('100%');
const dialogRef: Ref<{ open: () => void; close: () => void } | null> = ref(null);

const planetBasicDataTypeRef: Ref<HTMLElement | null> = ref(null);
const planetBasicDataClassRef: Ref<HTMLElement | null> = ref(null);

defineExpose({
  open: (p: IDBPlanet) => {
    planet.value = p;
    planetRadius.value = planet.value.data.planetRadius * 100.0 + '%';
    dialogRef.value?.open();
  },
});

function getPlanetCircleRadius() {
  return 128.0 * (planet.value?.data.planetRadius ?? 0);
}

// prettier-ignore
function getPlanetClassStyle(): string[] {
  const defaultStyle = ['var(--lg-panel)', 'var(--lg-text)']
  if (!planet.value) return defaultStyle
  switch (planet.value.data.planetClass) {
    case PlanetClass.PLANET_TELLURIC:    return defaultStyle
    case PlanetClass.PLANET_ICE:         return ['var(--lg-planet-class-ice-background)', 'var(--lg-planet-class-ice-text)']
    case PlanetClass.PLANET_OCEAN:       return ['var(--lg-planet-class-ocean-background)', 'var(--lg-planet-class-ocean-text)']
    case PlanetClass.PLANET_TROPICAL:    return ['var(--lg-planet-class-tropical-background)', 'var(--lg-planet-class-tropical-text)']
    case PlanetClass.PLANET_ARID:        return ['var(--lg-planet-class-arid-background)', 'var(--lg-planet-class-arid-text)']
    case PlanetClass.PLANET_CHTHONIAN:   return ['var(--lg-planet-class-chthonian-background)', 'var(--lg-planet-class-chthonian-text)']
    case PlanetClass.PLANET_MAGMATIC:    return ['var(--lg-planet-class-magmatic-background)', 'var(--lg-planet-class-magmatic-text)']
    case PlanetClass.MOON_ROCKY:         return defaultStyle
    case PlanetClass.MOON_ICE:           return ['var(--lg-planet-class-ice-background)', 'var(--lg-planet-class-ice-text)']
    case PlanetClass.MOON_CHTHONIAN:     return ['var(--lg-planet-class-chthonian-background)', 'var(--lg-planet-class-chthonian-text)']
    case PlanetClass.GASGIANT_COLD:      return ['var(--lg-planet-class-ice-background)', 'var(--lg-planet-class-ice-text)']
    case PlanetClass.GASGIANT_HOT:       return ['var(--lg-planet-class-magmatic-background)', 'var(--lg-planet-class-magmatic-text)']
    case PlanetClass.INDETERMINATE:      return defaultStyle
  }
}
</script>

<style scoped lang="scss">
#dialog-planet-info {
  min-width: 24rem;

  .info-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-areas:
      'name name'
      'preview basic'
      'biomes biomes'
      'rings rings';
    gap: 0 2rem;
  }

  #planet-preview {
    grid-area: preview;
    z-index: 1;
    align-self: center;
    position: relative;
    width: 16rem;
    height: 16rem;
    border-radius: 2px;

    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      position: absolute;
      inset: 0;
      overflow: visible;
    }
    .planet-image {
      max-width: 16rem;
      border-radius: 2px;
      image-rendering: optimizeQuality;
    }
    .effect-crt {
      border-radius: 50%;
      width: v-bind(planetRadius);
      height: v-bind(planetRadius);
    }
  }
  .planet-features {
    display: flex;
    flex-direction: row;
    gap: 0.25rem;
  }

  #planet-name {
    grid-area: name;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .banner {
      background: var(--lg-panel);
      border: 2px solid var(--lg-accent);
      border-bottom: 0;
      text-align: center;
      font-weight: 500;
      font-size: 1.25rem;
      overflow: hidden;
      display: flex;
      justify-content: center;
      h3 {
        font-size: 1.25rem;
        padding: 6px;
        max-width: 32ch;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }
  #planet-basic-data {
    position: relative;
    height: fit-content;
    font-size: 1.05rem;
    min-width: 16rem;

    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 0.5rem;
    font-size: 1rem;

    #planet-basic-data-type,
    #planet-basic-data-class {
      grid-column: span 2;
    }
    #planet-basic-data-features-title {
      display: flex;
    }
    #planet-basic-data-features {
      grid-column: span 2;
      p {
        font-size: 0.875rem;
      }
      ul {
        width: 100%;
        display: flex;
        gap: 4px;
        li {
          padding: 0;
          list-style: none;
          flex: 1;
        }
      }
    }
  }
  .planet-details {
    position: relative;
    margin-top: 1rem;

    font-size: 1.05rem;

    display: flex;
    flex-direction: column;
    align-items: center;

    &.biomes {
      grid-area: biomes;
    }
    &.rings {
      grid-area: rings;
    }
  }
}
@media screen and (max-width: 767px) {
  #dialog-planet-info {
    width: 100%;
    .info-grid {
      justify-content: center;
      align-items: center;
      grid-template-columns: 1fr;
      grid-template-areas:
        'name'
        'preview'
        'basic'
        'biomes'
        'rings';
    }
    #planet-preview {
      justify-self: center;
      margin-bottom: 1rem;
      svg {
        transform: rotate(90deg);
      }
    }
    #planet-basic-data {
      #planet-basic-data-type {
        grid-column: 1;
      }
      #planet-basic-data-class {
        grid-column: 2;
      }
    }
  }
}
@media screen and (max-width: 567px) {
  #dialog-planet-info {
    #planet-basic-data {
      #planet-basic-data-type,
      #planet-basic-data-class {
        grid-column: span 2;
      }
    }
  }
}
</style>
