<template>
  <ParameterGrid>
    <ParameterGroup v-model="LG_PLANET_DATA.lensFlareEnabled" :toggleable="LG_PLANET_DATA.lensFlareEnabled">
      <template #title>{{ $t('editor.controls.lighting.lensflare') }}</template>
      <template #content>
        <template v-if="LG_PLANET_DATA.lensFlareEnabled">
          <ParameterSlider
            id="f-pointsint"
            v-model="LG_PLANET_DATA.lensFlarePointsIntensity"
            :step="0.01"
            :min="0"
            :max="1"
          >
            {{ $t('editor.controls.lighting.lensflare_points_intensity') }}
          </ParameterSlider>
          <ParameterSlider id="f-glareint" v-model="LG_PLANET_DATA.lensFlareGlareIntensity" :step="0.01" :min="0" :max="1">
            {{ $t('editor.controls.lighting.lensflare_glare_intensity') }}
          </ParameterSlider>
        </template>
      </template>
    </ParameterGroup>
    <ParameterGroup :toggleable="true">
      <template #title>{{ $t('editor.controls.lighting.sunlight') }}</template>
      <template #content>
        <ParameterSlider id="l-angle" v-model="LG_PLANET_DATA.sunLightAngle" :step="0.1" :min="-90" :max="90">
          {{ $t('editor.controls.lighting.sunlight_angle') }} <sup>(°)</sup>
        </ParameterSlider>
        <ParameterSlider id="l-int" v-model="LG_PLANET_DATA.sunLightIntensity" :step="0.1" :min="0" :max="50">
          {{ $t('editor.controls.lighting.sunlight_intensity') }}
        </ParameterSlider>
        <ParameterColor v-model="LG_PLANET_DATA.sunLightColor">
          {{ $t('editor.controls.lighting.sunlight_color') }}
        </ParameterColor>
      </template>
    </ParameterGroup>
    <ParameterGroup :toggleable="true">
      <template #title>{{ $t('editor.controls.lighting.amblight') }}</template>
      <template #content>
        <ParameterSlider id="m-int" v-model="LG_PLANET_DATA.ambLightIntensity" :step="0.01" :min="0" :max="1">
          {{ $t('editor.controls.lighting.amblight_intensity') }}
        </ParameterSlider>
        <ParameterColor v-model="LG_PLANET_DATA.ambLightColor">
          {{ $t('editor.controls.lighting.amblight_color') }}
        </ParameterColor>
      </template>
    </ParameterGroup>
  </ParameterGrid>
</template>
<script setup lang="ts">
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
</script>
