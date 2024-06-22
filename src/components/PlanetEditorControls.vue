<template>
  <div id="controls">
    <div id="planet-info">
      <div class="name-wrapper">
        <p>{{  LG_PARAMETERS.planetName }}</p>
        <button class="lg icon-button">
          <iconify-icon icon="mingcute:edit-2-line" width="1.25rem" />
        </button>
      </div>
      <hr>
      <input ref="fileInput" type="file" @change="importPlanetFile" hidden>
      <button class="lg dark" aria-label="Import planet file" @click="openFileDialog">
        <iconify-icon icon="mingcute:upload-line" width="1.5rem" aria-hidden="true" />
      </button>
      <button class="lg dark" aria-label="Export planet file" @click="exportPlanetFile">
        <iconify-icon icon="mingcute:download-line" width="1.5rem" aria-hidden="true" />
      </button>
    </div>
    <aside class="sidebar">
      <!-- Lighting Settings -->
      <SidebarSection icon="mingcute:sun-line" :expand="false">
        <template v-slot:title>Lighting Settings</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterDivider />
            <ParameterField v-model="LG_PARAMETERS.sunLightIntensity"
              id="l-int"
              type="range"
              :step="0.1"
              :min="0"
              :max="16"
            >
              Sunlight intensity
            </ParameterField>
            <ParameterColor v-model="LG_PARAMETERS.sunLightColor">
              Sunlight color
            </ParameterColor>
            <ParameterDivider />
            <ParameterField v-model="LG_PARAMETERS.ambLightIntensity"
              id="m-int"
              type="range"
              :step="0.05"
              :min="0"
              :max="2"
            >
              Ambient intensity
            </ParameterField>
            <ParameterColor v-model="LG_PARAMETERS.ambLightColor">
              Ambient color
            </ParameterColor>
          </ParameterTable>
        </template>
      </SidebarSection>

      <!-- Planet Settings -->
      <SidebarSection icon="tabler:gizmo" :expand="true">
        <template v-slot:title>Planet Settings</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterDivider />
            <ParameterField
              v-model="LG_PARAMETERS.planetAxialTilt"
              id="p-tilt"
              type="range"
              :step="1"
              :min="0"
              :max="360"
            >
              Axial tilt <sup>(°)</sup>
            </ParameterField>
            <ParameterField
              v-model="LG_PARAMETERS.planetRotation"
              id="p-rot"
              type="range"
              :step="1"
              :min="0"
              :max="360"
            >
              Rotation <sup>(°)</sup>
            </ParameterField>
          </ParameterTable>
        </template>
      </SidebarSection>

      <!-- Surface -->
      <SidebarSection icon="mingcute:planet-line" :expand="true">
        <template v-slot:title>Surface</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterDivider />
            <ParameterField
              v-model="LG_PARAMETERS.planetSurfaceShowBumps"
              id="s-bumps"
              type="checkbox"
            >
              Show bumps
            </ParameterField>
            <ParameterField
              v-model="LG_PARAMETERS.planetSurfaceNoise.frequency"
              id="s-freq"
              type="range"
              :step="0.01"
              :max="10"
            >
              Frequency
            </ParameterField>
            <ParameterField
              v-model="LG_PARAMETERS.planetSurfaceNoise.amplitude"
              id="s-amp"
              type="range"
              :step="0.01"
              :max="1.25"
            >
              Amplitude
            </ParameterField>
            <ParameterField
              v-model="LG_PARAMETERS.planetSurfaceNoise.lacunarity"
              id="s-lac"
              type="range"
              :step="0.01"
              :min="1"
              :max="2.5"
            >
              Lacunarity
            </ParameterField>
            <ParameterDivider />
            <ParameterColorRamp mode="color" v-model="(LG_PARAMETERS.planetSurfaceColorRamp as ColorRamp)">
              Color ramp
            </ParameterColorRamp>
          </ParameterTable>
        </template>
      </SidebarSection>

      <!-- Clouds -->
      <SidebarSection icon="mingcute:clouds-line" :expand="false">
        <template v-slot:title>Clouds</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterDivider />
            <ParameterField
              v-model="LG_PARAMETERS.cloudsEnabled"
              id="c-toggle"
              type="checkbox"
            >
              Show clouds
            </ParameterField>
            <ParameterDivider />
            <template v-if="LG_PARAMETERS.cloudsEnabled">
              <ParameterField
                v-model="LG_PARAMETERS.cloudsAxialTilt"
                id="c-tilt"
                type="range"
                :step="1"
                :min="0"
                :max="360"
              >
                Axial tilt <sup>(°)</sup>
              </ParameterField>
              <ParameterField
                v-model="LG_PARAMETERS.cloudsRotation"
                id="c-rot"
                type="range"
                :step="1"
                :min="0"
                :max="360"
              >
                Rotation <sup>(°)</sup>
              </ParameterField>
              <ParameterDivider />
              <ParameterField
                v-model="LG_PARAMETERS.cloudsNoise.frequency"
                id="c-freq"
                type="range"
                :step="0.01"
                :min="0"
                :max="5"
              >
                Frequency
              </ParameterField>
              <ParameterField
                v-model="LG_PARAMETERS.cloudsNoise.amplitude"
                id="c-amp"
                type="range"
                :step="0.01"
                :min="0"
                :max="1.25"
              >
                Amplitude
              </ParameterField>
              <ParameterField
                v-model="LG_PARAMETERS.cloudsNoise.lacunarity"
                id="c-lac"
                type="range"
                :step="0.01"
                :min="0"
                :max="2.5"
              >
                Lacunarity
              </ParameterField>
              <ParameterDivider />
              <ParameterColor v-model="LG_PARAMETERS.cloudsColor">Color</ParameterColor>
              <ParameterColorRamp mode="opacity" v-model="(LG_PARAMETERS.cloudsColorRamp as ColorRamp)">Opacity ramp</ParameterColorRamp>
            </template>
          </ParameterTable>
        </template>
      </SidebarSection>

      <!-- Atmosphere -->
      <SidebarSection icon="material-symbols:line-curve-rounded" :expand=false>
        <template v-slot:title>Atmosphere</template>
        <template v-slot:content>
          <ParameterDivider />
            <ParameterField
              v-model="LG_PARAMETERS.atmosphereEnabled"
              id="a-toggle"
              type="checkbox"
            >
              Show atmosphere
            </ParameterField>
            <ParameterDivider />
            <ParameterField
              v-model="LG_PARAMETERS.atmosphereDaylightHue"
              id="a-hue"
              type="number"
            >
              Daylight hue
            </ParameterField>
        </template>
      </SidebarSection>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { LG_PARAMETERS } from '@core/globals'
