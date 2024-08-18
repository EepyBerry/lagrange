<template>
  <ParameterGrid>
    <ParameterCheckbox v-model="LG_PLANET_DATA.biomesEnabled" id="b-biomes" :true-value="true" :false-value="false">
      {{ $t('editor.controls.biomes.biomes_show') }}
    </ParameterCheckbox>
    <template v-if="LG_PLANET_DATA.biomesEnabled">
      <ParameterCategory>{{ $t('editor.controls.biomes.temperature') }}</ParameterCategory>
      <ParameterDivider />
      <ParameterSlider v-model="LG_PLANET_DATA.biomesTemperatureNoise.frequency" id="b-tfreq" :step="0.01" :max="5">
        {{ $t('editor.general.noise_fbm_frequency') }}
      </ParameterSlider>
      <ParameterSlider v-model="LG_PLANET_DATA.biomesTemperatureNoise.amplitude" id="b-tamp" :step="0.01" :min="0" :max="2">
        {{ $t('editor.general.noise_fbm_amplitude') }}
      </ParameterSlider>
      <ParameterSlider v-model="LG_PLANET_DATA.biomesTemperatureNoise.lacunarity" id="b-tlac" :step="0.01" :min="1" :max="3">
        {{ $t('editor.general.noise_fbm_lacunarity') }}
      </ParameterSlider>
      <ParameterSlider v-model="LG_PLANET_DATA.biomesTemperatureNoise.octaves" id="b-tlac" :step="1" :min="1" :max="8">
        {{ $t('editor.general.noise_fbm_octaves') }}
      </ParameterSlider>
      <ParameterCategory>{{ $t('editor.controls.biomes.biome_list') }}</ParameterCategory>
      <template v-for="(_, index) in LG_PLANET_DATA.biomesParams" :key="index">
        <ParameterBiome v-model="LG_PLANET_DATA.biomesParams[index]" />
      </template>
    </template>
  </ParameterGrid>
</template>
<script setup lang="ts">
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import ParameterGrid from '@components/parameters/ParameterGrid.vue'
import ParameterCheckbox from '@components/parameters/ParameterCheckbox.vue'
import ParameterBiome from '../parameters/ParameterBiome.vue';
import ParameterSlider from '../parameters/ParameterSlider.vue';
import ParameterCategory from '../parameters/ParameterCategory.vue';
import ParameterDivider from '../parameters/ParameterDivider.vue';
</script>
