<template>
  <div id="controls">
    <aside class="sidebar">
      <!-- Lighting -->
      <SidebarSection icon="mingcute:sun-line" :expand="false">
        <template v-slot:title>{{ $t('editor.controls.lighting.$title') }}</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterCategory top>{{ $t('editor.controls.lighting.lensflare') }}</ParameterCategory>
            <ParameterField
              v-model="LG_PARAMETERS.lensFlareEnabled"
              id="f-toggle"
              type="checkbox"
            >
              {{ $t('editor.controls.lighting.lensflare_show') }}
            </ParameterField>
            <template v-if="LG_PARAMETERS.lensFlareEnabled">
              <ParameterField
                v-model="LG_PARAMETERS.lensFlarePointsIntensity"
                id="f-pointsint"
                type="range"
                :step="0.01"
                :min="0"
                :max="1"
              >
                {{ $t('editor.controls.lighting.lensflare_points_intensity') }}
              </ParameterField>
              <ParameterField
                v-model="LG_PARAMETERS.lensFlareGlareIntensity"
                id="f-glareint"
                type="range"
                :step="0.01"
                :min="0"
                :max="1"
              >
                {{ $t('editor.controls.lighting.lensflare_glare_intensity') }}
              </ParameterField>
            </template>
            <ParameterCategory>{{ $t('editor.controls.lighting.sunlight') }}</ParameterCategory>
            <ParameterField v-model="LG_PARAMETERS.sunLightAngle"
              id="l-angle"
              type="range"
              :step="0.1"
              :min="-90"
              :max="90"
            >
            {{ $t('editor.controls.lighting.sunlight_angle') }} <sup>(°)</sup>
            </ParameterField>
            <ParameterField v-model="LG_PARAMETERS.sunLightIntensity"
              id="l-int"
              type="range"
              :step="0.1"
              :min="0"
              :max="50"
            >
             {{ $t('editor.controls.lighting.sunlight_intensity') }}
            </ParameterField>
            <ParameterColor v-model="LG_PARAMETERS.sunLightColor">
              {{ $t('editor.controls.lighting.sunlight_color') }}
            </ParameterColor>
            <ParameterCategory>{{ $t('editor.controls.lighting.amblight') }}</ParameterCategory>
            <ParameterField v-model="LG_PARAMETERS.ambLightIntensity"
              id="m-int"
              type="range"
              :step="0.01"
              :min="0"
              :max="1"
            >
            {{ $t('editor.controls.lighting.amblight_intensity') }}
            </ParameterField>
            <ParameterColor v-model="LG_PARAMETERS.ambLightColor">
              {{ $t('editor.controls.lighting.amblight_color') }}
            </ParameterColor>
          </ParameterTable>
        </template>
      </SidebarSection>

      <!-- Planet & Rendering -->
      <SidebarSection icon="tabler:gizmo" :expand="false">
        <template v-slot:title>{{ $t('editor.controls.planet_rendering.$title') }}</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterCategory top>{{ $t('editor.controls.planet_rendering.transform') }}</ParameterCategory>
            <ParameterField
              v-model="LG_PARAMETERS.planetAxialTilt"
              id="p-tilt"
              type="range"
              :step="1"
              :min="0"
              :max="180"
            >
              {{ $t('editor.controls.planet_rendering.transform_axialtilt') }} <sup>(°)</sup>
            </ParameterField>
            <ParameterField
              v-model="LG_PARAMETERS.planetRotation"
              id="p-rot"
              type="range"
              :step="1"
              :min="0"
              :max="360"
            >
              {{ $t('editor.controls.planet_rendering.transform_rotation') }} <sup>(°)</sup>
            </ParameterField>
            <ParameterCategory>PBR parameters</ParameterCategory>
            <ParameterField
              v-model="LG_PARAMETERS.planetWaterLevel"
              id="p-wlevel"
              type="range"
              :step="0.01"
              :min="0"
              :max="1"
            >
              {{ $t('editor.controls.planet_rendering.pbr_waterlevel') }}
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
              {{ $t('editor.controls.planet_rendering.pbr_waterroughness') }}
            </ParameterField>
            <ParameterField
              v-model="LG_PARAMETERS.planetWaterMetalness"
              id="p-wmetal"
              type="range"
              :step="0.01"
              :min="0"
              :max="1"
            >
              {{ $t('editor.controls.planet_rendering.pbr_watermetalness') }}
            </ParameterField>
            <ParameterDivider />
            <ParameterField
              v-model="LG_PARAMETERS.planetGroundRoughness"
              id="p-grough"
              type="range"
              :step="0.01"
              :min="0"
              :max="1"
            >
              {{ $t('editor.controls.planet_rendering.pbr_groundroughness') }}
            </ParameterField>
            <ParameterField
              v-model="LG_PARAMETERS.planetGroundMetalness"
              id="p-gmetal"
              type="range"
              :step="0.01"
              :min="0"
              :max="1"
            >
              {{ $t('editor.controls.planet_rendering.pbr_groundmetalness') }}
            </ParameterField>
          </ParameterTable>
        </template>
      </SidebarSection>

      <!-- Surface -->
      <SidebarSection icon="mingcute:planet-line" :expand="false">
        <template v-slot:title>{{ $t('editor.controls.surface.$title') }}</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterCategory top>{{ $t('editor.controls.surface.bumpmap') }}</ParameterCategory>
            <ParameterField
              v-model="LG_PARAMETERS.planetSurfaceShowBumps"
              id="s-bump"
              type="checkbox"
            >
              {{ $t('editor.controls.surface.bumpmap_show') }}
            </ParameterField>
            <template v-if="LG_PARAMETERS.planetSurfaceShowBumps">
              <ParameterField
                v-model="LG_PARAMETERS.planetSurfaceBumpStrength"
                id="s-bumpstr"
                type="range"
                :step="0.0005"
                :min="0.02"
                :max="0.2"
              >
                {{ $t('editor.controls.surface.bumpmap_strength') }}
              </ParameterField>
            </template>
            <ParameterCategory>{{ $t('editor.controls.surface.noise') }}</ParameterCategory>
            <ParameterField
              v-model="LG_PARAMETERS.planetSurfaceNoise.frequency"
              id="s-freq"
              type="range"
              :step="0.01"
              :max="10"
            >
              {{ $t('editor.controls.surface.noise_fbm_frequency') }}
            </ParameterField>
            <ParameterField
              v-model="LG_PARAMETERS.planetSurfaceNoise.amplitude"
              id="s-amp"
              type="range"
              :step="0.01"
              :max="1.25"
            >
              {{ $t('editor.controls.surface.noise_fbm_amplitude') }}
            </ParameterField>
            <ParameterField
              v-model="LG_PARAMETERS.planetSurfaceNoise.lacunarity"
              id="s-lac"
              type="range"
              :step="0.01"
              :min="1"
              :max="2.5"
            >
              {{ $t('editor.controls.surface.noise_fbm_lacunarity') }}
            </ParameterField>
            <ParameterDivider />
            <ParameterColorRamp
              mode="color"
              v-model="(LG_PARAMETERS.planetSurfaceColorRamp as ColorRamp)"
              :key="LG_PARAMETERS.id"
            >
              {{ $t('editor.controls.surface.noise_colorramp') }}
            </ParameterColorRamp>
          </ParameterTable>
        </template>
      </SidebarSection>

      <!-- Biomes -->
       <SidebarSection icon="mingcute:mountain-2-line" :expand="false">
        <template v-slot:title>{{ $t('editor.controls.biomes.$title') }}</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterField
              v-model="LG_PARAMETERS.biomesEnabled"
              id="b-biomes"
              type="checkbox"
            >
              {{ $t('editor.controls.biomes.biomes_show') }}
            </ParameterField>
            <template v-if="LG_PARAMETERS.biomesEnabled">
              <ParameterField
                v-model="LG_PARAMETERS.biomePolesEnabled"
                id="b-poles"
                type="checkbox"
              >
                {{ $t('editor.controls.biomes.poles_show') }}
              </ParameterField>
            </template>
          </ParameterTable>
        </template>
       </SidebarSection>

      <!-- Clouds -->
      <SidebarSection icon="mingcute:clouds-line" :expand="false">
        <template v-slot:title>{{ $t('editor.controls.clouds.$title') }}</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterField
              v-model="LG_PARAMETERS.cloudsEnabled"
              id="c-toggle"
              type="checkbox"
            >
              {{ $t('editor.controls.clouds.clouds_show') }}
            </ParameterField>
            <template v-if="LG_PARAMETERS.cloudsEnabled">
              <ParameterCategory>{{ $t('editor.controls.clouds.transform') }}</ParameterCategory>
              <ParameterField
                v-model="LG_PARAMETERS.cloudsRotation"
                id="c-rot"
                type="range"
                :step="1"
                :min="0"
                :max="360"
              >
                {{ $t('editor.controls.clouds.transform_rotation') }} <sup>(°)</sup>
              </ParameterField>
              <ParameterCategory>{{ $t('editor.controls.clouds.noise') }}</ParameterCategory>
              <ParameterField
                v-model="LG_PARAMETERS.cloudsNoise.frequency"
                id="c-freq"
                type="range"
                :step="0.01"
                :min="0"
                :max="5"
              >
                {{ $t('editor.controls.clouds.noise_fbm_frequency') }}
              </ParameterField>
              <ParameterField
                v-model="LG_PARAMETERS.cloudsNoise.amplitude"
                id="c-amp"
                type="range"
                :step="0.01"
                :min="0"
                :max="1.25"
              >
                {{ $t('editor.controls.clouds.noise_fbm_amplitude') }}
              </ParameterField>
              <ParameterField
                v-model="LG_PARAMETERS.cloudsNoise.lacunarity"
                id="c-lac"
                type="range"
                :step="0.01"
                :min="0"
                :max="2.5"
              >
                {{ $t('editor.controls.clouds.noise_fbm_lacunarity') }}
              </ParameterField>
              <ParameterCategory>{{ $t('editor.controls.clouds.rgba') }}</ParameterCategory>
              <ParameterColor v-model="LG_PARAMETERS.cloudsColor">
                {{ $t('editor.controls.clouds.rgba_color') }}
              </ParameterColor>
              <ParameterColorRamp
                mode="opacity"
                v-model="(LG_PARAMETERS.cloudsColorRamp as ColorRamp)"
                :key="LG_PARAMETERS.id"
              >{{ $t('editor.controls.clouds.rgba_opacityramp') }}</ParameterColorRamp>
            </template>
          </ParameterTable>
        </template>
      </SidebarSection>

      <!-- Atmosphere -->
      <SidebarSection icon="material-symbols:line-curve-rounded" :expand=false>
        <template v-slot:title>{{ $t('editor.controls.atmosphere.$title') }}</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterField
              v-model="LG_PARAMETERS.atmosphereEnabled"
              id="a-toggle"
              type="checkbox"
            >
            {{ $t('editor.controls.atmosphere.atmosphere_show') }}
            </ParameterField>
            <template v-if="LG_PARAMETERS.atmosphereEnabled">
              <ParameterCategory>{{ $t('editor.controls.atmosphere.transform') }}</ParameterCategory>
              <ParameterField
                v-model="LG_PARAMETERS.atmosphereHeight"
                id="a-height"
                type="range"
                :step="0.1"
                :min="1"
                :max="8"
              >
                {{ $t('editor.controls.atmosphere.transform_height') }}
              </ParameterField>
              <ParameterField
                v-model="LG_PARAMETERS.atmosphereDensityScale"
                id="a-density"
                type="range"
                :step="0.01"
                :min="1"
                :max="10"
              >
                {{ $t('editor.controls.atmosphere.transform_density') }}
              </ParameterField>
              <ParameterCategory>{{ $t('editor.controls.atmosphere.rgba') }}</ParameterCategory>
              <ParameterField
                v-model="LG_PARAMETERS.atmosphereHue"
                id="a-hue"
                type="range"
                :step="0.01"
                :min="0"
                :max="2"
              >
                {{ $t('editor.controls.atmosphere.rgba_hue') }}
              </ParameterField>
              <ParameterField
                v-model="LG_PARAMETERS.atmosphereIntensity"
                id="a-int"
                type="range"
                :step="0.01"
                :min="0"
                :max="2"
              >
                {{ $t('editor.controls.atmosphere.rgba_intensity') }}
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