<template>
  <div id="controls">
    <aside class="sidebar">
      <!-- Lighting Settings -->
      <SidebarSection icon="mingcute:sun-line" :expand="false">
        <template v-slot:title>Lighting Settings</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterDivider />
            <ParameterCategory>Sunlight</ParameterCategory>
            <ParameterField v-model="LG_PARAMETERS.sunLightIntensity"
              id="l-int"
              type="range"
              :step="0.1"
              :min="0"
              :max="50"
            >
              Intensity
            </ParameterField>
            <ParameterColor v-model="LG_PARAMETERS.sunLightColor">
              Color
            </ParameterColor>
            <ParameterDivider />
            <ParameterCategory>Ambient light</ParameterCategory>
            <ParameterField v-model="LG_PARAMETERS.ambLightIntensity"
              id="m-int"
              type="range"
              :step="0.01"
              :min="0"
              :max="1"
            >
              Intensity
            </ParameterField>
            <ParameterColor v-model="LG_PARAMETERS.ambLightColor">
              Color
            </ParameterColor>
          </ParameterTable>
        </template>
      </SidebarSection>

      <!-- Planet Settings -->
      <SidebarSection icon="tabler:gizmo" :expand="false">
        <template v-slot:title>Planet Settings</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterCategory>Transform</ParameterCategory>
            <ParameterField
              v-model="LG_PARAMETERS.planetAxialTilt"
              id="p-tilt"
              type="range"
              :step="1"
              :min="0"
              :max="180"
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
            <ParameterDivider />
            <ParameterCategory>PBR parameters</ParameterCategory>
            <ParameterField
              v-model="LG_PARAMETERS.planetWaterLevel"
              id="p-gmetal"
              type="range"
              :step="0.01"
              :min="0"
              :max="1"
            >
              Water level
            </ParameterField>
            <ParameterDivider />
            <ParameterField
              v-model="LG_PARAMETERS.planetWaterRoughness"
              id="p-wrough"
              type="range"
              :step="0.01"
              :min="0"
              :max="1"
            >
              Water roughness
            </ParameterField>
            <ParameterField
              v-model="LG_PARAMETERS.planetWaterMetalness"
              id="p-wmetal"
              type="range"
              :step="0.01"
              :min="0"
              :max="1"
            >
              Water metalness
            </ParameterField>
            <ParameterField
              v-model="LG_PARAMETERS.planetGroundRoughness"
              id="p-grough"
              type="range"
              :step="0.01"
              :min="0"
              :max="1"
            >
              Ground roughness
            </ParameterField>
            <ParameterField
              v-model="LG_PARAMETERS.planetGroundMetalness"
              id="p-gmetal"
              type="range"
              :step="0.01"
              :min="0"
              :max="1"
            >
              Ground metalness
            </ParameterField>
          </ParameterTable>
        </template>
      </SidebarSection>

      <!-- Surface -->
      <SidebarSection icon="mingcute:planet-line" :expand="false">
        <template v-slot:title>Surface</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterCategory>Bump-map</ParameterCategory>
            <ParameterField
              v-model="LG_PARAMETERS.planetSurfaceShowBumps"
              id="s-bumps"
              type="checkbox"
            >
              Show bumps
            </ParameterField>
            <ParameterField
              v-model="LG_PARAMETERS.planetSurfaceBumpStrength"
              id="s-bumps"
              type="range"
              :step="0.0005"
              :min="0.02"
              :max="0.2"
            >
              Bump strength
            </ParameterField>
            <ParameterDivider />
            <ParameterCategory>Noise parameters</ParameterCategory>
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
            <ParameterColorRamp
              mode="color"
              v-model="(LG_PARAMETERS.planetSurfaceColorRamp as ColorRamp)"
              :key="LG_PARAMETERS.id"
            >
              Color ramp
            </ParameterColorRamp>
          </ParameterTable>
        </template>
      </SidebarSection>

      <!-- Biomes -->
       <SidebarSection icon="mingcute:mountain-2-line" :expand="false">
        <template v-slot:title>Biomes</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterField
              v-model="LG_PARAMETERS.biomesEnabled"
              id="b-biomes"
              type="checkbox"
            >
              Show biomes
            </ParameterField>
            <template v-if="LG_PARAMETERS.biomesEnabled">
              <ParameterField
                v-model="LG_PARAMETERS.biomePolesEnabled"
                id="b-poles"
                type="checkbox"
              >
                Show poles
              </ParameterField>
            </template>
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
            <template v-if="LG_PARAMETERS.cloudsEnabled">
              <ParameterCategory>Transform</ParameterCategory>
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
              <ParameterCategory>Noise parameters</ParameterCategory>
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
              <ParameterCategory>Color & opacity</ParameterCategory>
              <ParameterColor v-model="LG_PARAMETERS.cloudsColor">Color</ParameterColor>
              <ParameterColorRamp
                mode="opacity"
                v-model="(LG_PARAMETERS.cloudsColorRamp as ColorRamp)"
                :key="LG_PARAMETERS.id"
              >Opacity ramp</ParameterColorRamp>
            </template>
          </ParameterTable>
        </template>
      </SidebarSection>

      <!-- Atmosphere -->
      <SidebarSection icon="material-symbols:line-curve-rounded" :expand=false>
        <template v-slot:title>Atmosphere</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterDivider />
            <ParameterField
              v-model="LG_PARAMETERS.atmosphereEnabled"
              id="a-toggle"
              type="checkbox"
            >
              Show atmosphere
            </ParameterField>
            <template v-if="LG_PARAMETERS.atmosphereEnabled">
              <ParameterCategory>Transform</ParameterCategory>
              <ParameterField
                v-model="LG_PARAMETERS.atmosphereHeight"
                id="a-height"
                type="range"
                :step="0.1"
                :min="1"
                :max="8"
              >
                Height
              </ParameterField>
              <ParameterField
                v-model="LG_PARAMETERS.atmosphereDensityScale"
                id="a-density"
                type="range"
                :step="0.01"
                :min="1"
                :max="10"
              >
                Density
              </ParameterField>
              <ParameterCategory>Coloration</ParameterCategory>
              <ParameterField
                v-model="LG_PARAMETERS.atmosphereHue"
                id="a-hue"
                type="range"
                :step="0.01"
                :min="0"
                :max="2"
              >
                Hue
              </ParameterField>
              <ParameterField
                v-model="LG_PARAMETERS.atmosphereIntensity"
                id="a-int"
                type="range"
                :step="0.01"
                :min="0"
                :max="2"
              >
                Intensity
              </ParameterField>
            </template>
          </ParameterTable>
        </template>
      </SidebarSection>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { LG_PARAMETERS } from '@core/globals'
import ParameterColorRamp from '../parameters/ParameterColorRamp.vue'
import ParameterDivider from '../parameters/ParameterDivider.vue'
import type { ColorRamp } from '@/core/models/color-ramp.model'
import SidebarSection from '../elements/SidebarSection.vue';
import ParameterField from '../parameters/ParameterField.vue';
</script>

<style scoped lang="scss">
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
    gap: 0.5rem;

    scrollbar-color: var(--lg-accent) transparent;
    scrollbar-width: thin;
    overflow: auto;
  }
}

@media screen and (max-width:1199px) {
  #controls {
    .sidebar {
      padding: 0.5rem;
      margin-top: 3.375rem;
    }
  }
}
@media screen and (max-width:767px) {
  #controls {
    min-width: 2rem;

    .sidebar {
      padding: 0.5rem;
    }
  }
}
@media screen and (max-width:567px) {
  #controls {
    .sidebar {
      padding: 0.5rem;
      max-width: 100%;
    }
  }
}
</style>