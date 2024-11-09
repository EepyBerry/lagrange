<template>
  <ParameterGrid>
    <ParameterCheckbox v-model="LG_PLANET_DATA.biomesEnabled" id="b-biomes" :true-value="true" :false-value="false">
      {{ $t('editor.controls.biomes.biomes_show') }}
    </ParameterCheckbox>
    <template v-if="LG_PLANET_DATA.biomesEnabled">
      <button class="lg debug" style="padding: 0 0.5rem" @click="DebugUtils.getRawBiomeData">
        <iconify-icon icon="material-symbols:code-rounded" aria-hidden="true" />
        get tex
      </button>

      <ParameterCategory>{{ $t('editor.controls.biomes.temperature') }}</ParameterCategory>
      <ParameterRadio>
        <template v-slot:title> {{ $t('editor.controls.biomes.gradient_mode') }}: </template>
        <template v-slot:options>
          <ParameterRadioOption v-model="LG_PLANET_DATA.biomesTemperatureMode" icon="mingcute:photo-album-line"
            name="temp-mode" :id="'0'" :value="GradientMode.REALISTIC"
            :ariaLabel="$t('editor.controls.biomes.gradient_mode_realistic')"
            :title="$t('tooltip.gradient_mode_realistic')">
            {{ $t('editor.controls.biomes.gradient_mode_realistic') }}
          </ParameterRadioOption>
          <ParameterRadioOption v-model="LG_PLANET_DATA.biomesTemperatureMode" icon="material-symbols:gradient-outline"
            name="temp-mode" :id="'1'" :value="GradientMode.POLE_TO_POLE"
            :ariaLabel="$t('editor.controls.biomes.gradient_mode_poletopole')"
            :title="$t('tooltip.gradient_mode_poletopole')">
            {{ $t('editor.controls.biomes.gradient_mode_poletopole') }}
          </ParameterRadioOption>
          <ParameterRadioOption v-model="LG_PLANET_DATA.biomesTemperatureMode" icon="tabler:ease-in-out-control-points"
            name="temp-mode" :id="'2'" :value="GradientMode.FULLNOISE"
            :ariaLabel="$t('editor.controls.biomes.gradient_mode_fullnoise')"
            :title="$t('tooltip.gradient_mode_fullnoise')">
            {{ $t('editor.controls.biomes.gradient_mode_fullnoise') }}
          </ParameterRadioOption>
        </template>
      </ParameterRadio>
      <ParameterSlider v-model="LG_PLANET_DATA.biomesTemperatureNoise.frequency" id="b-tfreq" :step="0.01" :max="5">
        {{ $t('editor.general.noise_fbm_frequency') }}
      </ParameterSlider>
      <ParameterSlider v-model="LG_PLANET_DATA.biomesTemperatureNoise.amplitude" id="b-tamp" :step="0.01" :min="0"
        :max="2">
        {{ $t('editor.general.noise_fbm_amplitude') }}
      </ParameterSlider>
      <ParameterSlider v-model="LG_PLANET_DATA.biomesTemperatureNoise.lacunarity" id="b-tlac" :step="0.01" :min="1"
        :max="3">
        {{ $t('editor.general.noise_fbm_lacunarity') }}
      </ParameterSlider>
      <ParameterSlider v-model="LG_PLANET_DATA.biomesTemperatureNoise.octaves" id="b-toct" :step="1" :min="1" :max="8">
        {{ $t('editor.general.noise_fbm_octaves') }}
      </ParameterSlider>

      <ParameterCategory>{{ $t('editor.controls.biomes.humidity') }}</ParameterCategory>
      <ParameterRadio>
        <template v-slot:title> {{ $t('editor.controls.biomes.gradient_mode') }}: </template>
        <template v-slot:options>
          <ParameterRadioOption v-model="LG_PLANET_DATA.biomesHumidityMode" icon="mingcute:photo-album-line"
            name="temp-mode" :id="'0'" :value="GradientMode.REALISTIC"
            :ariaLabel="$t('editor.controls.biomes.gradient_mode_realistic')"
            :title="$t('tooltip.gradient_mode_realistic')">
            {{ $t('editor.controls.biomes.gradient_mode_realistic') }}
          </ParameterRadioOption>
          <ParameterRadioOption v-model="LG_PLANET_DATA.biomesHumidityMode" icon="material-symbols:gradient-outline"
            name="temp-mode" :id="'1'" :value="GradientMode.POLE_TO_POLE"
            :ariaLabel="$t('editor.controls.biomes.gradient_mode_poletopole')"
            :title="$t('tooltip.gradient_mode_poletopole')">
            {{ $t('editor.controls.biomes.gradient_mode_poletopole') }}
          </ParameterRadioOption>
          <ParameterRadioOption v-model="LG_PLANET_DATA.biomesHumidityMode" icon="tabler:ease-in-out-control-points"
            name="temp-mode" :id="'2'" :value="GradientMode.FULLNOISE"
            :ariaLabel="$t('editor.controls.biomes.gradient_mode_fullnoise')"
            :title="$t('tooltip.gradient_mode_fullnoise')">
            {{ $t('editor.controls.biomes.gradient_mode_fullnoise') }}
          </ParameterRadioOption>
        </template>
      </ParameterRadio>
      <ParameterSlider v-model="LG_PLANET_DATA.biomesHumidityNoise.frequency" id="b-tfreq" :step="0.01" :max="5">
        {{ $t('editor.general.noise_fbm_frequency') }}
      </ParameterSlider>
      <ParameterSlider v-model="LG_PLANET_DATA.biomesHumidityNoise.amplitude" id="b-tamp" :step="0.01" :min="0"
        :max="2">
        {{ $t('editor.general.noise_fbm_amplitude') }}
      </ParameterSlider>
      <ParameterSlider v-model="LG_PLANET_DATA.biomesHumidityNoise.lacunarity" id="b-tlac" :step="0.01" :min="1"
        :max="3">
        {{ $t('editor.general.noise_fbm_lacunarity') }}
      </ParameterSlider>
      <ParameterSlider v-model="LG_PLANET_DATA.biomesHumidityNoise.octaves" id="b-toct" :step="1" :min="1" :max="8">
        {{ $t('editor.general.noise_fbm_octaves') }}
      </ParameterSlider>

      <ParameterCategory>{{ $t('editor.controls.biomes.biome_list') }}</ParameterCategory>
      <template v-for="(b, index) in LG_PLANET_DATA.biomesParams" :key="b.id">
        <!-- prettier-ignore-attribute -->
        <ParameterBiome :index="index" :max-index="LG_PLANET_DATA.biomesParams.length - 1"
          v-model="(LG_PLANET_DATA.biomesParams[index] as BiomeParameters)" @moveup="moveBiome(index, -1)"
          @movedown="moveBiome(index, 1)" @delete="deleteBiome" />
      </template>
      <button class="lg action-add" @click="addBiome">
        <iconify-icon class="icon" icon="mingcute:add-line" width="1.25rem" aria-hidden="true" />
        {{ $t('editor.$action_add') }}
      </button>
    </template>
  </ParameterGrid>
