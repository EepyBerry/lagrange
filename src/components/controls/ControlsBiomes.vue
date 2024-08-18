<template>
  <ParameterTable>
    <ParameterCheckbox v-model="LG_PLANET_DATA.biomesEnabled" id="b-biomes" :true-value="true" :false-value="false">
      {{ $t('editor.controls.biomes.biomes_show') }}
    </ParameterCheckbox>
    <template v-if="LG_PLANET_DATA.biomesEnabled">
      <ParameterCategory>{{ $t('editor.controls.biomes.temperature') }}</ParameterCategory>
      <ParameterSlider v-model="LG_PLANET_DATA.biomesTemperatureResolution" id="b-tres" :step="64" :min="64" :max="1024">
        {{ $t('editor.controls.biomes.texture_resolution') }}
      </ParameterSlider>
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
      <ParameterCategory>{{ $t('editor.controls.biomes.humidity') }}</ParameterCategory>
      <ParameterCategory>{{ $t('editor.controls.biomes.biome_list') }}</ParameterCategory>
      <ParameterBiome />
    </template>
  </ParameterTable>
</template>
<script setup lang="ts">
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import ParameterTable from '@components/parameters/ParameterTable.vue'
import ParameterCheckbox from '@components/parameters/ParameterCheckbox.vue'
import ParameterBiome from '../parameters/ParameterBiome.vue';
import ParameterSlider from '../parameters/ParameterSlider.vue';
import ParameterCategory from '../parameters/ParameterCategory.vue';
import ParameterDivider from '../parameters/ParameterDivider.vue';
</script>
