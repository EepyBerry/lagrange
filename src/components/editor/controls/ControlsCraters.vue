<template>
  <ParameterGrid>
    <ParameterGroup :toggleable="true">
      <template #title>{{ $t('editor.general.noise_base_detail') }}</template>
      <template #content>
        <ParameterSlider id="ct-bscale" v-model="EDITOR_STATE.planetData.cratersBaseNoise.scale" :step="0.01" :max="20">
          {{ $t('editor.general.noise_voronoi_scale') }}
        </ParameterSlider>
        <ParameterSlider
          id="ct-bjitt"
          v-model="EDITOR_STATE.planetData.cratersBaseNoise.jitter"
          :step="0.01"
          :min="0"
          :max="1"
        >
          {{ $t('editor.general.noise_voronoi_jitter') }}
        </ParameterSlider>
        <ParameterDivider bordered />
        <ParameterSlider
          id="ct-dfreq"
          v-model="EDITOR_STATE.planetData.cratersDetailNoiseStrength"
          :step="0.01"
          :max="1"
        >
          {{ $t('editor.general.detail_noise_strength') }}
        </ParameterSlider>
        <ParameterDivider />
        <ParameterSlider
          id="ct-dfreq"
          v-model="EDITOR_STATE.planetData.cratersDetailNoise.frequency"
          :step="0.01"
          :max="5"
        >
          {{ $t('editor.general.noise_fbm_frequency') }}
        </ParameterSlider>
        <ParameterSlider
          id="ct-damp"
          v-model="EDITOR_STATE.planetData.cratersDetailNoise.amplitude"
          :step="0.01"
          :min="0"
          :max="2"
        >
          {{ $t('editor.general.noise_fbm_amplitude') }}
        </ParameterSlider>
        <ParameterSlider
          id="ct-dlac"
          v-model="EDITOR_STATE.planetData.cratersDetailNoise.lacunarity"
          :step="0.01"
          :min="1"
          :max="3"
        >
          {{ $t('editor.general.noise_fbm_lacunarity') }}
        </ParameterSlider>
        <ParameterSlider
          id="ct-doct"
          v-model="EDITOR_STATE.planetData.cratersDetailNoise.octaves"
          :step="1"
          :min="1"
          :max="8"
        >
          {{ $t('editor.general.noise_fbm_octaves') }}
        </ParameterSlider>
      </template>
    </ParameterGroup>
    <ParameterGroup :toggleable="true">
      <template #title>{{ $t('editor.features.craters.curve') }}</template>
      <template #content>
        <ParameterColorRamp
          :key="EDITOR_STATE.planetData.planetName"
          v-model="EDITOR_STATE.planetData.cratersColorRamp"
          mode="opacity"
        >
          {{ $t('editor.general.colorramp_opacity') }}
        </ParameterColorRamp>
      </template>
    </ParameterGroup>
  </ParameterGrid>
</template>

<script setup lang="ts">
import ParameterDivider from '@components/global/parameters/ParameterDivider.vue';
import ParameterGrid from '@components/global/parameters/ParameterGrid.vue';
import ParameterGroup from '@components/global/parameters/ParameterGroup.vue';
import { EDITOR_STATE } from '@core/editor/state/editor.state.ts';
</script>
