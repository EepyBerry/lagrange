<template>
  <ParameterGrid>
    <ParameterGroup :toggleable="true">
      <template #title>{{ $t('editor.features.biomes.temperature') }}</template>
      <template #content>
        <ParameterSelect id="b-tgrad" v-model="EDITOR_STATE.planetData.biomesTemperatureMode">
          {{ $t('editor.features.biomes.gradient_mode') }}
          <template #options>
            <option :value="GradientMode.REALISTIC">
              {{ $t('editor.features.biomes.gradient_mode_realistic') }}
            </option>
            <option :value="GradientMode.POLE_TO_POLE">
              {{ $t('editor.features.biomes.gradient_mode_poletopole') }}
            </option>
            <option :value="GradientMode.FULLNOISE">
              {{ $t('editor.features.biomes.gradient_mode_fullnoise') }}
            </option>
          </template>
        </ParameterSelect>
        <ParameterSlider
          id="b-tfreq"
          v-model="EDITOR_STATE.planetData.biomesTemperatureNoise.frequency"
          :step="0.01"
          :max="5"
        >
          {{ $t('editor.general.noise_fbm_frequency') }}
        </ParameterSlider>
        <ParameterSlider
          id="b-tamp"
          v-model="EDITOR_STATE.planetData.biomesTemperatureNoise.amplitude"
          :step="0.01"
          :min="0"
          :max="2"
        >
          {{ $t('editor.general.noise_fbm_amplitude') }}
        </ParameterSlider>
        <ParameterSlider
          id="b-tlac"
          v-model="EDITOR_STATE.planetData.biomesTemperatureNoise.lacunarity"
          :step="0.01"
          :min="1"
          :max="3"
        >
          {{ $t('editor.general.noise_fbm_lacunarity') }}
        </ParameterSlider>
        <ParameterSlider
          id="b-toct"
          v-model="EDITOR_STATE.planetData.biomesTemperatureNoise.octaves"
          :step="1"
          :min="1"
          :max="8"
        >
          {{ $t('editor.general.noise_fbm_octaves') }}
        </ParameterSlider>
      </template>
    </ParameterGroup>
    <ParameterGroup :toggleable="true">
      <template #title>{{ $t('editor.features.biomes.humidity') }}</template>
      <template #content>
        <ParameterSelect id="b-hgrad" v-model="EDITOR_STATE.planetData.biomesHumidityMode">
          {{ $t('editor.features.biomes.gradient_mode') }}
          <template #options>
            <option :value="GradientMode.REALISTIC">
              {{ $t('editor.features.biomes.gradient_mode_realistic') }}
            </option>
            <option :value="GradientMode.POLE_TO_POLE">
              {{ $t('editor.features.biomes.gradient_mode_poletopole') }}
            </option>
            <option :value="GradientMode.FULLNOISE">
              {{ $t('editor.features.biomes.gradient_mode_fullnoise') }}
            </option>
          </template>
        </ParameterSelect>
        <ParameterSlider
          id="b-tfreq"
          v-model="EDITOR_STATE.planetData.biomesHumidityNoise.frequency"
          :step="0.01"
          :max="5"
        >
          {{ $t('editor.general.noise_fbm_frequency') }}
        </ParameterSlider>
        <ParameterSlider
          id="b-tamp"
          v-model="EDITOR_STATE.planetData.biomesHumidityNoise.amplitude"
          :step="0.01"
          :min="0"
          :max="2"
        >
          {{ $t('editor.general.noise_fbm_amplitude') }}
        </ParameterSlider>
        <ParameterSlider
          id="b-tlac"
          v-model="EDITOR_STATE.planetData.biomesHumidityNoise.lacunarity"
          :step="0.01"
          :min="1"
          :max="3"
        >
          {{ $t('editor.general.noise_fbm_lacunarity') }}
        </ParameterSlider>
        <ParameterSlider
          id="b-toct"
          v-model="EDITOR_STATE.planetData.biomesHumidityNoise.octaves"
          :step="1"
          :min="1"
          :max="8"
        >
          {{ $t('editor.general.noise_fbm_octaves') }}
        </ParameterSlider>
      </template>
    </ParameterGroup>
    <template v-for="(b, index) in EDITOR_STATE.planetData.biomesParams" :key="b.id">
      <!-- prettier-ignore-attribute -->
      <ParameterBiome
        v-model="EDITOR_STATE.planetData.biomesParams[index]"
        :index="index"
        :max-index="EDITOR_STATE.planetData.biomesParams.length - 1"
        @moveup="EDITOR_STATE.planetData.moveBiomeUp(b)"
        @movedown="EDITOR_STATE.planetData.moveBiomeDown(b)"
        @delete="EDITOR_STATE.planetData.removeBiome(b)"
      />
    </template>
    <LgvButton
      v-show="EDITOR_STATE.planetData.biomesParams.length < 16"
      id="action-add"
      icon="ph:plus"
      @click="EDITOR_STATE.planetData.addBiome()"
    >
      {{ $t('editor.$action_add') }}
    </LgvButton>
  </ParameterGrid>
</template>

<script setup lang="ts">
import ParameterBiome from '@components/global/parameters/ParameterBiome.vue';
import ParameterGrid from '@components/global/parameters/ParameterGrid.vue';
import ParameterGroup from '@components/global/parameters/ParameterGroup.vue';
import ParameterSelect from '@components/global/parameters/ParameterSelect.vue';
import { EDITOR_STATE } from '@core/editor/state/editor.state.ts';
import { GradientMode } from '@core/types.ts';
import LgvButton from '@lib/components/base/LgvButton.vue';
</script>

<style scoped lang="scss">
#action-add {
  grid-column: span 2;
}
</style>
