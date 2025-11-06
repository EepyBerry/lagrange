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
        <div class="planet-preview-wrapper">
          <div class="planet-preview" :class="{ 'extra-hologram': !!EXTRAS_HOLOGRAM_EFFECT }">
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
          <div class="planet-features">
            <PlanetCardFeatureBoxElement
              icon="mingcute:mountain-2-line"
              :active="planet?.data.biomesEnabled"
            />
            <PlanetCardFeatureBoxElement
              icon="mingcute:clouds-line"
              :active="planet?.data.cloudsEnabled"
            />
            <PlanetCardFeatureBoxElement
              icon="material-symbols:line-curve-rounded"
              :active="planet?.data.atmosphereEnabled"
            />
            <PlanetCardFeatureBoxElement
              icon="mingcute:planet-line"
              :active="planet?.data.ringsEnabled"
            />
          </div>
        </div>

        <!-- Basic planet data -->
        <section class="planet-basic">
          <SeparatorGreebleDeco />
          <table id="planet-basic-data">
            <tbody>
              <tr>
                <td name>{{ $t('dialog.planetinfo.basic.name') }}:</td>
                <td value>{{ planet?.data.planetName }}</td>
              </tr>
              <tr>
                <td name>{{ $t('dialog.planetinfo.basic.radius') }}:</td>
                <td value>
                  {{ planet?.data.planetRadius.toFixed(2) }}
                  {{ planet?.data.planetRadius !== 1 ? $t('main.units') : $t('main.unit') }}
                </td>
              </tr>
              <tr>
                <td name>{{ $t('dialog.planetinfo.basic.axialtilt') }}:</td>
                <td value>{{ planet?.data.planetAxialTilt.toFixed(2) }}°</td>
              </tr>
              <tr>
                <td name>{{ $t('dialog.planetinfo.basic.type')}}:</td>
                <td value>{{  planet?.data.planetType }}</td>
              </tr>
              <tr>
                <td name>{{ $t('dialog.planetinfo.basic.classification')}}:</td>
                <td value>Unknown</td>
              </tr>
            </tbody>
          </table>
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

const planet: Ref<IDBPlanet | null> = ref(null)
const dialogRef: Ref<{ open: () => void; close: () => void } | null> = ref(null)

defineExpose({
  open: (p: IDBPlanet) => {
    planet.value = p
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

  .planet-preview-wrapper {
    grid-area: preview;

    .planet-preview {
      z-index: 1;
      align-self: center;
      position: relative;
      width: 16rem;
      height: 16rem;
      background: var(--lg-panel);
      border: 1px solid var(--lg-accent);
      border-radius: 2px;

      display: flex;
      align-items: center;
      justify-content: center;

      .planet-image {
        max-width: 16rem;
        border-radius: 2px;
        image-rendering: optimizeQuality;
      }
    }
    .planet-features {
      display: flex;
      flex-direction: row;
      gap: 0.25rem;
    }
  }

  .planet-basic {
    position: relative;
    height: fit-content;
    font-size: 1.05rem;

    display: flex;
    flex-direction: column;
    justify-content: space-between;

    table#planet-basic-data {
      tr:nth-child(3) > td {
        padding-bottom: 1rem;
      }
      td:nth-child(2) {
        padding-left: 1rem;
      }
      [name] {
        font-weight: 600;
      }

      td.planet-basic-data-features {
        width: 100%;
        gap: 0.25rem;
        .features-wrapper { 
          display: flex;
          gap: 0.25rem;
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
