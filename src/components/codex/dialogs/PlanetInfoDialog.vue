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
          <span class="deco-polygon"></span>
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
                <td name>{{ $t('dialog.planetinfo.basic.has_biomes') }}:</td>
                <td value>
                  <iconify-icon
                    v-if="planet?.data.biomesEnabled && planet?.data.biomesParams.length > 0"
                    inline
                    icon="mingcute:check-circle-fill"
                    width="1.5rem"
                    aria-hidden="true"
                  />
                  <iconify-icon v-else inline icon="mingcute:close-circle-line" width="1.5rem" aria-hidden="true" />
                </td>
              </tr>
              <tr>
                <td name>{{ $t('dialog.planetinfo.basic.has_clouds') }}:</td>
                <td value>
                  <iconify-icon
                    v-if="planet?.data.cloudsEnabled"
                    inline
                    icon="mingcute:check-circle-fill"
                    width="1.5rem"
                    aria-hidden="true"
                  />
                  <iconify-icon v-else inline icon="mingcute:close-circle-line" width="1.5rem" aria-hidden="true" />
                </td>
              </tr>
              <tr>
                <td name>{{ $t('dialog.planetinfo.basic.has_atmosphere') }}:</td>
                <td value>
                  <iconify-icon
                    v-if="planet?.data.atmosphereEnabled"
                    inline
                    icon="mingcute:check-circle-fill"
                    width="1.5rem"
                    aria-hidden="true"
                  />
                  <iconify-icon v-else inline icon="mingcute:close-circle-line" width="1.5rem" aria-hidden="true" />
                </td>
              </tr>
              <tr>
                <td name>{{ $t('dialog.planetinfo.basic.has_rings') }}:</td>
                <td value>
                  <iconify-icon
                    v-if="planet?.data.ringsEnabled"
                    inline
                    icon="mingcute:check-circle-fill"
                    width="1.5rem"
                    aria-hidden="true"
                  />
                  <iconify-icon v-else inline icon="mingcute:close-circle-line" width="1.5rem" aria-hidden="true" />
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        
        <!-- Planet biomes (if present) -->
        <section v-if="planet?.data.biomesEnabled && planet?.data.biomesParams.length > 0" class="planet-details biomes">
          <span class="deco-polygon"></span>
          <h3>{{ $t('dialog.planetinfo.biomes') }}</h3>
          <SVGBiomeGraph :key="planet.data.biomesParams[0].id" :biomes="planet.data.biomesParams" />
        </section>
        
        <!-- Planet rings (if present) -->
        <section v-if="planet?.data.ringsEnabled && planet?.data.ringsParams.length > 0" class="planet-details rings">
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

  .planet-preview {
    grid-area: preview;
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
      //filter: contrast(110%);
    }
  }
  .planet-basic {
    position: relative;
    height: fit-content;
    padding-top: 1.5rem;

    border-top: 2px solid var(--lg-accent);
    border-top-left-radius: 4px;
    font-size: 1.05rem;

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
    }
  }
  .planet-details {
    position: relative;
    padding-top: 1rem;
    margin-top: 2rem;

    border-top: 2px solid var(--lg-accent);
    border-top-left-radius: 4px;
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
