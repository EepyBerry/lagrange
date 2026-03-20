<template>
  <ParameterGrid>
    <ParameterGroup
      v-model="EDITOR_STATE.planetData.lensFlareEnabled"
      :toggleable="EDITOR_STATE.planetData.lensFlareEnabled"
    >
      <template #title>{{ $t('editor.controls.lighting.lensflare') }}</template>
      <template #content>
        <template v-if="EDITOR_STATE.planetData.lensFlareEnabled">
          <ParameterSlider
            id="f-pointsint"
            v-model="EDITOR_STATE.planetData.lensFlarePointsIntensity"
            :step="0.01"
            :min="0"
            :max="1"
          >
            {{ $t('editor.controls.lighting.lensflare_points_intensity') }}
          </ParameterSlider>
          <ParameterSlider
            id="f-glareint"
            v-model="EDITOR_STATE.planetData.lensFlareGlareIntensity"
            :step="0.01"
            :min="0"
            :max="1"
          >
            {{ $t('editor.controls.lighting.lensflare_glare_intensity') }}
          </ParameterSlider>
        </template>
      </template>
    </ParameterGroup>
    <ParameterGroup :toggleable="true">
      <template #title>{{ $t('editor.controls.lighting.sunlight') }}</template>
      <template #content>
        <ParameterSlider id="l-angle" v-model="EDITOR_STATE.planetData.sunLightAngle" :step="0.1" :min="-90" :max="90">
          {{ $t('editor.controls.lighting.sunlight_angle') }} <sup>(°)</sup>
        </ParameterSlider>
        <ParameterSlider id="l-int" v-model="EDITOR_STATE.planetData.sunLightIntensity" :step="0.1" :min="0" :max="50">
          {{ $t('editor.controls.lighting.sunlight_intensity') }}
        </ParameterSlider>
        <ParameterColor v-model="EDITOR_STATE.planetData.sunLightColor">
          {{ $t('editor.controls.lighting.sunlight_color') }}
        </ParameterColor>
      </template>
    </ParameterGroup>
    <ParameterGroup :toggleable="true">
      <template #title>{{ $t('editor.controls.lighting.amblight') }}</template>
      <template #content>
        <ParameterSlider id="m-int" v-model="EDITOR_STATE.planetData.ambLightIntensity" :step="0.01" :min="0" :max="1">
          {{ $t('editor.controls.lighting.amblight_intensity') }}
        </ParameterSlider>
        <ParameterColor v-model="EDITOR_STATE.planetData.ambLightColor">
          {{ $t('editor.controls.lighting.amblight_color') }}
        </ParameterColor>
      </template>
    </ParameterGroup>
  </ParameterGrid>
</template>
<script setup lang="ts">
import { EDITOR_STATE } from '@/core/state/editor.state';
</script>
