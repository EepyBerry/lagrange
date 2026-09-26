<template>
  <ParameterGrid>
    <ParameterGroup toggleable>
      <template #title>{{ $t('editor.planet_rendering.metallicroughness') }}</template>
      <template #content>
        <ParameterSlider
          id="p-wrough"
          v-model="EDITOR_STATE.planetData.planetWaterRoughness"
          :step="0.01"
          :min="0"
          :max="1"
        >
          {{ $t('editor.planet_rendering.metallicroughness_waterroughness') }}
        </ParameterSlider>
        <ParameterSlider
          id="p-wmetal"
          v-model="EDITOR_STATE.planetData.planetWaterMetalness"
          :step="0.01"
          :min="0"
          :max="1"
        >
          {{ $t('editor.planet_rendering.metallicroughness_watermetalness') }}
        </ParameterSlider>
        <ParameterDivider />
        <ParameterSlider
          id="p-grough"
          v-model="EDITOR_STATE.planetData.planetGroundRoughness"
          :step="0.01"
          :min="0"
          :max="1"
        >
          {{ $t('editor.planet_rendering.metallicroughness_groundroughness') }}
        </ParameterSlider>
        <ParameterSlider
          id="p-gmetal"
          v-model="EDITOR_STATE.planetData.planetGroundMetalness"
          :step="0.01"
          :min="0"
          :max="1"
        >
          {{ $t('editor.planet_rendering.metallicroughness_groundmetalness') }}
        </ParameterSlider>
      </template>
    </ParameterGroup>
    <ParameterGroup
      v-model="EDITOR_STATE.planetData.planetSurfaceShowBumps"
      :toggleable="EDITOR_STATE.planetData.planetSurfaceShowBumps"
    >
      <template #title>{{ $t('editor.surface.bumpmap') }}</template>
      <template #content>
        <ParameterSlider
          id="s-bumpstr"
          v-model="EDITOR_STATE.planetData.planetSurfaceBumpStrength"
          :step="0.0005"
          :min="0.02"
          :max="0.2"
        >
          {{ $t('editor.surface.bumpmap_strength') }}
        </ParameterSlider>
        <ParameterSlider
          id="s-bumpoff"
          v-model="EDITOR_STATE.planetData.planetSurfaceBumpOffset"
          :step="0.0005"
          :min="0.001"
          :max="0.01"
        >
          {{ $t('editor.surface.bumpmap_offset') }}
        </ParameterSlider>
      </template>
    </ParameterGroup>
  </ParameterGrid>
</template>
<script setup lang="ts">
import { EDITOR_STATE } from '@core/editor/state/editor.state';
</script>
