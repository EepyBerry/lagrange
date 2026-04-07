<template>
  <ParameterGrid>
    <ParameterGroup
      v-model="EDITOR_STATE.planetData.planetSurfaceShowBumps"
      :toggleable="EDITOR_STATE.planetData.planetSurfaceShowBumps"
    >
      <template #title>{{ $t('editor.controls.surface.bumpmap') }}</template>
      <template #content>
        <ParameterSlider
          id="s-bumpstr"
          v-model="EDITOR_STATE.planetData.planetSurfaceBumpStrength"
          :step="0.0005"
          :min="0.02"
          :max="0.2"
        >
          {{ $t('editor.controls.surface.bumpmap_strength') }}
        </ParameterSlider>
      </template>
    </ParameterGroup>
    <ParameterGroup
      v-model="EDITOR_STATE.planetData.planetSurfaceShowWarping"
      :toggleable="EDITOR_STATE.planetData.planetSurfaceShowWarping"
    >
      <template #title>{{ $t('editor.general.warping') }}</template>
      <template #content>
        <ParameterSlider
          id="s-xwarp"
          v-model="EDITOR_STATE.planetData.planetSurfaceNoise.xWarpFactor"
          :step="0.01"
          :max="8"
        >
          {{ $t('editor.general.warping_x') }}
        </ParameterSlider>
        <ParameterSlider
          id="s-ywarp"
          v-model="EDITOR_STATE.planetData.planetSurfaceNoise.yWarpFactor"
          :step="0.01"
          :max="8"
        >
          {{ $t('editor.general.warping_y') }}
        </ParameterSlider>
        <ParameterSlider
          id="s-zwarp"
          v-model="EDITOR_STATE.planetData.planetSurfaceNoise.zWarpFactor"
          :step="0.01"
          :max="8"
        >
          {{ $t('editor.general.warping_z') }}
        </ParameterSlider>
      </template>
    </ParameterGroup>
    <ParameterGroup
      v-model="EDITOR_STATE.planetData.planetSurfaceShowDisplacement"
      :toggleable="EDITOR_STATE.planetData.planetSurfaceShowDisplacement"
    >
      <template #title>{{ $t('editor.general.displacement') }}</template>
      <template #content>
        <ParameterSlider
          id="s-dfac"
          v-model="EDITOR_STATE.planetData.planetSurfaceDisplacement.factor"
          :step="0.005"
          :max="0.25"
        >
          {{ $t('editor.general.displacement_factor') }}
        </ParameterSlider>
        <ParameterSlider
          id="s-deps"
          v-model="EDITOR_STATE.planetData.planetSurfaceDisplacement.epsilon"
          :step="0.0005"
          :min="0.0005"
          :max="0.25"
        >
          {{ $t('editor.general.displacement_epsilon') }}
        </ParameterSlider>
        <ParameterSlider
          id="s-dmul"
          v-model="EDITOR_STATE.planetData.planetSurfaceDisplacement.multiplier"
          :step="0.01"
          :min="0.25"
          :max="3"
        >
          {{ $t('editor.general.displacement_multiplier') }}
        </ParameterSlider>
        <ParameterDivider />
        <ParameterSlider
          id="s-dfreq"
          v-model="EDITOR_STATE.planetData.planetSurfaceDisplacement.frequency"
          :step="0.01"
          :max="3"
        >
          {{ $t('editor.general.noise_fbm_frequency') }}
        </ParameterSlider>
        <ParameterSlider
          id="s-damp"
          v-model="EDITOR_STATE.planetData.planetSurfaceDisplacement.amplitude"
          :step="0.01"
          :max="1.25"
        >
          {{ $t('editor.general.noise_fbm_amplitude') }}
        </ParameterSlider>
        <ParameterSlider
          id="s-dlac"
          v-model="EDITOR_STATE.planetData.planetSurfaceDisplacement.lacunarity"
          :step="0.01"
          :min="1"
          :max="3"
        >
          {{ $t('editor.general.noise_fbm_lacunarity') }}
        </ParameterSlider>
        <ParameterSlider
          id="s-doct"
          v-model="EDITOR_STATE.planetData.planetSurfaceDisplacement.octaves"
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
        <ParameterSlider
          id="s-layers"
          v-model="EDITOR_STATE.planetData.planetSurfaceNoise.layers"
          :step="1"
          :min="1"
          :max="3"
        >
          {{ $t('editor.general.noise_layers') }}
        </ParameterSlider>
        <ParameterDivider />
        <ParameterSlider
          id="s-freq"
          v-model="EDITOR_STATE.planetData.planetSurfaceNoise.frequency"
          :step="0.01"
          :max="10"
        >
          {{ $t('editor.general.noise_fbm_frequency') }}
        </ParameterSlider>
        <ParameterSlider
          id="s-amp"
          v-model="EDITOR_STATE.planetData.planetSurfaceNoise.amplitude"
          :step="0.01"
          :max="1.25"
        >
          {{ $t('editor.general.noise_fbm_amplitude') }}
        </ParameterSlider>
        <ParameterSlider
          id="s-lac"
          v-model="EDITOR_STATE.planetData.planetSurfaceNoise.lacunarity"
          :step="0.01"
          :min="1"
          :max="3"
        >
          {{ $t('editor.general.noise_fbm_lacunarity') }}
        </ParameterSlider>
        <ParameterSlider
          id="s-oct"
          v-model="EDITOR_STATE.planetData.planetSurfaceNoise.octaves"
          :step="1"
          :min="1"
          :max="8"
        >
          {{ $t('editor.general.noise_fbm_octaves') }}
        </ParameterSlider>
        <ParameterDivider />
        <!-- prettier-ignore-attribute -->
        <ParameterColorRamp
          :key="EDITOR_STATE.planetData.planetName"
          v-model="EDITOR_STATE.planetData.planetSurfaceColorRamp"
          mode="rgb"
        >
          {{ $t('editor.general.noise_rgbramp') }}
        </ParameterColorRamp>
      </template>
    </ParameterGroup>
  </ParameterGrid>
</template>
<script setup lang="ts">
import { EDITOR_STATE } from '@/core/state/editor.state';
</script>
