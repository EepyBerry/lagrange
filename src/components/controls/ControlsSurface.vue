<template>
  <ParameterGrid>
    <button class="lg debug" style="padding: 0 0.5rem" @click="DebugUtils.getRawSurfaceData">
      <iconify-icon icon="material-symbols:code-rounded" aria-hidden="true" />
      get tex
    </button>
    <ParameterCategory top>{{ $t('editor.controls.surface.bumpmap') }}</ParameterCategory>
    <ParameterCheckbox
      id="s-bump"
      v-model="LG_PLANET_DATA.planetSurfaceShowBumps"
      :true-value="true"
      :false-value="false"
    >
      {{ $t('editor.controls.surface.bumpmap_show') }}
    </ParameterCheckbox>
    <template v-if="LG_PLANET_DATA.planetSurfaceShowBumps">
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

    <ParameterCategory>{{ $t('editor.general.warping') }}</ParameterCategory>
    <ParameterCheckbox
      id="s-warp"
      v-model="LG_PLANET_DATA.planetSurfaceShowWarping"
      :true-value="true"
      :false-value="false"
    >
      {{ $t('editor.general.warping_show') }}
    </ParameterCheckbox>
    <template v-if="LG_PLANET_DATA.planetSurfaceShowWarping">
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

    <ParameterCategory>{{ $t('editor.controls.surface.displacement') }}</ParameterCategory>
    <ParameterCheckbox
      id="s-displace"
      v-model="LG_PLANET_DATA.planetSurfaceShowDisplacement"
      :true-value="true"
      :false-value="false"
    >
      {{ $t('editor.controls.surface.displacement_show') }}
    </ParameterCheckbox>
    <template v-if="LG_PLANET_DATA.planetSurfaceShowDisplacement">
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

    <ParameterCategory>{{ $t('editor.controls.surface.noise') }}</ParameterCategory>
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
