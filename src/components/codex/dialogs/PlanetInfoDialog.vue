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
      <div class="info-grid">
        <!-- Planet preview image -->
        <div class="planet-preview" :class="{ 'extra-hologram': !!EXTRAS_HOLOGRAM_EFFECT }">
          <svg viewBox="0 0 256 256" aria-hidden="true">
              <path :d="makeSVGCircleArc(128, 128, getPlanetCircleRadius()+8, 30, 150)" fill="none" stroke="var(--lg-contrast)" stroke-width="1.5" />
              <path :d="makeSVGCircleArc(128, 128, getPlanetCircleRadius()+11.5, 55, 60)" fill="none" stroke="var(--lg-contrast)" stroke-width="6" />
              <path :d="makeSVGCircleArc(128, 128, getPlanetCircleRadius()+11.5, 63, 90)" fill="none" stroke="var(--lg-contrast)" stroke-width="6" />
              <path :d="makeSVGCircleArc(128, 128, getPlanetCircleRadius()+11.5, 110, 125)" fill="none" stroke="var(--lg-contrast)" stroke-width="6" />
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
        </div>

        <!-- Basic planet data -->
        <section class="planet-basic">
          <div id="planet-basic-name"><p>{{ planet?.data.planetName }}</p></div>
          <SeparatorGreebleDeco />
          <div id="planet-basic-data" role="grid">
            <MeasurementBoxElement 
              :str-value="planet?.data.planetRadius.toFixed(2)" 
              icon="lucide:radius"
              :value-label="$t('dialog.planetinfo.basic.radius')"
              role="gridcell"
            />           
            <MeasurementBoxElement 
              :str-value="planet?.data.planetAxialTilt.toFixed(2)" 
              icon="tabler:angle"
              :value-label="$t('dialog.planetinfo.basic.axialtilt')"
              role="gridcell"
            />
            <div id="planet-basic-data-features">
              <p>Features</p>
              <ul>
                <li><PlanetCardFeatureBoxElement
                  icon="mingcute:mountain-2-line"
                  :active="planet?.data.biomesEnabled"
                  :aria-label="$t('dialog.planetinfo.basic.has_biomes')"
                  :title="$t('dialog.planetinfo.basic.has_biomes')"
                  role="gridcell"
                /></li>
                <li><PlanetCardFeatureBoxElement
                  icon="mingcute:clouds-line"
                  :active="planet?.data.cloudsEnabled"
                  :aria-label="$t('dialog.planetinfo.basic.has_clouds')"
                  :title="$t('dialog.planetinfo.basic.has_clouds')"
                  role="gridcell"
                /></li>
                <li><PlanetCardFeatureBoxElement
                  icon="material-symbols:line-curve-rounded"
                  :active="planet?.data.atmosphereEnabled"
                  :aria-label="$t('dialog.planetinfo.basic.has_atmosphere')"
                  :title="$t('dialog.planetinfo.basic.has_atmosphere')"
                  role="gridcell"
                /></li>
                <li><PlanetCardFeatureBoxElement
                  icon="mingcute:planet-line"
                  :active="planet?.data.ringsEnabled"
                  :aria-label="$t('dialog.planetinfo.basic.has_rings')"
                  :title="$t('dialog.planetinfo.basic.has_rings')"
                  role="gridcell"
                /></li>
              </ul>
            </div>
          </div>
          <!-- <table id="planet-basic-data">
            <tbody>
              <tr>
                <td name>{{ $t('dialog.planetinfo.basic.radius') }}:</td>
                <td value>
                  {{ planet?.data.planetRadius.toFixed(2) }}
                  {{  }}
                </td>
              </tr>
              <tr>
                <td name>{{ $t('dialog.planetinfo.basic.axialtilt') }}:</td>
                <td value>{{ planet?.data.planetAxialTilt.toFixed(2) }}°</td>
              </tr>
              <tr>
                <td name>{{ $t('dialog.planetinfo.basic.type')}}:</td>
                <td value>{{ $t(getI18nPlanetType(planet?.data.planetType)) }}</td>
              </tr>
              <tr>
                <td name>{{ $t('dialog.planetinfo.basic.classification')}}:</td>
                <td value>{{  $t(getI18nPlanetClassification(planet?.data.planetClassification)) }}</td>
              </tr>
              <tr>
                <td name>{{  $t('dialog.planetinfo.basic.features') }}:</td>
              </tr>
              <tr>
                <td colspan="2">
                  
                </td>
              </tr>
            </tbody>
          </table> -->
        </section>
        
        <!-- Planet biomes (if present) -->
        <section v-if="planet?.data.biomesEnabled && planet?.data.biomesParams.length > 0" class="planet-details biomes">
          <SeparatorGreebleDeco class="flip-x" />
          <span class="deco-polygon"></span>
          <h3>{{ $t('dialog.planetinfo.biomes') }}</h3>
          <SVGBiomeGraph :key="planet.data.biomesParams[0].id" :biomes="planet.data.biomesParams" />
        </section>
        
        <!-- Planet rings (if present) -->
        <section v-if="planet?.data.ringsEnabled && planet?.data.ringsParams.length > 0" class="planet-details rings">
          <SeparatorGreebleDeco />
          <span class="deco-polygon"></span>
          <h3>{{ $t('dialog.planetinfo.rings') }}</h3>
          <SVGRingsGraph :key="planet.data.ringsParams[0].id" :planet-radius="planet.data.planetRadius" :rings="planet.data.ringsParams" />
        </section>
      </div>
    </template>
  </DialogElement>
