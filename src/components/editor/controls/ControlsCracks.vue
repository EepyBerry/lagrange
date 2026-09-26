<template>
  <ParameterGrid>
    <ParameterGroup :toggleable="true">
      <template #title>{{ $t('editor.general.noise_base_detail') }}</template>
      <template #content>
        <ParameterSlider
          id="cr-distedge"
          v-model="EDITOR_STATE.planetData.cracksDistanceToEdge"
          :step="0.001"
          :max="0.02"
        >
          {{ $t('editor.features.cracks.distance_to_edge') }}
        </ParameterSlider>
        <ParameterSlider id="cr-bscale" v-model="EDITOR_STATE.planetData.cracksBaseNoise.scale" :step="0.01" :max="5">
          {{ $t('editor.general.noise_voronoi_scale') }}
        </ParameterSlider>
        <ParameterSlider
          id="cr-bjitt"
          v-model="EDITOR_STATE.planetData.cracksBaseNoise.jitter"
          :step="0.01"
          :min="0"
          :max="1"
        >
          {{ $t('editor.general.noise_voronoi_jitter') }}
        </ParameterSlider>
        <ParameterDivider bordered />
        <ParameterSlider
          id="cr-dfreq"
          v-model="EDITOR_STATE.planetData.cracksDetailNoiseStrength"
          :step="0.01"
          :max="1"
        >
          {{ $t('editor.general.detail_noise_strength') }}
        </ParameterSlider>
        <ParameterDivider />
        <ParameterSlider
          id="cr-dfreq"
          v-model="EDITOR_STATE.planetData.cracksDetailNoise.frequency"
          :step="0.01"
          :max="5"
        >
          {{ $t('editor.general.noise_fbm_frequency') }}
        </ParameterSlider>
        <ParameterSlider
          id="cr-damp"
          v-model="EDITOR_STATE.planetData.cracksDetailNoise.amplitude"
          :step="0.01"
          :min="0"
          :max="2"
        >
          {{ $t('editor.general.noise_fbm_amplitude') }}
        </ParameterSlider>
        <ParameterSlider
          id="cr-dlac"
          v-model="EDITOR_STATE.planetData.cracksDetailNoise.lacunarity"
          :step="0.01"
          :min="1"
          :max="3"
        >
          {{ $t('editor.general.noise_fbm_lacunarity') }}
        </ParameterSlider>
        <ParameterSlider
          id="cr-doct"
          v-model="EDITOR_STATE.planetData.cracksDetailNoise.octaves"
          :step="1"
          :min="1"
          :max="8"
        >
          {{ $t('editor.general.noise_fbm_octaves') }}
        </ParameterSlider>
      </template>
    </ParameterGroup>
    <ParameterGroup :toggleable="true">
      <template #title>{{ $t('editor.features.cracks.noise_limiter') }}</template>
      <template #content>
        <ParameterSlider
          id="cr-lfreq"
          v-model="EDITOR_STATE.planetData.cracksLimiterNoise.frequency"
          :step="0.01"
          :max="10"
        >
          {{ $t('editor.general.noise_fbm_frequency') }}
        </ParameterSlider>
        <ParameterSlider
          id="cr-lamp"
          v-model="EDITOR_STATE.planetData.cracksLimiterNoise.amplitude"
          :step="0.01"
          :min="0"
          :max="1"
        >
          {{ $t('editor.general.noise_fbm_amplitude') }}
        </ParameterSlider>
        <ParameterSlider
          id="cr-llac"
          v-model="EDITOR_STATE.planetData.cracksLimiterNoise.lacunarity"
          :step="0.01"
          :min="1"
          :max="2"
        >
          {{ $t('editor.general.noise_fbm_lacunarity') }}
        </ParameterSlider>
        <ParameterSlider
          id="cr-loct"
          v-model="EDITOR_STATE.planetData.cracksLimiterNoise.octaves"
          :step="1"
          :min="1"
          :max="4"
        >
          {{ $t('editor.general.noise_fbm_octaves') }}
        </ParameterSlider>
      </template>
    </ParameterGroup>
    <ParameterGroup :toggleable="true">
      <template #title>{{ $t('editor.features.cracks.noise_color') }}</template>
      <template #content>
        <ParameterSlider
          id="cr-cfreq"
          v-model="EDITOR_STATE.planetData.cracksColorNoise.frequency"
          :step="0.01"
          :max="30"
        >
          {{ $t('editor.general.noise_fbm_frequency') }}
        </ParameterSlider>
        <ParameterSlider
          id="cr-camp"
          v-model="EDITOR_STATE.planetData.cracksColorNoise.amplitude"
          :step="0.01"
          :min="0"
          :max="2"
        >
          {{ $t('editor.general.noise_fbm_amplitude') }}
        </ParameterSlider>
        <ParameterSlider
          id="cr-clac"
          v-model="EDITOR_STATE.planetData.cracksColorNoise.lacunarity"
          :step="0.01"
          :min="1"
          :max="3"
        >
          {{ $t('editor.general.noise_fbm_lacunarity') }}
        </ParameterSlider>
        <ParameterSlider
          id="cr-coct"
          v-model="EDITOR_STATE.planetData.cracksColorNoise.octaves"
          :step="1"
          :min="1"
          :max="6"
        >
          {{ $t('editor.general.noise_fbm_octaves') }}
        </ParameterSlider>
        <ParameterDivider />
        <ParameterColorRamp
          :key="EDITOR_STATE.planetData.planetName"
          v-model="EDITOR_STATE.planetData.cracksColorRamp"
          mode="rgb"
        >
          {{ $t('editor.general.colorramp_rgb') }}
        </ParameterColorRamp>
      </template>
    </ParameterGroup>
    <ParameterGroup :toggleable="true">
      <template #title>{{ $t('editor.planet_rendering.emissivity') }}</template>
      <template #content>
        <ParameterSlider
          id="cr-emi"
          v-model="EDITOR_STATE.planetData.cracksEmissiveIntensity"
          :disabled="!EDITOR_STATE.planetData.planetShowEmissive"
          :step="0.01"
          :max="10"
        >
          {{ $t('editor.general.emissive_intensity') }}
        </ParameterSlider>
        <ParameterSlider id="cr-uwstr" v-model="EDITOR_STATE.planetData.cracksUnderwaterStrength" :step="0.01" :max="1">
          {{ $t('editor.features.cracks.underwater_strength') }}
        </ParameterSlider>
      </template>
    </ParameterGroup>
  </ParameterGrid>
</template>

<script setup lang="ts">
import ParameterGrid from '@components/global/parameters/ParameterGrid.vue';
import { EDITOR_STATE } from '@core/editor/state/editor.state.ts';
</script>
