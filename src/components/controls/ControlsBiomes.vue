<template>
  <ParameterGrid>
    <ParameterCheckbox v-model="LG_PLANET_DATA.biomesEnabled" id="b-biomes" :true-value="true" :false-value="false">
      {{ $t('editor.controls.biomes.biomes_show') }}
    </ParameterCheckbox>
    <template v-if="LG_PLANET_DATA.biomesEnabled">
      <ParameterCategory>{{ $t('editor.controls.biomes.temperature') }}</ParameterCategory>
      <ParameterRadio>
        <template v-slot:title> {{ $t('editor.controls.biomes.gradient_mode') }}: </template>
        <template v-slot:options>
          <ParameterRadioOption
            v-model="LG_PLANET_DATA.biomesTemperatureMode"
            icon="mingcute:photo-album-line"
            name="temp-mode"
            :id="'0'"
            :value="GradientMode.REALISTIC"
            :ariaLabel="$t('a11y.editor_biome_gradient_mode_realistic')"
          >
            {{ $t('editor.controls.biomes.gradient_mode_realistic') }}
          </ParameterRadioOption>
          <ParameterRadioOption
            v-model="LG_PLANET_DATA.biomesTemperatureMode"
            icon="tabler:ease-in-out-control-points"
            name="temp-mode"
            :id="'1'"
            :value="GradientMode.FULLNOISE"
            :ariaLabel="$t('a11y.editor_biome_gradient_mode_fullnoise')"
          >
            {{ $t('editor.controls.biomes.gradient_mode_fullnoise') }}
          </ParameterRadioOption>
        </template>
      </ParameterRadio>
      <ParameterSlider v-model="LG_PLANET_DATA.biomesTemperatureNoise.frequency" id="b-tfreq" :step="0.01" :max="5">
        {{ $t('editor.general.noise_fbm_frequency') }}
      </ParameterSlider>
      <ParameterSlider v-model="LG_PLANET_DATA.biomesTemperatureNoise.amplitude" id="b-tamp" :step="0.01" :min="0" :max="2">
        {{ $t('editor.general.noise_fbm_amplitude') }}
      </ParameterSlider>
      <ParameterSlider v-model="LG_PLANET_DATA.biomesTemperatureNoise.lacunarity" id="b-tlac" :step="0.01" :min="1" :max="3">
        {{ $t('editor.general.noise_fbm_lacunarity') }}
      </ParameterSlider>
      <ParameterSlider v-model="LG_PLANET_DATA.biomesTemperatureNoise.octaves" id="b-toct" :step="1" :min="1" :max="8">
        {{ $t('editor.general.noise_fbm_octaves') }}
      </ParameterSlider>
      <ParameterCategory>{{ $t('editor.controls.biomes.biome_list') }}</ParameterCategory>
      <template v-for="(_, index) in LG_PLANET_DATA.biomesParams" :key="index">
        <ParameterBiome v-model="(LG_PLANET_DATA.biomesParams[index] as BiomeParameters)" @delete="deleteBiome" />
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
import ParameterBiome from '../parameters/ParameterBiome.vue';
import ParameterSlider from '../parameters/ParameterSlider.vue';
import ParameterCategory from '../parameters/ParameterCategory.vue';
import { GradientMode } from '@/core/types';
import { BiomeParameters } from '@/core/models/biome-parameters.model';
import { ColorRamp, ColorRampStep } from '@/core/models/color-ramp.model';

function addBiome() {
  const newBiome = new BiomeParameters(
    LG_PLANET_DATA.value.changedProps,
    '_biomesParameters',
    0.0, 1.0,
    0.0, 1.0,
    new ColorRamp(LG_PLANET_DATA.value.changedProps, '_biomesParameters', [
      ColorRampStep.newWithAlpha(0xffffff, 1.0,  0.0, true),
      ColorRampStep.newWithAlpha(0xffffff, 0.5,  0.5),
      ColorRampStep.newWithAlpha(0xffffff, 0.0,  1.0, true),
    ])
  )
  LG_PLANET_DATA.value.biomesParams.push(newBiome)
  LG_PLANET_DATA.value.markForChange('_biomesParameters')
}

function deleteBiome(id: string) {
  const biomeIdx = LG_PLANET_DATA.value.biomesParams.findIndex(b => b.id === id)
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