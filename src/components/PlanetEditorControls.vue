<template>
  <div id="controls">
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
import { GeometryType } from '@core/types'
import ParameterColorRamp from './parameters/ParameterColorRamp.vue';
import ParameterDivider from './parameters/ParameterDivider.vue';
import type { ColorRamp } from '@/core/models/color-ramp.model';
</script>

<style scoped lang="scss">
#controls {
  z-index: 5;
  position: absolute;
  inset: 0;

  display: flex;
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

@media screen and (max-width:767px) {
  #controls {
    min-width: 2rem;
  }
}
</style>