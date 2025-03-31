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
        <div class="planet-preview" :class="{ 'extra-hologram': !!EXTRAS_HOLOGRAM_MODE }">
          <img
            v-if="planet?.preview"
            class="planet-image"
            :src="planet?.preview"
            :aria-label="planet?.data.planetName"
            :alt="planet?.data.planetName"
          />
          <iconify-icon v-else icon="ph:planet-thin" width="auto" aria-hidden="true" />
          <span class="crt" :class="{ animated: A11Y_ANIMATE }"></span>
        </div>
        <div class="planet-basic">
          <span class="deco-polygon">
            <span class="hole"></span>
          </span>
          <table id="planet-basic-data">
            <tbody>
              <tr>
                <td name>{{ $t('dialog.planetinfo.name') }}:</td>
                <td value>{{ planet?.data.planetName }}</td>
              </tr>
              <tr>
                <td name>{{ $t('dialog.planetinfo.radius') }}:</td>
                <td value>
                  {{ planet?.data.planetRadius }}
                  {{ planet?.data.planetRadius !== 1 ? $t('main.units') : $t('main.unit') }}
                </td>
              </tr>
              <tr>
                <td name>{{ $t('dialog.planetinfo.axialtilt') }}:</td>
                <td value>{{ planet?.data.planetAxialTilt }}°</td>
              </tr>
              <tr>
                <td name>{{ $t('dialog.planetinfo.atmospheric') }}:</td>
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
                <td name>{{ $t('dialog.planetinfo.clouded') }}:</td>
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
                <td name>{{ $t('dialog.planetinfo.ringed') }}:</td>
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
        </div>
        <div class="planet-details">
          <span class="deco-polygon">
            <span class="hole"></span>
          </span>
          <template
            v-if="
              planet?.data.biomesEnabled && planet?.data.biomesParams.length && planet?.data.biomesParams.length > 0
            "
          >
            <h3>{{ $t('dialog.planetinfo.biomes') }}</h3>
            <table class="compact-header">
              <tbody>
                <tr>
                  <td name>{{ $t('dialog.planetinfo.biomes_temp') }}:</td>
                  <td>{{ $t(getMode(planet?.data.biomesTemperatureMode)).toLocaleLowerCase() }}</td>
                </tr>
                <tr>
                  <td name>{{ $t('dialog.planetinfo.biomes_humi') }}:</td>
                  <td>{{ $t(getMode(planet?.data.biomesHumidityMode)).toLocaleLowerCase() }}</td>
                </tr>
              </tbody>
            </table>
            <table id="planet-biome-data">
              <thead>
                <tr>
                  <th aria-hidden="true"></th>
                  <th>
                    &nbsp;{{ $t('dialog.planetinfo.biomes_temp') }} -
                    {{ $t(getMode(planet?.data.biomesTemperatureMode)).toLocaleLowerCase() }}&nbsp;
                  </th>
                  <th>
                    &nbsp;{{ $t('dialog.planetinfo.biomes_humi') }} -
                    {{ $t(getMode(planet?.data.biomesHumidityMode)).toLocaleLowerCase() }}&nbsp;
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="biome of planet?.data.biomesParams" :key="biome.id">
                  <td><div class="biome-color" :style="{ background: '#' + biome.color.getHexString() }"></div></td>
                  <td width="50%">
                    <div class="biome-bar">
                      <iconify-icon inline icon="mingcute:high-temperature-line" height="1.5rem" aria-hidden="true" />
                      <div class="bar">
                        <span
                          class="bar-fill"
                          :style="{ left: biome.tempMin * 100 + '%', right: 100 - biome.tempMax * 100 + '%' }"
                        ></span>
                      </div>
                    </div>
                  </td>
                  <td width="50%">
                    <div class="biome-bar">
                      <iconify-icon inline icon="material-symbols:humidity-mid" height="1.5rem" aria-hidden="true" />
                      <div class="bar">
                        <span
                          class="bar-fill"
                          :style="{ left: biome.humiMin * 100 + '%', right: 100 - biome.humiMax * 100 + '%' }"
                        ></span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </template>
          <p v-else class="no-biomes">{{ $t('dialog.planetinfo.biomes_none') }}</p>
        </div>
      </div>
    </template>
  </DialogElement>
</template>
<script setup lang="ts">
import type { IDBPlanet } from '@/dexie.config'
import DialogElement from '../elements/DialogElement.vue'
import { ref, type Ref } from 'vue'
import { A11Y_ANIMATE } from '@/core/globals'
import { EXTRAS_HOLOGRAM_MODE } from '@/core/extras'

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
  overflow-y: auto;

  .info-grid {
    margin: 1rem;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-areas:
      'preview basic'
      'details details';
    gap: 2rem;
  }

  .planet-preview {
    grid-area: preview;
    align-self: center;
    position: relative;
    width: 16rem;
    height: 16rem;
    background: var(--lg-panel);
    border: 1px solid var(--lg-accent);
    border-radius: 4px;

    display: flex;
    align-items: center;
    justify-content: center;

    .planet-image {
      max-width: 16rem;
      border-radius: 4px;
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
    grid-area: details;
    position: relative;
    padding-top: 1rem;

    border-top: 2px solid var(--lg-accent);
    border-top-left-radius: 4px;
    font-size: 1.05rem;

    display: flex;
    flex-direction: column;
    align-items: center;

    table.compact-header {
      display: none;
      margin-top: 1rem;
      width: 100%;
      text-align: start;
      [name] {
        font-weight: 600;
      }
      td:nth-child(2) {
        padding-left: 1rem;
      }
      td {
        width: 50%;
      }
    }
    table#planet-biome-data {
      width: 100%;
      margin-top: 1rem;
      text-wrap: nowrap;
      th {
        font-weight: 400;
        font-size: 0.875rem;
      }
      tr > td:first-child {
        width: 3rem;
      }
      [name] {
        font-weight: 600;
      }
    }
    .biome-color {
      width: 3rem;
      height: 2rem;
      border: 1px solid var(--lg-accent);
      border-radius: 4px;
    }
    .biome-bar {
      height: 2rem;
      border: 1px solid var(--lg-accent);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      overflow: hidden;

      iconify-icon {
        height: 2rem;
        width: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--lg-accent);
      }
      .bar {
        position: relative;
        height: 100%;
        flex: 1;

        .bar-fill {
          position: absolute;
          top: 0;
          bottom: 0;
          background: var(--lg-contrast-focus);
        }
      }
    }
    .no-biomes {
      text-align: center;
      font-size: 1rem;
    }
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
        'details';
      gap: 1rem;
    }
    .planet-preview {
      justify-self: center;
    }
    .planet-details {
      .biome-color {
        width: 2rem;
      }
      table#planet-biome-data {
        tr > td:first-child {
          width: 2rem;
        }
      }
    }
  }
}
@media screen and (max-width: 567px) {
  #dialog-planet-info {
    width: 100%;
    min-width: 0;

    .planet-details {
      table.compact-header {
        display: block;
      }
      table#planet-biome-data {
        margin: 0;
        thead {
          display: none;
        }
      }
    }
  }
}
</style>
