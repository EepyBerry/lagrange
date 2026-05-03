<template>
  <ParameterGrid>
    <ParameterGroup v-model="EDITOR_STATE.planetData.cracksEnabled" :toggleable="EDITOR_STATE.planetData.cracksEnabled">
      <template #title>{{ $t('editor.controls.features.cracks.$title') }}</template>
      <template #content> </template>
    </ParameterGroup>
    <ParameterGroup v-model="EDITOR_STATE.planetData.biomesEnabled" :toggleable="EDITOR_STATE.planetData.biomesEnabled">
      <template #title>{{ $t('editor.controls.features.biomes.$title') }}</template>
      <template #content>
        <ParameterGroup :toggleable="true">
          <template #title>{{ $t('editor.controls.features.biomes.temperature') }}</template>
          <template #content>
            <ParameterRadio>
              <template #title> {{ $t('editor.controls.features.biomes.gradient_mode') }}: </template>
              <template #options>
                <ParameterRadioOption
                  :id="'0'"
                  v-model="EDITOR_STATE.planetData.biomesTemperatureMode"
                  icon="mingcute:photo-album-line"
                  name="temp-mode"
                  :value="GradientMode.REALISTIC"
                  :button-aria-label="$t('editor.controls.features.biomes.gradient_mode_realistic')"
                  :title="$t('tooltip.gradient_mode_realistic')"
                >
                  {{ $t('editor.controls.features.biomes.gradient_mode_realistic') }}
                </ParameterRadioOption>
                <ParameterRadioOption
                  :id="'1'"
                  v-model="EDITOR_STATE.planetData.biomesTemperatureMode"
                  icon="material-symbols:gradient-outline"
                  name="temp-mode"
                  :value="GradientMode.POLE_TO_POLE"
                  :button-aria-label="$t('editor.controls.features.biomes.gradient_mode_poletopole')"
                  :title="$t('tooltip.gradient_mode_poletopole')"
                >
                  {{ $t('editor.controls.features.biomes.gradient_mode_poletopole') }}
                </ParameterRadioOption>
                <ParameterRadioOption
                  :id="'2'"
                  v-model="EDITOR_STATE.planetData.biomesTemperatureMode"
                  icon="tabler:ease-in-out-control-points"
                  name="temp-mode"
                  :value="GradientMode.FULLNOISE"
                  :button-aria-label="$t('editor.controls.features.biomes.gradient_mode_fullnoise')"
                  :title="$t('tooltip.gradient_mode_fullnoise')"
                >
                  {{ $t('editor.controls.features.biomes.gradient_mode_fullnoise') }}
                </ParameterRadioOption>
              </template>
            </ParameterRadio>
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
          <template #title>{{ $t('editor.controls.features.biomes.humidity') }}</template>
          <template #content>
            <ParameterRadio>
              <template #title> {{ $t('editor.controls.features.biomes.gradient_mode') }}: </template>
              <template #options>
                <ParameterRadioOption
                  :id="'0'"
                  v-model="EDITOR_STATE.planetData.biomesHumidityMode"
                  icon="mingcute:photo-album-line"
                  name="humi-mode"
                  :value="GradientMode.REALISTIC"
                  :button-aria-label="$t('editor.controls.features.biomes.gradient_mode_realistic')"
                  :title="$t('tooltip.gradient_mode_realistic')"
                >
                  {{ $t('editor.controls.features.biomes.gradient_mode_realistic') }}
                </ParameterRadioOption>
                <ParameterRadioOption
                  :id="'1'"
                  v-model="EDITOR_STATE.planetData.biomesHumidityMode"
                  icon="material-symbols:gradient-outline"
                  name="humi-mode"
                  :value="GradientMode.POLE_TO_POLE"
                  :button-aria-label="$t('editor.controls.features.biomes.gradient_mode_poletopole')"
                  :title="$t('tooltip.gradient_mode_poletopole')"
                >
                  {{ $t('editor.controls.features.biomes.gradient_mode_poletopole') }}
                </ParameterRadioOption>
                <ParameterRadioOption
                  :id="'2'"
                  v-model="EDITOR_STATE.planetData.biomesHumidityMode"
                  icon="tabler:ease-in-out-control-points"
                  name="humi-mode"
                  :value="GradientMode.FULLNOISE"
                  :button-aria-label="$t('editor.controls.features.biomes.gradient_mode_fullnoise')"
                  :title="$t('tooltip.gradient_mode_fullnoise')"
                >
                  {{ $t('editor.controls.features.biomes.gradient_mode_fullnoise') }}
                </ParameterRadioOption>
              </template>
            </ParameterRadio>
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
        <ParameterGroup :toggleable="true">
          <template #title>{{ $t('editor.controls.features.biomes.biome_list') }}</template>
          <template #content>
            <template v-for="(b, index) in EDITOR_STATE.planetData.biomesParams" :key="b.id">
              <!-- prettier-ignore-attribute -->
              <ParameterBiome
                v-model="EDITOR_STATE.planetData.biomesParams[index]"
                :index="index"
                :max-index="EDITOR_STATE.planetData.biomesParams.length - 1"
                @moveup="EDITOR_STATE.planetData.moveBiome(b.id, -1)"
                @movedown="EDITOR_STATE.planetData.moveBiome(b.id, 1)"
                @delete="EDITOR_STATE.planetData.removeBiome(b.id)"
              />
            </template>
            <LgvButton
              v-show="EDITOR_STATE.planetData.biomesParams.length < 16"
              class="sm action-add"
              icon="mingcute:add-line"
              @click="EDITOR_STATE.planetData.addBiome()"
            >
              {{ $t('editor.$action_add') }}
            </LgvButton>
          </template>
        </ParameterGroup>
      </template>
    </ParameterGroup>
  </ParameterGrid>
</template>
<script setup lang="ts">
import ParameterBiome from '@components/global/parameters/ParameterBiome.vue';
import ParameterGroup from '@components/global/parameters/ParameterGroup.vue';
import { GradientMode } from '@core/types';
import LgvButton from '@/_lib/components/LgvButton.vue';
import { EDITOR_STATE } from '@/core/state/editor.state';
</script>
<style scoped lang="scss">
.action-add {
  grid-column: span 2;
}
</style>