</template>
<script setup lang="ts">
import type { IDBPlanet } from '@/dexie.config'
import DialogElement from '@components/global/elements/DialogElement.vue'
import { ref, type Ref } from 'vue'
import { EXTRAS_CRT_EFFECT, EXTRAS_HOLOGRAM_EFFECT } from '@core/extras'
import SVGBiomeGraph from '../svg/SVGBiomeGraph.vue'
import SVGRingsGraph from '../svg/SVGRingsGraph.vue'
import SeparatorGreebleDeco from '@/components/global/decoration/SeparatorGreebleDeco.vue'
import PlanetCardFeatureBoxElement from '../elements/PlanetCardFeatureBoxElement.vue'
import { makeSVGCircleArc } from '@/core/utils/svg-utils'
import MeasurementBoxElement from '@/components/global/elements/MeasurementBoxElement.vue'

const planet: Ref<IDBPlanet | null> = ref(null)
const planetRadius: Ref<string> = ref('100%')
const dialogRef: Ref<{ open: () => void; close: () => void } | null> = ref(null)

defineExpose({
  open: (p: IDBPlanet) => {
    planet.value = p
    planetRadius.value = planet.value.data.planetRadius*100.0 + '%'
    dialogRef.value?.open()
  },
})

function getMode(value: number | undefined) {
  switch (value) {
    case 0:
      return 'editor.controls.biomes.gradient_mode_realistic'
    case 1:
      return 'editor.controls.biomes.gradient_mode_poletopole'
    case 2:
      return 'editor.controls.biomes.gradient_mode_fullnoise'
    default:
      return 'main.unknown_value'
  }
}
function getPlanetCircleRadius() {
  return 128.0 * (planet.value?.data.planetRadius ?? 0)
}
</script>

<style scoped lang="scss">
#dialog-planet-info {
  min-width: 24rem;

  .info-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-areas:
      'preview basic'
      'biomes biomes'
      'rings rings';
    gap: 0 2rem;
  }

  .planet-preview {
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

  .planet-basic {
    position: relative;
    height: fit-content;
    font-size: 1.05rem;
    min-width: 16rem;

    display: flex;
    flex-direction: column;
    justify-content: space-between;

    #planet-basic-name {
      background: var(--lg-panel);
      border: 2px solid var(--lg-accent);
      text-align: center;
      font-weight: 500;
      font-size: 1.25rem;
      overflow: hidden;

      p {
        padding: 0 6px;
        max-width: 24ch;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
    #planet-basic-data {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
      gap: 0.5rem;

      #planet-basic-data-features-title {
        display: flex;
      }
      #planet-basic-data-features {
        grid-column: span 2;
        ul {
          width: 100%;
          display: flex;
          li {
            padding: 0;
            list-style: none;
            flex: 1;
          }
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

    &.biomes { grid-area: biomes; }
    &.rings { grid-area: rings; }
  }
}
@media screen and (max-width: 767px) {
  #dialog-planet-info {
    .info-grid {
      justify-content: center;
      align-items: center;
      grid-template-columns: 1fr;
      grid-template-areas:
        'preview'
        'basic'
        'biomes'
        'rings';
    }
    .planet-preview {
      justify-self: center;
      margin-bottom: 1rem;
    }
  }
}
</style>
