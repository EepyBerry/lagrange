<template>
  <ParameterGrid>
    <button class="lg debug" style="padding: 0 0.5rem" @click="DebugUtils.getRawSurfaceData">
      <iconify-icon icon="material-symbols:code-rounded" aria-hidden="true" />
      get tex
    </button>
    
    <ParameterGroup v-model="LG_PLANET_DATA.planetSurfaceShowBumps" :toggleable="LG_PLANET_DATA.planetSurfaceShowBumps">
      <template #title>{{ $t('editor.controls.surface.bumpmap') }}</template>
      <template #content>
        <ParameterSlider
          id="s-bumpstr"
          v-model="LG_PLANET_DATA.planetSurfaceBumpStrength"
          :step="0.0005"
          :min="0.02"
          :max="0.2"
        >
          {{ $t('editor.controls.surface.bumpmap_strength') }}
        </ParameterSlider>
      </template>
    </ParameterGroup>
    <ParameterGroup v-model="LG_PLANET_DATA.planetSurfaceShowWarping" :toggleable="LG_PLANET_DATA.planetSurfaceShowWarping">
      <template #title>{{ $t('editor.general.warping') }}</template>
      <template #content>
        <ParameterSlider id="s-xwarp" v-model="LG_PLANET_DATA.planetSurfaceNoise.xWarpFactor" :step="0.01" :max="8">
          {{ $t('editor.general.warping_x') }}
        </ParameterSlider>
        <ParameterSlider id="s-ywarp" v-model="LG_PLANET_DATA.planetSurfaceNoise.yWarpFactor" :step="0.01" :max="8">
          {{ $t('editor.general.warping_y') }}
        </ParameterSlider>
        <ParameterSlider id="s-zwarp" v-model="LG_PLANET_DATA.planetSurfaceNoise.zWarpFactor" :step="0.01" :max="8">
          {{ $t('editor.general.warping_z') }}
        </ParameterSlider>
      </template>
    </ParameterGroup>
    <ParameterGroup v-model="LG_PLANET_DATA.planetSurfaceShowDisplacement" :toggleable="LG_PLANET_DATA.planetSurfaceShowDisplacement">
      <template #title>{{ $t('editor.controls.surface.displacement') }}</template>
      <template #content>
        <ParameterSlider id="s-dfac" v-model="LG_PLANET_DATA.planetSurfaceDisplacement.factor" :step="0.005" :max="0.25">
          {{ $t('editor.general.displacement_factor') }}
        </ParameterSlider>
        <ParameterSlider
          id="s-deps"
          v-model="LG_PLANET_DATA.planetSurfaceDisplacement.epsilon"
          :step="0.0005"
          :max="0.25"
        >
          {{ $t('editor.general.displacement_epsilon') }}
        </ParameterSlider>
        <ParameterSlider id="s-dmul" v-model="LG_PLANET_DATA.planetSurfaceDisplacement.multiplier" :step="0.01" :max="3">
          {{ $t('editor.general.displacement_multiplier') }}
        </ParameterSlider>
        <ParameterDivider />
        <ParameterSlider id="s-dfreq" v-model="LG_PLANET_DATA.planetSurfaceDisplacement.frequency" :step="0.01" :max="3">
          {{ $t('editor.general.noise_fbm_frequency') }}
        </ParameterSlider>
        <ParameterSlider
          id="s-damp"
          v-model="LG_PLANET_DATA.planetSurfaceDisplacement.amplitude"
          :step="0.01"
          :max="1.25"
        >
          {{ $t('editor.general.noise_fbm_amplitude') }}
        </ParameterSlider>
        <ParameterSlider
          id="s-dlac"
          v-model="LG_PLANET_DATA.planetSurfaceDisplacement.lacunarity"
          :step="0.01"
          :min="1"
          :max="3"
        >
          {{ $t('editor.general.noise_fbm_lacunarity') }}
        </ParameterSlider>
        <ParameterSlider
          id="s-doct"
          v-model="LG_PLANET_DATA.planetSurfaceDisplacement.octaves"
          :step="1"
          :min="1"
          :max="8"
        >
          {{ $t('editor.general.noise_fbm_octaves') }}
        </ParameterSlider>
      </template>
    </ParameterGroup>
    <ParameterGroup :toggleable="true">
      <template #title>{{ $t('editor.controls.surface.noise') }}</template>
      <template #content>
        <ParameterSlider id="s-layers" v-model="LG_PLANET_DATA.planetSurfaceNoise.layers" :step="1" :min="1" :max="3">
          {{ $t('editor.general.noise_layers') }}
        </ParameterSlider>
        <ParameterDivider />
        <ParameterSlider id="s-freq" v-model="LG_PLANET_DATA.planetSurfaceNoise.frequency" :step="0.01" :max="10">
          {{ $t('editor.general.noise_fbm_frequency') }}
        </ParameterSlider>
        <ParameterSlider id="s-amp" v-model="LG_PLANET_DATA.planetSurfaceNoise.amplitude" :step="0.01" :max="1.25">
          {{ $t('editor.general.noise_fbm_amplitude') }}
        </ParameterSlider>
        <ParameterSlider id="s-lac" v-model="LG_PLANET_DATA.planetSurfaceNoise.lacunarity" :step="0.01" :min="1" :max="3">
          {{ $t('editor.general.noise_fbm_lacunarity') }}
        </ParameterSlider>
        <ParameterSlider id="s-oct" v-model="LG_PLANET_DATA.planetSurfaceNoise.octaves" :step="1" :min="1" :max="8">
          {{ $t('editor.general.noise_fbm_octaves') }}
        </ParameterSlider>
        <ParameterDivider />
        <!-- prettier-ignore-attribute -->
        <ParameterColorRamp
          :key="LG_PLANET_DATA.planetName"
          v-model="(LG_PLANET_DATA.planetSurfaceColorRamp as ColorRamp)"
          mode="rgb"
        >
          {{ $t('editor.general.noise_rgbramp') }}
        </ParameterColorRamp>
      </template>
    </ParameterGroup>
  </ParameterGrid>
</template>
<script setup lang="ts">
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import type { ColorRamp } from '@/core/models/color-ramp.model'
import { DebugUtils } from '@/utils/debug-utils'
</script>
