<template>
  <ParameterGrid>
    <ParameterCheckbox id="c-toggle" v-model="LG_PLANET_DATA.cloudsEnabled" :true-value="true" :false-value="false">
      {{ $t('editor.controls.clouds.clouds_show') }}
    </ParameterCheckbox>
    <template v-if="LG_PLANET_DATA.cloudsEnabled">
      <ParameterGroup :toggleable="true">
        <template #title>{{ $t('editor.controls.clouds.transform') }}</template>
        <template #content>
          <ParameterSlider id="c-rot" v-model="LG_PLANET_DATA.cloudsRotation" :step="1" :min="0" :max="360">
            {{ $t('editor.controls.clouds.transform_rotation') }} <sup>(°)</sup>
          </ParameterSlider>
        </template>
      </ParameterGroup>
      <ParameterGroup v-model="LG_PLANET_DATA.cloudsShowWarping" :toggleable="LG_PLANET_DATA.cloudsShowWarping">
        <template #title>{{ $t('editor.general.warping') }}</template>
        <template #content>
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
      </ParameterGroup>
      <ParameterGroup
        v-model="LG_PLANET_DATA.cloudsShowDisplacement"
        :toggleable="LG_PLANET_DATA.cloudsShowDisplacement"
      >
        <template #title>{{ $t('editor.general.displacement') }}</template>
        <template #content>
          <ParameterSlider id="s-dfac" v-model="LG_PLANET_DATA.cloudsDisplacement.factor" :step="0.005" :max="0.25">
            {{ $t('editor.general.displacement_factor') }}
          </ParameterSlider>
          <ParameterSlider
            id="s-deps"
            v-model="LG_PLANET_DATA.cloudsDisplacement.epsilon"
            :step="0.0005"
            :min="0.0005"
            :max="0.25"
          >
            {{ $t('editor.general.displacement_epsilon') }}
          </ParameterSlider>
          <ParameterSlider id="s-dmul" v-model="LG_PLANET_DATA.cloudsDisplacement.multiplier" :step="0.01" :max="3">
            {{ $t('editor.general.displacement_multiplier') }}
          </ParameterSlider>
          <ParameterDivider />
          <ParameterSlider id="s-dfreq" v-model="LG_PLANET_DATA.cloudsDisplacement.frequency" :step="0.01" :max="3">
            {{ $t('editor.general.noise_fbm_frequency') }}
          </ParameterSlider>
          <ParameterSlider id="s-damp" v-model="LG_PLANET_DATA.cloudsDisplacement.amplitude" :step="0.01" :max="1.25">
            {{ $t('editor.general.noise_fbm_amplitude') }}
          </ParameterSlider>
          <ParameterSlider
            id="s-dlac"
            v-model="LG_PLANET_DATA.cloudsDisplacement.lacunarity"
            :step="0.01"
            :min="1"
            :max="3"
          >
            {{ $t('editor.general.noise_fbm_lacunarity') }}
          </ParameterSlider>
          <ParameterSlider id="s-doct" v-model="LG_PLANET_DATA.cloudsDisplacement.octaves" :step="1" :min="1" :max="8">
            {{ $t('editor.general.noise_fbm_octaves') }}
          </ParameterSlider>
        </template>
      </ParameterGroup>
      <ParameterGroup :toggleable="true">
        <template #title>{{ $t('editor.general.noise') }}</template>
        <template #content>
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
        </template>
      </ParameterGroup>
      <ParameterGroup :toggleable="true">
        <template #title>{{ $t('editor.controls.clouds.rgba') }}</template>
        <template #content>
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
      </ParameterGroup>
    </template>
  </ParameterGrid>
</template>
<script setup lang="ts">
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import type { ColorRamp } from '@/core/models/color-ramp.model'
</script>
