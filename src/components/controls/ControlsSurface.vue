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

    <ParameterCategory>{{ $t('editor.general.warping') }}</ParameterCategory>
    <ParameterCheckbox
      v-model="LG_PLANET_DATA.planetSurfaceShowWarping"
      id="s-warp"
      :true-value="true"
      :false-value="false"
    >
      {{ $t('editor.general.warping_show') }}
    </ParameterCheckbox>
    <template v-if="LG_PLANET_DATA.planetSurfaceShowWarping">
      <ParameterSlider v-model="LG_PLANET_DATA.planetSurfaceNoise.xWarpFactor" id="s-xwarp" :step="0.01" :max="8">
        {{ $t('editor.general.warping_x') }}
      </ParameterSlider>
      <ParameterSlider v-model="LG_PLANET_DATA.planetSurfaceNoise.yWarpFactor" id="s-ywarp" :step="0.01" :max="8">
        {{ $t('editor.general.warping_y') }}
      </ParameterSlider>
      <ParameterSlider v-model="LG_PLANET_DATA.planetSurfaceNoise.zWarpFactor" id="s-zwarp" :step="0.01" :max="8">
        {{ $t('editor.general.warping_z') }}
      </ParameterSlider>
    </template>

    <ParameterCategory>{{ $t('editor.controls.surface.displacement') }}</ParameterCategory>
    <ParameterCheckbox
      v-model="LG_PLANET_DATA.planetSurfaceShowDisplacement"
      id="s-displace"
      :true-value="true"
      :false-value="false"
    >
      {{ $t('editor.controls.surface.displacement_show') }}
    </ParameterCheckbox>
    <template v-if="LG_PLANET_DATA.planetSurfaceShowDisplacement">
      <ParameterSlider v-model="LG_PLANET_DATA.planetSurfaceDisplacement.factor" id="s-dfac" :step="0.01" :max="1">
        {{ $t('editor.general.displacement_factor') }}
      </ParameterSlider>
      <ParameterSlider v-model="LG_PLANET_DATA.planetSurfaceDisplacement.epsilon" id="s-deps" :step="0.0005" :max="0.25">
        {{ $t('editor.general.displacement_epsilon') }}
      </ParameterSlider>
      <ParameterSlider v-model="LG_PLANET_DATA.planetSurfaceDisplacement.multiplier" id="s-dmul" :step="0.01" :max="3">
        {{ $t('editor.general.displacement_multiplier') }}
      </ParameterSlider>
      <ParameterDivider />
      <ParameterSlider v-model="LG_PLANET_DATA.planetSurfaceDisplacement.frequency" id="s-dfreq" :step="0.01" :max="3">
        {{ $t('editor.general.noise_fbm_frequency') }}
      </ParameterSlider>
      <ParameterSlider v-model="LG_PLANET_DATA.planetSurfaceDisplacement.amplitude" id="s-damp" :step="0.01" :max="1.25">
        {{ $t('editor.general.noise_fbm_amplitude') }}
      </ParameterSlider>
      <ParameterSlider v-model="LG_PLANET_DATA.planetSurfaceDisplacement.lacunarity" id="s-dlac" :step="0.01" :min="1" :max="3">
        {{ $t('editor.general.noise_fbm_lacunarity') }}
      </ParameterSlider>
      <ParameterSlider v-model="LG_PLANET_DATA.planetSurfaceDisplacement.octaves" id="s-doct" :step="1" :min="1" :max="6">
        {{ $t('editor.general.noise_fbm_octaves') }}
      </ParameterSlider>
    </template>
    
    <ParameterCategory>{{ $t('editor.controls.surface.noise') }}</ParameterCategory>
    <ParameterSlider v-model="LG_PLANET_DATA.planetSurfaceNoise.layers" id="s-layers" :step="1" :min="1" :max="3">
      {{ $t('editor.general.noise_layers') }}
    </ParameterSlider>
    <ParameterDivider />
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
      {{ $t('editor.general.noise_rgbramp') }}
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
