<template>
  <div id="controls">
    <aside class="sidebar">
      <!-- Lighting -->
      <SidebarSection icon="mingcute:sun-line" :expand="false">
        <template v-slot:title>{{ $t('editor.controls.lighting.$title') }}</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterCategory top>{{ $t('editor.controls.lighting.lensflare') }}</ParameterCategory>
            <ParameterCheckbox
              v-model="LG_PARAMETERS.lensFlareEnabled"
              id="f-toggle"
              :true-value="true"
              :false-value="false"
            >
              {{ $t('editor.controls.lighting.lensflare_show') }}
            </ParameterCheckbox>
            <template v-if="LG_PARAMETERS.lensFlareEnabled">
              <ParameterSlider
                v-model="LG_PARAMETERS.lensFlarePointsIntensity"
                id="f-pointsint"
                :step="0.01"
                :min="0"
                :max="1"
              >
                {{ $t('editor.controls.lighting.lensflare_points_intensity') }}
              </ParameterSlider>
              <ParameterSlider
                v-model="LG_PARAMETERS.lensFlareGlareIntensity"
                id="f-glareint"
                :step="0.01"
                :min="0"
                :max="1"
              >
                {{ $t('editor.controls.lighting.lensflare_glare_intensity') }}
              </ParameterSlider>
            </template>
            <ParameterCategory>{{ $t('editor.controls.lighting.sunlight') }}</ParameterCategory>
            <ParameterSlider v-model="LG_PARAMETERS.sunLightAngle" id="l-angle" :step="0.1" :min="-90" :max="90">
              {{ $t('editor.controls.lighting.sunlight_angle') }} <sup>(°)</sup>
            </ParameterSlider>
            <ParameterSlider v-model="LG_PARAMETERS.sunLightIntensity" id="l-int" :step="0.1" :min="0" :max="50">
              {{ $t('editor.controls.lighting.sunlight_intensity') }}
            </ParameterSlider>
            <ParameterColor v-model="LG_PARAMETERS.sunLightColor">
              {{ $t('editor.controls.lighting.sunlight_color') }}
            </ParameterColor>
            <ParameterCategory>{{ $t('editor.controls.lighting.amblight') }}</ParameterCategory>
            <ParameterSlider v-model="LG_PARAMETERS.ambLightIntensity" id="m-int" :step="0.01" :min="0" :max="1">
              {{ $t('editor.controls.lighting.amblight_intensity') }}
            </ParameterSlider>
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
            <ParameterSlider v-model="LG_PARAMETERS.planetAxialTilt" id="p-tilt" :step="1" :min="0" :max="180">
              {{ $t('editor.controls.planet_rendering.transform_axialtilt') }} <sup>(°)</sup>
            </ParameterSlider>
            <ParameterSlider v-model="LG_PARAMETERS.planetRotation" id="p-rot" :step="1" :min="0" :max="360">
              {{ $t('editor.controls.planet_rendering.transform_rotation') }} <sup>(°)</sup>
            </ParameterSlider>
            <ParameterCategory>{{ $t('editor.controls.planet_rendering.pbr') }}</ParameterCategory>
            <ParameterSlider v-model="LG_PARAMETERS.planetWaterLevel" id="p-wlevel" :step="0.01" :min="0" :max="1">
              {{ $t('editor.controls.planet_rendering.pbr_waterlevel') }}
            </ParameterSlider>
            <ParameterDivider />
            <ParameterSlider v-model="LG_PARAMETERS.planetWaterRoughness" id="p-wrough" :step="0.01" :min="0" :max="1">
              {{ $t('editor.controls.planet_rendering.pbr_waterroughness') }}
            </ParameterSlider>
            <ParameterSlider v-model="LG_PARAMETERS.planetWaterMetalness" id="p-wmetal" :step="0.01" :min="0" :max="1">
              {{ $t('editor.controls.planet_rendering.pbr_watermetalness') }}
            </ParameterSlider>
            <ParameterDivider />
            <ParameterSlider v-model="LG_PARAMETERS.planetGroundRoughness" id="p-grough" :step="0.01" :min="0" :max="1">
              {{ $t('editor.controls.planet_rendering.pbr_groundroughness') }}
            </ParameterSlider>
            <ParameterSlider v-model="LG_PARAMETERS.planetGroundMetalness" id="p-gmetal" :step="0.01" :min="0" :max="1">
              {{ $t('editor.controls.planet_rendering.pbr_groundmetalness') }}
            </ParameterSlider>
          </ParameterTable>
        </template>
      </SidebarSection>

      <!-- Surface -->
      <SidebarSection icon="mingcute:planet-line" :expand="false">
        <template v-slot:title>{{ $t('editor.controls.surface.$title') }}</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterCategory top>{{ $t('editor.controls.surface.bumpmap') }}</ParameterCategory>
            <ParameterCheckbox
              v-model="LG_PARAMETERS.planetSurfaceShowBumps"
              id="s-bump"
              :true-value="true"
              :false-value="false"
            >
              {{ $t('editor.controls.surface.bumpmap_show') }}
            </ParameterCheckbox>
            <template v-if="LG_PARAMETERS.planetSurfaceShowBumps">
              <ParameterSlider
                v-model="LG_PARAMETERS.planetSurfaceBumpStrength"
                id="s-bumpstr"
                :step="0.0005"
                :min="0.02"
                :max="0.2"
              >
                {{ $t('editor.controls.surface.bumpmap_strength') }}
              </ParameterSlider>
            </template>
            <ParameterCategory>{{ $t('editor.controls.surface.noise') }}</ParameterCategory>
            <ParameterSlider v-model="LG_PARAMETERS.planetSurfaceNoise.frequency" id="s-freq" :step="0.01" :max="10">
              {{ $t('editor.controls.surface.noise_fbm_frequency') }}
            </ParameterSlider>
            <ParameterSlider v-model="LG_PARAMETERS.planetSurfaceNoise.amplitude" id="s-amp" :step="0.01" :max="1.25">
              {{ $t('editor.controls.surface.noise_fbm_amplitude') }}
            </ParameterSlider>
            <ParameterSlider
              v-model="LG_PARAMETERS.planetSurfaceNoise.lacunarity"
              id="s-lac"
              :step="0.01"
              :min="1"
              :max="3"
            >
              {{ $t('editor.controls.surface.noise_fbm_lacunarity') }}
            </ParameterSlider>
            <ParameterDivider />
            <ParameterColorRamp
              mode="color"
              v-model="LG_PARAMETERS.planetSurfaceColorRamp as ColorRamp"
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
            <ParameterCheckbox
              v-model="LG_PARAMETERS.biomesEnabled"
              id="b-biomes"
              :true-value="true"
              :false-value="false"
            >
              {{ $t('editor.controls.biomes.biomes_show') }}
            </ParameterCheckbox>
            <template v-if="LG_PARAMETERS.biomesEnabled">
              <ParameterCheckbox
                v-model="LG_PARAMETERS.biomePolesEnabled"
                id="b-poles"
                :true-value="true"
                :false-value="false"
              >
                {{ $t('editor.controls.biomes.poles_show') }}
              </ParameterCheckbox>
            </template>
          </ParameterTable>
        </template>
      </SidebarSection>

      <!-- Clouds -->
      <SidebarSection icon="mingcute:clouds-line" :expand="false">
        <template v-slot:title>{{ $t('editor.controls.clouds.$title') }}</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterCheckbox
              v-model="LG_PARAMETERS.cloudsEnabled"
              id="c-toggle"
              :true-value="true"
              :false-value="false"
            >
              {{ $t('editor.controls.clouds.clouds_show') }}
            </ParameterCheckbox>
            <template v-if="LG_PARAMETERS.cloudsEnabled">
              <ParameterCategory>{{ $t('editor.controls.clouds.transform') }}</ParameterCategory>
              <ParameterSlider v-model="LG_PARAMETERS.cloudsRotation" id="c-rot" :step="1" :min="0" :max="360">
                {{ $t('editor.controls.clouds.transform_rotation') }} <sup>(°)</sup>
              </ParameterSlider>
              <ParameterCategory>{{ $t('editor.controls.clouds.noise') }}</ParameterCategory>
              <ParameterSlider v-model="LG_PARAMETERS.cloudsNoise.frequency" id="c-freq" :step="0.01" :max="5">
                {{ $t('editor.controls.clouds.noise_fbm_frequency') }}
              </ParameterSlider>
              <ParameterSlider
                v-model="LG_PARAMETERS.cloudsNoise.amplitude"
                id="c-amp"
                :step="0.01"
                :min="0"
                :max="1.25"
              >
                {{ $t('editor.controls.clouds.noise_fbm_amplitude') }}
              </ParameterSlider>
              <ParameterSlider
                v-model="LG_PARAMETERS.cloudsNoise.lacunarity"
                id="c-lac"
                :step="0.01"
                :min="1"
                :max="3"
              >
                {{ $t('editor.controls.clouds.noise_fbm_lacunarity') }}
              </ParameterSlider>
              <ParameterCategory>{{ $t('editor.controls.clouds.rgba') }}</ParameterCategory>
              <ParameterColor v-model="LG_PARAMETERS.cloudsColor">
                {{ $t('editor.controls.clouds.rgba_color') }}
              </ParameterColor>
              <ParameterColorRamp
                mode="opacity"
                v-model="LG_PARAMETERS.cloudsColorRamp as ColorRamp"
                :key="LG_PARAMETERS.id"
                >{{ $t('editor.controls.clouds.rgba_opacityramp') }}</ParameterColorRamp
              >
            </template>
          </ParameterTable>
        </template>
      </SidebarSection>

      <!-- Atmosphere -->
      <SidebarSection icon="material-symbols:line-curve-rounded" :expand="false">
        <template v-slot:title>{{ $t('editor.controls.atmosphere.$title') }}</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterCheckbox
              v-model="LG_PARAMETERS.atmosphereEnabled"
              id="a-toggle"
              :true-value="true"
              :false-value="false"
            >
              {{ $t('editor.controls.atmosphere.atmosphere_show') }}
            </ParameterCheckbox>
            <template v-if="LG_PARAMETERS.atmosphereEnabled">
              <ParameterCategory>{{ $t('editor.controls.atmosphere.transform') }}</ParameterCategory>
              <ParameterSlider v-model="LG_PARAMETERS.atmosphereHeight" id="a-height" :step="0.1" :min="1" :max="8">
                {{ $t('editor.controls.atmosphere.transform_height') }}
              </ParameterSlider>
              <ParameterSlider
                v-model="LG_PARAMETERS.atmosphereDensityScale"
                id="a-density"
                :step="0.01"
                :min="1"
                :max="10"
              >
                {{ $t('editor.controls.atmosphere.transform_density') }}
              </ParameterSlider>
              <ParameterCategory>{{ $t('editor.controls.atmosphere.rgba') }}</ParameterCategory>
              <ParameterSlider v-model="LG_PARAMETERS.atmosphereHue" id="a-hue" :step="0.01" :min="0" :max="2">
                {{ $t('editor.controls.atmosphere.rgba_hue') }}
              </ParameterSlider>
              <ParameterSlider v-model="LG_PARAMETERS.atmosphereIntensity" id="a-int" :step="0.01" :min="0" :max="2">
                {{ $t('editor.controls.atmosphere.rgba_intensity') }}
              </ParameterSlider>
            </template>
          </ParameterTable>
        </template>
      </SidebarSection>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { LG_PARAMETERS } from '@core/globals'
import ParameterColorRamp from '@components/parameters/ParameterColorRamp.vue'
import ParameterDivider from '@components/parameters/ParameterDivider.vue'
import type { ColorRamp } from '@core/models/color-ramp.model'
import SidebarSection from '@components/elements/SidebarSection.vue'
import ParameterSlider from '@components/parameters/ParameterSlider.vue'
import ParameterCheckbox from '@components/parameters/ParameterCheckbox.vue'
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
    max-width: 26rem;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    overflow: auto;

    direction: rtl;

    & > section {
      direction: ltr;
      align-self: flex-end;
    }
  }
}

@media screen and (max-width: 1365px) {
  #controls {
    .sidebar {
      margin-top: 4.375rem;
    }
  }
}
@media screen and (max-width: 1199px) {
  #controls {
    .sidebar {
      padding: 0.5rem;
      margin-top: 3.375rem;
    }
  }
}
@media screen and (max-width: 767px) {
  #controls {
    min-width: 2rem;
    margin-bottom: 3.875rem;

    .sidebar {
      padding: 0.5rem;
    }
  }
}
@media screen and (max-width: 567px) {
  #controls {
    .sidebar {
      padding: 0.5rem;
      max-width: 100%;
    }
  }
}
</style>
