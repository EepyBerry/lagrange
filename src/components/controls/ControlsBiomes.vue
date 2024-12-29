<template>
  <ParameterGrid>
    <ParameterCheckbox id="b-biomes" v-model="LG_PLANET_DATA.biomesEnabled" :true-value="true" :false-value="false">
      {{ $t('editor.controls.biomes.biomes_show') }}
    </ParameterCheckbox>
    <template v-if="LG_PLANET_DATA.biomesEnabled">
      <ParameterGroup :toggleable="true">
        <template #title>{{ $t('editor.controls.biomes.temperature') }}</template>
        <template #content>
          <ParameterRadio>
            <template #title> {{ $t('editor.controls.biomes.gradient_mode') }}: </template>
            <template #options>
              <ParameterRadioOption
                :id="'0'"
                v-model="LG_PLANET_DATA.biomesTemperatureMode"
                icon="mingcute:photo-album-line"
                name="temp-mode"
                :value="GradientMode.REALISTIC"
                :button-aria-label="$t('editor.controls.biomes.gradient_mode_realistic')"
                :title="$t('tooltip.gradient_mode_realistic')"
              >
                {{ $t('editor.controls.biomes.gradient_mode_realistic') }}
              </ParameterRadioOption>
              <ParameterRadioOption
                :id="'1'"
                v-model="LG_PLANET_DATA.biomesTemperatureMode"
                icon="material-symbols:gradient-outline"
                name="temp-mode"
                :value="GradientMode.POLE_TO_POLE"
                :button-aria-label="$t('editor.controls.biomes.gradient_mode_poletopole')"
                :title="$t('tooltip.gradient_mode_poletopole')"
              >
                {{ $t('editor.controls.biomes.gradient_mode_poletopole') }}
              </ParameterRadioOption>
              <ParameterRadioOption
                :id="'2'"
                v-model="LG_PLANET_DATA.biomesTemperatureMode"
                icon="tabler:ease-in-out-control-points"
                name="temp-mode"
                :value="GradientMode.FULLNOISE"
                :button-aria-label="$t('editor.controls.biomes.gradient_mode_fullnoise')"
                :title="$t('tooltip.gradient_mode_fullnoise')"
              >
                {{ $t('editor.controls.biomes.gradient_mode_fullnoise') }}
              </ParameterRadioOption>
            </template>
          </ParameterRadio>
          <ParameterSlider id="b-tfreq" v-model="LG_PLANET_DATA.biomesTemperatureNoise.frequency" :step="0.01" :max="5">
            {{ $t('editor.general.noise_fbm_frequency') }}
          </ParameterSlider>
          <ParameterSlider
            id="b-tamp"
            v-model="LG_PLANET_DATA.biomesTemperatureNoise.amplitude"
            :step="0.01"
            :min="0"
            :max="2"
          >
            {{ $t('editor.general.noise_fbm_amplitude') }}
          </ParameterSlider>
          <ParameterSlider
            id="b-tlac"
            v-model="LG_PLANET_DATA.biomesTemperatureNoise.lacunarity"
            :step="0.01"
            :min="1"
            :max="3"
          >
            {{ $t('editor.general.noise_fbm_lacunarity') }}
          </ParameterSlider>
          <ParameterSlider id="b-toct" v-model="LG_PLANET_DATA.biomesTemperatureNoise.octaves" :step="1" :min="1" :max="8">
            {{ $t('editor.general.noise_fbm_octaves') }}
          </ParameterSlider>
        </template>
      </ParameterGroup>
      <ParameterGroup :toggleable="true">
        <template #title>{{ $t('editor.controls.biomes.humidity') }}</template>
        <template #content>
          <ParameterRadio>
            <template #title> {{ $t('editor.controls.biomes.gradient_mode') }}: </template>
            <template #options>
              <ParameterRadioOption
                :id="'0'"
                v-model="LG_PLANET_DATA.biomesHumidityMode"
                icon="mingcute:photo-album-line"
                name="temp-mode"
                :value="GradientMode.REALISTIC"
                :button-aria-label="$t('editor.controls.biomes.gradient_mode_realistic')"
                :title="$t('tooltip.gradient_mode_realistic')"
              >
                {{ $t('editor.controls.biomes.gradient_mode_realistic') }}
              </ParameterRadioOption>
              <ParameterRadioOption
                :id="'1'"
                v-model="LG_PLANET_DATA.biomesHumidityMode"
                icon="material-symbols:gradient-outline"
                name="temp-mode"
                :value="GradientMode.POLE_TO_POLE"
                :button-aria-label="$t('editor.controls.biomes.gradient_mode_poletopole')"
                :title="$t('tooltip.gradient_mode_poletopole')"
              >
                {{ $t('editor.controls.biomes.gradient_mode_poletopole') }}
              </ParameterRadioOption>
              <ParameterRadioOption
                :id="'2'"
                v-model="LG_PLANET_DATA.biomesHumidityMode"
                icon="tabler:ease-in-out-control-points"
                name="temp-mode"
                :value="GradientMode.FULLNOISE"
                :button-aria-label="$t('editor.controls.biomes.gradient_mode_fullnoise')"
                :title="$t('tooltip.gradient_mode_fullnoise')"
              >
                {{ $t('editor.controls.biomes.gradient_mode_fullnoise') }}
              </ParameterRadioOption>
            </template>
          </ParameterRadio>
          <ParameterSlider id="b-tfreq" v-model="LG_PLANET_DATA.biomesHumidityNoise.frequency" :step="0.01" :max="5">
            {{ $t('editor.general.noise_fbm_frequency') }}
          </ParameterSlider>
          <ParameterSlider
            id="b-tamp"
            v-model="LG_PLANET_DATA.biomesHumidityNoise.amplitude"
            :step="0.01"
            :min="0"
            :max="2"
          >
            {{ $t('editor.general.noise_fbm_amplitude') }}
          </ParameterSlider>
          <ParameterSlider
            id="b-tlac"
            v-model="LG_PLANET_DATA.biomesHumidityNoise.lacunarity"
            :step="0.01"
            :min="1"
            :max="3"
          >
            {{ $t('editor.general.noise_fbm_lacunarity') }}
          </ParameterSlider>
          <ParameterSlider id="b-toct" v-model="LG_PLANET_DATA.biomesHumidityNoise.octaves" :step="1" :min="1" :max="8">
            {{ $t('editor.general.noise_fbm_octaves') }}
          </ParameterSlider>
        </template>
      </ParameterGroup>
      <ParameterGroup :toggleable="true">
        <template #title>{{ $t('editor.controls.biomes.biome_list') }}</template>
        <template #content>
          <template v-for="(b, index) in LG_PLANET_DATA.biomesParams" :key="b.id">
            <!-- prettier-ignore-attribute -->
            <ParameterBiome
              v-model="(LG_PLANET_DATA.biomesParams[index] as BiomeParameters)"
              :index="index"
              :max-index="LG_PLANET_DATA.biomesParams.length - 1"
              @moveup="moveBiome(index, -1)"
              @movedown="moveBiome(index, 1)"
              @delete="deleteBiome"
            />
          </template>
          <button class="lg action-add" @click="addBiome">
            <iconify-icon class="icon" icon="mingcute:add-line" width="1.25rem" aria-hidden="true" />
            {{ $t('editor.$action_add') }}
          </button>
        </template>
      </ParameterGroup>
    </template>
  </ParameterGrid>
</template>
<script setup lang="ts">
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import ParameterBiome from '../parameters/ParameterBiome.vue'
import { GradientMode } from '@/core/types'
import { BiomeParameters } from '@/core/models/biome-parameters.model'
import { Color } from 'three'

function moveBiome(idx: number, diff: 1 | -1) {
  const element = LG_PLANET_DATA.value.biomesParams[idx]
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
