<template>
  <ParameterGrid>
    <ParameterCheckbox
      id="c-toggle"
      v-model="EDITOR_STATE.planetData.cloudsEnabled"
      :true-value="true"
      :false-value="false"
    >
      {{ $t('editor.controls.clouds.clouds_show') }}
    </ParameterCheckbox>
    <template v-if="EDITOR_STATE.planetData.cloudsEnabled">
      <ParameterGroup :toggleable="true">
        <template #title>{{ $t('editor.controls.clouds.transform') }}</template>
        <template #content>
          <ParameterSlider id="c-rot" v-model="EDITOR_STATE.planetData.cloudsRotation" :step="1" :min="0" :max="360">
            {{ $t('editor.controls.clouds.transform_rotation') }} <sup>(°)</sup>
          </ParameterSlider>
        </template>
      </ParameterGroup>
      <ParameterGroup
        v-model="EDITOR_STATE.planetData.cloudsShowWarping"
        :toggleable="EDITOR_STATE.planetData.cloudsShowWarping"
      >
        <template #title>{{ $t('editor.general.warping') }}</template>
        <template #content>
          <ParameterSlider id="c-xwarp" v-model="EDITOR_STATE.planetData.cloudsNoise.xWarpFactor" :step="0.01" :max="8">
            {{ $t('editor.general.warping_x') }}
          </ParameterSlider>
          <ParameterSlider id="c-ywarp" v-model="EDITOR_STATE.planetData.cloudsNoise.yWarpFactor" :step="0.01" :max="8">
            {{ $t('editor.general.warping_y') }}
          </ParameterSlider>
          <ParameterSlider id="c-zwarp" v-model="EDITOR_STATE.planetData.cloudsNoise.zWarpFactor" :step="0.01" :max="8">
            {{ $t('editor.general.warping_z') }}
          </ParameterSlider>
        </template>
      </ParameterGroup>
      <ParameterGroup
        v-model="EDITOR_STATE.planetData.cloudsShowDisplacement"
        :toggleable="EDITOR_STATE.planetData.cloudsShowDisplacement"
      >
        <template #title>{{ $t('editor.general.displacement') }}</template>
        <template #content>
          <ParameterSlider
            id="s-dfac"
            v-model="EDITOR_STATE.planetData.cloudsDisplacement.factor"
            :step="0.005"
            :max="0.25"
          >
            {{ $t('editor.general.displacement_factor') }}
          </ParameterSlider>
          <ParameterSlider
            id="s-deps"
            v-model="EDITOR_STATE.planetData.cloudsDisplacement.epsilon"
            :step="0.0005"
            :min="0.0005"
            :max="0.25"
          >
            {{ $t('editor.general.displacement_epsilon') }}
          </ParameterSlider>
          <ParameterSlider
            id="s-dmul"
            v-model="EDITOR_STATE.planetData.cloudsDisplacement.multiplier"
            :step="0.01"
            :min="0.25"
            :max="3"
          >
            {{ $t('editor.general.displacement_multiplier') }}
          </ParameterSlider>
          <ParameterDivider />
          <ParameterSlider
            id="s-dfreq"
            v-model="EDITOR_STATE.planetData.cloudsDisplacement.frequency"
            :step="0.01"
            :max="3"
          >
            {{ $t('editor.general.noise_fbm_frequency') }}
          </ParameterSlider>
          <ParameterSlider
            id="s-damp"
            v-model="EDITOR_STATE.planetData.cloudsDisplacement.amplitude"
            :step="0.01"
            :max="1.25"
          >
            {{ $t('editor.general.noise_fbm_amplitude') }}
          </ParameterSlider>
          <ParameterSlider
            id="s-dlac"
            v-model="EDITOR_STATE.planetData.cloudsDisplacement.lacunarity"
            :step="0.01"
            :min="1"
            :max="3"
          >
            {{ $t('editor.general.noise_fbm_lacunarity') }}
          </ParameterSlider>
          <ParameterSlider
            id="s-doct"
            v-model="EDITOR_STATE.planetData.cloudsDisplacement.octaves"
            :step="1"
            :min="1"
            :max="8"
          >
            {{ $t('editor.general.noise_fbm_octaves') }}
          </ParameterSlider>
        </template>
      </ParameterGroup>
      <ParameterGroup :toggleable="true">
        <template #title>{{ $t('editor.general.noise') }}</template>
        <template #content>
          <ParameterSlider id="c-freq" v-model="EDITOR_STATE.planetData.cloudsNoise.frequency" :step="0.01" :max="5">
            {{ $t('editor.general.noise_fbm_frequency') }}
          </ParameterSlider>
          <ParameterSlider
            id="c-amp"
            v-model="EDITOR_STATE.planetData.cloudsNoise.amplitude"
            :step="0.01"
            :min="0"
            :max="1.25"
          >
            {{ $t('editor.general.noise_fbm_amplitude') }}
          </ParameterSlider>
          <ParameterSlider
            id="c-lac"
            v-model="EDITOR_STATE.planetData.cloudsNoise.lacunarity"
            :step="0.01"
            :min="1"
            :max="3"
          >
            {{ $t('editor.general.noise_fbm_lacunarity') }}
          </ParameterSlider>
          <ParameterSlider id="c-oct" v-model="EDITOR_STATE.planetData.cloudsNoise.octaves" :step="1" :min="1" :max="8">
            {{ $t('editor.general.noise_fbm_octaves') }}
          </ParameterSlider>
        </template>
      </ParameterGroup>
      <ParameterGroup :toggleable="true">
        <template #title>{{ $t('editor.controls.clouds.rgba') }}</template>
        <template #content>
          <ParameterColor v-model="EDITOR_STATE.planetData.cloudsColor">
            {{ $t('editor.general.noise_color') }}
          </ParameterColor>
          <!-- prettier-ignore-attribute -->
          <ParameterColorRamp
            :key="EDITOR_STATE.planetData.planetName"
            v-model="EDITOR_STATE.planetData.cloudsColorRamp"
            mode="opacity"
          >
            {{ $t('editor.controls.clouds.rgba_opacityramp') }}
          </ParameterColorRamp>
        </template>
      </ParameterGroup>
    </template>
  </ParameterGrid>
</template>
<script setup lang="ts">
import { EDITOR_STATE } from '@/core/state/editor.state';
</script>
