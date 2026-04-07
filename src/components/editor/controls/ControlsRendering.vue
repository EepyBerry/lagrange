<template>
  <ParameterGrid>
    <ParameterGroup toggleable>
      <template #title>{{ $t('editor.controls.planet_rendering.transform') }}</template>
      <template #content>
        <ParameterSlider id="p-tilt" v-model="EDITOR_STATE.planetData.planetRadius" :step="0.01" :min="0.5" :max="1">
          {{ $t('editor.controls.planet_rendering.transform_radius') }}
        </ParameterSlider>
        <ParameterSlider id="p-tilt" v-model="EDITOR_STATE.planetData.planetAxialTilt" :step="1" :min="-180" :max="180">
          {{ $t('editor.controls.planet_rendering.transform_axialtilt') }} <sup>(°)</sup>
        </ParameterSlider>
        <ParameterSlider id="p-rot" v-model="EDITOR_STATE.planetData.planetRotation" :step="1" :min="0" :max="360">
          {{ $t('editor.controls.planet_rendering.transform_rotation') }} <sup>(°)</sup>
        </ParameterSlider>
      </template>
    </ParameterGroup>
    <ParameterGroup toggleable>
      <template #title>{{ $t('editor.controls.planet_rendering.metallicroughness') }}</template>
      <template #content>
        <ParameterSlider
          id="p-wlevel"
          v-model="EDITOR_STATE.planetData.planetWaterLevel"
          :step="0.01"
          :min="0"
          :max="1"
        >
          {{ $t('editor.controls.planet_rendering.waterlevel') }}
        </ParameterSlider>
        <ParameterDivider />
        <ParameterSlider
          id="p-wrough"
          v-model="EDITOR_STATE.planetData.planetWaterRoughness"
          :step="0.01"
          :min="0"
          :max="1"
        >
          {{ $t('editor.controls.planet_rendering.metallicroughness_waterroughness') }}
        </ParameterSlider>
        <ParameterSlider
          id="p-wmetal"
          v-model="EDITOR_STATE.planetData.planetWaterMetalness"
          :step="0.01"
          :min="0"
          :max="1"
        >
          {{ $t('editor.controls.planet_rendering.metallicroughness_watermetalness') }}
        </ParameterSlider>
        <ParameterDivider />
        <ParameterSlider
          id="p-grough"
          v-model="EDITOR_STATE.planetData.planetGroundRoughness"
          :step="0.01"
          :min="0"
          :max="1"
        >
          {{ $t('editor.controls.planet_rendering.metallicroughness_groundroughness') }}
        </ParameterSlider>
        <ParameterSlider
          id="p-gmetal"
          v-model="EDITOR_STATE.planetData.planetGroundMetalness"
          :step="0.01"
          :min="0"
          :max="1"
        >
          {{ $t('editor.controls.planet_rendering.metallicroughness_groundmetalness') }}
        </ParameterSlider>
      </template>
    </ParameterGroup>
    <ParameterGroup
      v-model="EDITOR_STATE.planetData.planetShowEmissive"
      :toggleable="EDITOR_STATE.planetData.planetShowEmissive"
    >
      <template #title>{{ $t('editor.controls.planet_rendering.emissivity') }}</template>
      <template #content>
        <ParameterSlider
          id="e-wemissive"
          v-model="EDITOR_STATE.planetData.planetWaterEmissiveIntensity"
          :step="0.01"
          :min="0"
          :max="10"
        >
          {{ $t('editor.controls.planet_rendering.emissivity_waterintensity') }}
        </ParameterSlider>
        <ParameterSlider
          id="e-gemissive"
          v-model="EDITOR_STATE.planetData.planetGroundEmissiveIntensity"
          :step="0.01"
          :min="0"
          :max="10"
        >
          {{ $t('editor.controls.planet_rendering.emissivity_groundintensity') }}
        </ParameterSlider>
      </template>
    </ParameterGroup>
  </ParameterGrid>
</template>
<script setup lang="ts">
import { EDITOR_STATE } from '@/core/state/editor.state';
</script>
