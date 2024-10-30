<template>
  <ParameterGrid>
    <button class="lg debug" style="padding: 0 0.5rem" @click="DebugUtils.getRawSurfaceData">
      <iconify-icon icon="material-symbols:code-rounded" aria-hidden="true" />
      get tex
    </button>
    <ParameterCategory top>{{ $t('editor.controls.surface.bumpmap') }}</ParameterCategory>
    <ParameterCheckbox
      v-model="LG_PLANET_DATA.planetSurfaceShowBumps"
      id="s-bump"
      :true-value="true"
      :false-value="false"
    >
      {{ $t('editor.controls.surface.bumpmap_show') }}
    </ParameterCheckbox>
    <template v-if="LG_PLANET_DATA.planetSurfaceShowBumps">
      <ParameterSlider
        v-model="LG_PLANET_DATA.planetSurfaceBumpStrength"
        id="s-bumpstr"
        :step="0.0005"
        :min="0.02"
        :max="0.2"
      >
        {{ $t('editor.controls.surface.bumpmap_strength') }}
      </ParameterSlider>
    </template>
    <ParameterCategory>{{ $t('editor.controls.surface.noise') }}</ParameterCategory>
    <ParameterSlider v-model="LG_PLANET_DATA.planetSurfaceNoise.frequency" id="s-freq" :step="0.01" :max="10">
      {{ $t('editor.general.noise_fbm_frequency') }}
    </ParameterSlider>
    <ParameterSlider v-model="LG_PLANET_DATA.planetSurfaceNoise.amplitude" id="s-amp" :step="0.01" :max="1.25">
      {{ $t('editor.general.noise_fbm_amplitude') }}
    </ParameterSlider>
    <ParameterSlider v-model="LG_PLANET_DATA.planetSurfaceNoise.lacunarity" id="s-lac" :step="0.01" :min="1" :max="3">
      {{ $t('editor.general.noise_fbm_lacunarity') }}
    </ParameterSlider>
    <ParameterSlider v-model="LG_PLANET_DATA.planetSurfaceNoise.octaves" id="s-oct" :step="1" :min="1" :max="8">
      {{ $t('editor.general.noise_fbm_octaves') }}
    </ParameterSlider>
    <ParameterDivider />
    <!-- prettier-ignore-attribute -->
    <ParameterColorRamp
      mode="rgb"
      v-model="(LG_PLANET_DATA.planetSurfaceColorRamp as ColorRamp)"
      :key="LG_PLANET_DATA.planetName"
    >
      {{ $t('editor.controls.surface.noise_colorramp') }}
    </ParameterColorRamp>
  </ParameterGrid>
</template>
<script setup lang="ts">
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import ParameterGrid from '@components/parameters/ParameterGrid.vue'
import ParameterSlider from '@components/parameters/ParameterSlider.vue'
import ParameterCheckbox from '@components/parameters/ParameterCheckbox.vue'
import ParameterCategory from '@components/parameters/ParameterCategory.vue'
import ParameterColorRamp from '@components/parameters/ParameterColorRamp.vue'
import ParameterDivider from '@components/parameters/ParameterDivider.vue'
import type { ColorRamp } from '@/core/models/color-ramp.model'
import { DebugUtils } from '@/utils/debug-utils'
</script>
