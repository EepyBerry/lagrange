<template>
  <div id="controls">
    <aside class="sidebar">
      <!-- Lighting -->
      <SidebarSection icon="mingcute:sun-line" :expand="false" :ariaLabel="$t('editor.controls.lighting.$title')">
        <template v-slot:title>{{ $t('editor.controls.lighting.$title') }}</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterCategory top>{{ $t('editor.controls.lighting.lensflare') }}</ParameterCategory>
            <ParameterCheckbox
              v-model="LG_PLANET_DATA.lensFlareEnabled"
              id="f-toggle"
              :true-value="true"
              :false-value="false"
            >
              {{ $t('editor.controls.lighting.lensflare_show') }}
            </ParameterCheckbox>
            <template v-if="LG_PLANET_DATA.lensFlareEnabled">
              <ParameterSlider
                v-model="LG_PLANET_DATA.lensFlarePointsIntensity"
                id="f-pointsint"
                :step="0.01"
                :min="0"
                :max="1"
              >
                {{ $t('editor.controls.lighting.lensflare_points_intensity') }}
              </ParameterSlider>
              <ParameterSlider
                v-model="LG_PLANET_DATA.lensFlareGlareIntensity"
                id="f-glareint"
                :step="0.01"
                :min="0"
                :max="1"
              >
                {{ $t('editor.controls.lighting.lensflare_glare_intensity') }}
              </ParameterSlider>
            </template>
            <ParameterCategory>{{ $t('editor.controls.lighting.sunlight') }}</ParameterCategory>
            <ParameterSlider v-model="LG_PLANET_DATA.sunLightAngle" id="l-angle" :step="0.1" :min="-90" :max="90">
              {{ $t('editor.controls.lighting.sunlight_angle') }} <sup>(°)</sup>
            </ParameterSlider>
            <ParameterSlider v-model="LG_PLANET_DATA.sunLightIntensity" id="l-int" :step="0.1" :min="0" :max="50">
              {{ $t('editor.controls.lighting.sunlight_intensity') }}
            </ParameterSlider>
            <ParameterColor v-model="LG_PLANET_DATA.sunLightColor">
              {{ $t('editor.controls.lighting.sunlight_color') }}
            </ParameterColor>
            <ParameterCategory>{{ $t('editor.controls.lighting.amblight') }}</ParameterCategory>
            <ParameterSlider v-model="LG_PLANET_DATA.ambLightIntensity" id="m-int" :step="0.01" :min="0" :max="1">
              {{ $t('editor.controls.lighting.amblight_intensity') }}
            </ParameterSlider>
            <ParameterColor v-model="LG_PLANET_DATA.ambLightColor">
              {{ $t('editor.controls.lighting.amblight_color') }}
            </ParameterColor>
          </ParameterTable>
        </template>
      </SidebarSection>

      <!-- Planet & Rendering -->
      <SidebarSection icon="tabler:gizmo" :expand="false" :ariaLabel="$t('editor.controls.planet_rendering.$title')">
        <template v-slot:title>{{ $t('editor.controls.planet_rendering.$title') }}</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterCategory top>{{ $t('editor.controls.planet_rendering.transform') }}</ParameterCategory>
            <ParameterSlider v-model="LG_PLANET_DATA.planetAxialTilt" id="p-tilt" :step="1" :min="0" :max="180">
              {{ $t('editor.controls.planet_rendering.transform_axialtilt') }} <sup>(°)</sup>
            </ParameterSlider>
            <ParameterSlider v-model="LG_PLANET_DATA.planetRotation" id="p-rot" :step="1" :min="0" :max="360">
              {{ $t('editor.controls.planet_rendering.transform_rotation') }} <sup>(°)</sup>
            </ParameterSlider>
            <ParameterCategory>{{ $t('editor.controls.planet_rendering.pbr') }}</ParameterCategory>
            <ParameterSlider v-model="LG_PLANET_DATA.planetWaterLevel" id="p-wlevel" :step="0.01" :min="0" :max="1">
              {{ $t('editor.controls.planet_rendering.pbr_waterlevel') }}
            </ParameterSlider>
            <ParameterDivider />
            <ParameterSlider v-model="LG_PLANET_DATA.planetWaterRoughness" id="p-wrough" :step="0.01" :min="0" :max="1">
              {{ $t('editor.controls.planet_rendering.pbr_waterroughness') }}
            </ParameterSlider>
            <ParameterSlider v-model="LG_PLANET_DATA.planetWaterMetalness" id="p-wmetal" :step="0.01" :min="0" :max="1">
              {{ $t('editor.controls.planet_rendering.pbr_watermetalness') }}
            </ParameterSlider>
            <ParameterDivider />
            <ParameterSlider v-model="LG_PLANET_DATA.planetGroundRoughness" id="p-grough" :step="0.01" :min="0" :max="1">
              {{ $t('editor.controls.planet_rendering.pbr_groundroughness') }}
            </ParameterSlider>
            <ParameterSlider v-model="LG_PLANET_DATA.planetGroundMetalness" id="p-gmetal" :step="0.01" :min="0" :max="1">
              {{ $t('editor.controls.planet_rendering.pbr_groundmetalness') }}
            </ParameterSlider>
          </ParameterTable>
        </template>
      </SidebarSection>

      <!-- Surface -->
      <SidebarSection icon="mingcute:planet-line" :expand="false" :ariaLabel="$t('editor.controls.surface.$title')">
        <template v-slot:title>{{ $t('editor.controls.surface.$title') }}</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterCategory top>{{ $t('editor.controls.surface.bumpmap') }}</ParameterCategory>
            <ParameterCheckbox
              v-model="LG_PLANET_DATA.planetSurfaceShowBumps"
              id="s-bump"
              :true-value="true"
              :false-value="false"
            >
              {{ $t('editor.controls.surface.bumpmap_show') }}
            </ParameterCheckbox>
            <template v-if="LG_PLANET_DATA.planetSurfaceShowBumps">
              <ParameterSlider
                v-model="LG_PLANET_DATA.planetSurfaceBumpStrength"
                id="s-bumpstr"
                :step="0.0005"
                :min="0.02"
                :max="0.2"
              >
                {{ $t('editor.controls.surface.bumpmap_strength') }}
              </ParameterSlider>
            </template>
            <ParameterCategory>{{ $t('editor.controls.surface.noise') }}</ParameterCategory>
            <ParameterSlider v-model="LG_PLANET_DATA.planetSurfaceNoise.frequency" id="s-freq" :step="0.01" :max="10">
              {{ $t('editor.controls.surface.noise_fbm_frequency') }}
            </ParameterSlider>
            <ParameterSlider v-model="LG_PLANET_DATA.planetSurfaceNoise.amplitude" id="s-amp" :step="0.01" :max="1.25">
              {{ $t('editor.controls.surface.noise_fbm_amplitude') }}
            </ParameterSlider>
            <ParameterSlider
              v-model="LG_PLANET_DATA.planetSurfaceNoise.lacunarity"
              id="s-lac"
              :step="0.01"
              :min="1"
              :max="3"
            >
              {{ $t('editor.controls.surface.noise_fbm_lacunarity') }}
            </ParameterSlider>
            <ParameterDivider />
            <ParameterColorRamp mode="color" v-model="(LG_PLANET_DATA.planetSurfaceColorRamp as ColorRamp)" :key="LG_PLANET_DATA.planetName">
              {{ $t('editor.controls.surface.noise_colorramp') }}
            </ParameterColorRamp>
          </ParameterTable>
        </template>
      </SidebarSection>

      <!-- Biomes -->
      <SidebarSection icon="mingcute:mountain-2-line" :expand="false" :ariaLabel="$t('editor.controls.biomes.$title')">
        <template v-slot:title>{{ $t('editor.controls.biomes.$title') }}</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterCheckbox
              v-model="LG_PLANET_DATA.biomesEnabled"
              id="b-biomes"
              :true-value="true"
              :false-value="false"
            >
              {{ $t('editor.controls.biomes.biomes_show') }}
            </ParameterCheckbox>
            <template v-if="LG_PLANET_DATA.biomesEnabled">
              <ParameterCheckbox
                v-model="LG_PLANET_DATA.biomePolesEnabled"
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
      <SidebarSection icon="mingcute:clouds-line" :expand="false" :ariaLabel="$t('editor.controls.clouds.$title')">
        <template v-slot:title>{{ $t('editor.controls.clouds.$title') }}</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterCheckbox
              v-model="LG_PLANET_DATA.cloudsEnabled"
              id="c-toggle"
              :true-value="true"
              :false-value="false"
            >
              {{ $t('editor.controls.clouds.clouds_show') }}
            </ParameterCheckbox>
            <template v-if="LG_PLANET_DATA.cloudsEnabled">
              <ParameterCategory>{{ $t('editor.controls.clouds.transform') }}</ParameterCategory>
              <ParameterSlider v-model="LG_PLANET_DATA.cloudsRotation" id="c-rot" :step="1" :min="0" :max="360">
                {{ $t('editor.controls.clouds.transform_rotation') }} <sup>(°)</sup>
              </ParameterSlider>
              <ParameterCategory>{{ $t('editor.controls.clouds.noise') }}</ParameterCategory>
              <ParameterSlider v-model="LG_PLANET_DATA.cloudsNoise.frequency" id="c-freq" :step="0.01" :max="5">
                {{ $t('editor.controls.clouds.noise_fbm_frequency') }}
              </ParameterSlider>
              <ParameterSlider
                v-model="LG_PLANET_DATA.cloudsNoise.amplitude"
                id="c-amp"
                :step="0.01"
                :min="0"
                :max="1.25"
              >
                {{ $t('editor.controls.clouds.noise_fbm_amplitude') }}
              </ParameterSlider>
              <ParameterSlider v-model="LG_PLANET_DATA.cloudsNoise.lacunarity" id="c-lac" :step="0.01" :min="1" :max="3">
                {{ $t('editor.controls.clouds.noise_fbm_lacunarity') }}
              </ParameterSlider>
              <ParameterCategory>{{ $t('editor.controls.clouds.rgba') }}</ParameterCategory>
              <ParameterColor v-model="LG_PLANET_DATA.cloudsColor">
                {{ $t('editor.controls.clouds.rgba_color') }}
              </ParameterColor>
              <ParameterColorRamp mode="opacity" v-model="(LG_PLANET_DATA.cloudsColorRamp as ColorRamp)" :key="LG_PLANET_DATA.planetName">
                {{ $t('editor.controls.clouds.rgba_opacityramp') }}
              </ParameterColorRamp>
            </template>
          </ParameterTable>
        </template>
      </SidebarSection>

      <!-- Atmosphere -->
      <SidebarSection icon="material-symbols:line-curve-rounded" :expand="false" :ariaLabel="$t('editor.controls.atmosphere.$title')">
        <template v-slot:title>{{ $t('editor.controls.atmosphere.$title') }}</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterCheckbox
              v-model="LG_PLANET_DATA.atmosphereEnabled"
              id="a-toggle"
              :true-value="true"
              :false-value="false"
            >
              {{ $t('editor.controls.atmosphere.atmosphere_show') }}
            </ParameterCheckbox>
            <template v-if="LG_PLANET_DATA.atmosphereEnabled">
              <ParameterCategory>{{ $t('editor.controls.atmosphere.transform') }}</ParameterCategory>
              <ParameterSlider v-model="LG_PLANET_DATA.atmosphereHeight" id="a-height" :step="0.1" :min="1" :max="8">
                {{ $t('editor.controls.atmosphere.transform_height') }}
              </ParameterSlider>
              <ParameterSlider
                v-model="LG_PLANET_DATA.atmosphereDensityScale"
                id="a-density"
                :step="0.01"
                :min="1"
                :max="10"
              >
                {{ $t('editor.controls.atmosphere.transform_density') }}
              </ParameterSlider>
              <ParameterCategory>{{ $t('editor.controls.atmosphere.rgba') }}</ParameterCategory>
              <ParameterSlider v-model="LG_PLANET_DATA.atmosphereHue" id="a-hue" :step="0.01" :min="0" :max="2">
                {{ $t('editor.controls.atmosphere.rgba_hue') }}
              </ParameterSlider>
              <ParameterSlider v-model="LG_PLANET_DATA.atmosphereIntensity" id="a-int" :step="0.01" :min="0" :max="2">
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
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import ParameterColorRamp from '@components/parameters/ParameterColorRamp.vue'
import ParameterDivider from '@components/parameters/ParameterDivider.vue'
import SidebarSection from '@components/elements/SidebarSection.vue'
import ParameterSlider from '@components/parameters/ParameterSlider.vue'
import ParameterCheckbox from '@components/parameters/ParameterCheckbox.vue'
import type { ColorRamp } from '@/core/models/color-ramp.model'
</script>

<style scoped lang="scss">
#controls {
  z-index: 10;
  position: absolute;
  inset: 0 auto 0;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;

  .sidebar {
    width: 100%;
    padding: 1rem;
    margin-top: 3.875rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    overflow: auto;

    user-select: none;
    direction: rtl;

    & > section {
      direction: ltr;
      align-self: flex-end;
      min-width: 26rem;
    }
  }
}
@media screen and (max-width: 1199px) {
  #controls {
    .sidebar {
      padding: 0.5rem;
      margin-top: 3.375rem;

      & > section {
        min-width: 0;
      }
      & > section.expanded {
        min-width: 26rem;
      }
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
      min-width: 0;
      max-width: 100%;
    }
  }
}
</style>