import ParameterColorRamp from './parameters/ParameterColorRamp.vue';
import ParameterDivider from './parameters/ParameterDivider.vue';
import type { ColorRamp } from '@/core/models/color-ramp.model';
import pako from 'pako';
import { saveAs } from 'file-saver';
import { ref, type Ref } from 'vue';

const fileInput: Ref<HTMLInputElement | null> = ref(null)

function openFileDialog() {
  fileInput.value?.click()
}

function importPlanetFile(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (files?.length !== 1) {
    console.warn('no file selected')
    return
  }

  const reader = new FileReader()
  reader.onload = e => {
    try {
      const lgParams = JSON.parse(pako.inflate(e.target?.result as ArrayBuffer, { to: 'string' }))
      LG_PARAMETERS.load(lgParams)
    } catch (err) {
      console.error(err)
    }
  }
  reader.readAsArrayBuffer(files[0])
}

function exportPlanetFile() {
  const jsonParams = JSON.stringify(LG_PARAMETERS)
  const gzipParams = pako.deflate(jsonParams)
  console.log(jsonParams)
  saveAs(new Blob([gzipParams]), `${LG_PARAMETERS.planetName ?? 'Planet'}.lagrange`)
}
</script>

<style scoped lang="scss">
#planet-info {
  pointer-events: all;
  position: fixed;
  height: 2.875rem;
  margin-top: 1rem;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  
  align-self: center;

  hr {
    height: 50%;
    border-color: var(--lg-accent);
  }
  .name-wrapper {
    background-color: var(--lg-primary);
    border: 1px solid var(--lg-accent);
    border-radius: 4px;
    height: 2.875rem;
    padding: 0 0.25rem 0 0.75rem;

    display: flex;
    align-items: center;
    font-size: 1.125em;
    gap: 0.5rem;

    p {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 32ch;
    }
  }
}
#controls {
  z-index: 5;
  position: absolute;
  inset: 0;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  pointer-events: none;
  overflow: hidden;

  .sidebar {
    width: 100%;
    max-width: 24rem;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;

    scrollbar-color: var(--lg-accent) transparent;
    scrollbar-width: thin;
    overflow: auto;
  }
}

@media screen and (max-width:1367px) {
  #planet-info {
    position: relative;
  }
}
@media screen and (max-width:767px) {
  #planet-info {
    position: relative;
    width: 100%;
    border-radius: 0;
    border-left: none;
    border-top: none;
    border-right: none;

    height: 2.875rem;
    padding: 0 0.25rem 0 0.5rem;
    margin-top: 0.5rem;

    .name-wrapper {
      flex: 1;
      font-size: 1em;
      justify-content: space-between;
    }
  }
  #controls {
    min-width: 2rem;

    .sidebar {
      padding: 0.5rem;
    }
  }
}
@media screen and (max-width:567px) {
  #planet-info {
    .name-wrapper > p {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 20ch;
    }
  }
  #controls {
    .sidebar {
      padding: 0.5rem;
      max-width: 100%;
    }
  }
}
</style>