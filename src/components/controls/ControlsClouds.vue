<template>
  <ParameterGrid>
    <ParameterCheckbox id="c-toggle" v-model="LG_PLANET_DATA.cloudsEnabled" :true-value="true" :false-value="false">
      {{ $t('editor.controls.clouds.clouds_show') }}
    </ParameterCheckbox>
    <template v-if="LG_PLANET_DATA.cloudsEnabled">
      <ParameterCategory>{{ $t('editor.controls.clouds.transform') }}</ParameterCategory>
      <ParameterSlider id="c-rot" v-model="LG_PLANET_DATA.cloudsRotation" :step="1" :min="0" :max="360">
        {{ $t('editor.controls.clouds.transform_rotation') }} <sup>(°)</sup>
      </ParameterSlider>

      <ParameterCategory>{{ $t('editor.general.warping') }}</ParameterCategory>
      <ParameterCheckbox id="c-warp" v-model="LG_PLANET_DATA.cloudsShowWarping" :true-value="true" :false-value="false">
        {{ $t('editor.general.warping_show') }}
      </ParameterCheckbox>
      <template v-if="LG_PLANET_DATA.cloudsShowWarping">
        <ParameterSlider id="c-xwarp" v-model="LG_PLANET_DATA.cloudsNoise.xWarpFactor" :step="0.01" :max="8">
          {{ $t('editor.general.warping_x') }}
        </ParameterSlider>
        <ParameterSlider id="c-ywarp" v-model="LG_PLANET_DATA.cloudsNoise.yWarpFactor" :step="0.01" :max="8">
          {{ $t('editor.general.warping_y') }}
        </ParameterSlider>
        <ParameterSlider id="c-zwarp" v-model="LG_PLANET_DATA.cloudsNoise.zWarpFactor" :step="0.01" :max="8">
          {{ $t('editor.general.warping_z') }}
        </ParameterSlider>
      </template>

      <ParameterCategory>{{ $t('editor.controls.clouds.noise') }}</ParameterCategory>
      <ParameterSlider id="c-freq" v-model="LG_PLANET_DATA.cloudsNoise.frequency" :step="0.01" :max="5">
        {{ $t('editor.general.noise_fbm_frequency') }}
      </ParameterSlider>
      <ParameterSlider id="c-amp" v-model="LG_PLANET_DATA.cloudsNoise.amplitude" :step="0.01" :min="0" :max="1.25">
        {{ $t('editor.general.noise_fbm_amplitude') }}
      </ParameterSlider>
      <ParameterSlider id="c-lac" v-model="LG_PLANET_DATA.cloudsNoise.lacunarity" :step="0.01" :min="1" :max="3">
        {{ $t('editor.general.noise_fbm_lacunarity') }}
      </ParameterSlider>
      <ParameterSlider id="c-oct" v-model="LG_PLANET_DATA.cloudsNoise.octaves" :step="1" :min="1" :max="8">
        {{ $t('editor.general.noise_fbm_octaves') }}
      </ParameterSlider>

      <ParameterCategory>{{ $t('editor.controls.clouds.rgba') }}</ParameterCategory>
      <ParameterColor v-model="LG_PLANET_DATA.cloudsColor">
        {{ $t('editor.general.noise_color') }}
      </ParameterColor>
      <!-- prettier-ignore-attribute -->
      <ParameterColorRamp
        :key="LG_PLANET_DATA.planetName"
        v-model="(LG_PLANET_DATA.cloudsColorRamp as ColorRamp)"
        mode="opacity"
      >
        {{ $t('editor.controls.clouds.rgba_opacityramp') }}
      </ParameterColorRamp>
    </template>
  </ParameterGrid>
</template>
<script setup lang="ts">
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import ParameterGrid from '@components/parameters/ParameterGrid.vue'
import ParameterSlider from '@components/parameters/ParameterSlider.vue'
import ParameterCheckbox from '@components/parameters/ParameterCheckbox.vue'
import ParameterCategory from '@components/parameters/ParameterCategory.vue'
import ParameterColorRamp from '@components/parameters/ParameterColorRamp.vue'
import ParameterColor from '@components/parameters/ParameterColor.vue'
import type { ColorRamp } from '@/core/models/color-ramp.model'
</script>