</template>
<script setup lang="ts">
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import ParameterGrid from '@components/parameters/ParameterGrid.vue'
import ParameterCheckbox from '@components/parameters/ParameterCheckbox.vue'
import ParameterBiome from '../parameters/ParameterBiome.vue'
import ParameterSlider from '../parameters/ParameterSlider.vue'
import ParameterCategory from '../parameters/ParameterCategory.vue'
import { GradientMode } from '@/core/types'
import { BiomeParameters } from '@/core/models/biome-parameters.model'
import { Color } from 'three'
import { DebugUtils } from '@/utils/debug-utils'

function moveBiome(idx: number, diff: 1 | -1) {
  var element = LG_PLANET_DATA.value.biomesParams[idx]
  LG_PLANET_DATA.value.biomesParams.splice(idx, 1)
  LG_PLANET_DATA.value.biomesParams.splice(idx + diff, 0, element)
  LG_PLANET_DATA.value.markForChange('_biomesParameters')
}

function addBiome() {
  const newBiome = new BiomeParameters(
    LG_PLANET_DATA.value.changedProps,
    '_biomesParameters',
    {
      temperatureMin: 0.0,
      temperatureMax: 1.0,
      humidityMin: 0.0,
      humidityMax: 1.0,
    },
    new Color(0xffffff),
    0.2,
  )
  LG_PLANET_DATA.value.biomesParams.push(newBiome)
  LG_PLANET_DATA.value.markForChange('_biomesParameters')
}

function deleteBiome(id: string) {
  const biomeIdx = LG_PLANET_DATA.value.biomesParams.findIndex((b) => b.id === id)
  if (biomeIdx < 0) {
    throw new Error('Cannot delete non-existent biome!')
  }
  LG_PLANET_DATA.value.biomesParams.splice(biomeIdx, 1)
  LG_PLANET_DATA.value.markForChange('_biomesParameters')
}
</script>
<style scoped lang="scss">
.action-add {
  grid-column: span 2;
}
</style>
