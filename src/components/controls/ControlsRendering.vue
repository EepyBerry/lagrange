<template>
  <ParameterGrid>
    <ParameterCategory top>{{ $t('editor.controls.planet_rendering.transform') }}</ParameterCategory>
    <ParameterSlider id="p-tilt"  v-model="LG_PLANET_DATA.planetRadius" :step="0.01" :min="0.5" :max="1">
      {{ $t('editor.controls.planet_rendering.transform_radius') }}
    </ParameterSlider>
    <ParameterSlider id="p-tilt" v-model="LG_PLANET_DATA.planetAxialTilt" :step="1" :min="-180" :max="180">
      {{ $t('editor.controls.planet_rendering.transform_axialtilt') }} <sup>(°)</sup>
    </ParameterSlider>
    <ParameterSlider id="p-rot" v-model="LG_PLANET_DATA.planetRotation" :step="1" :min="0" :max="360">
      {{ $t('editor.controls.planet_rendering.transform_rotation') }} <sup>(°)</sup>
    </ParameterSlider>
    <ParameterCategory>{{ $t('editor.controls.planet_rendering.pbr') }}</ParameterCategory>
    <ParameterSlider id="p-wlevel" v-model="LG_PLANET_DATA.planetWaterLevel" :step="0.01" :min="0" :max="1">
      {{ $t('editor.controls.planet_rendering.pbr_waterlevel') }}
    </ParameterSlider>
    <ParameterDivider />
    <ParameterSlider id="p-wrough" v-model="LG_PLANET_DATA.planetWaterRoughness" :step="0.01" :min="0" :max="1">
      {{ $t('editor.controls.planet_rendering.pbr_waterroughness') }}
    </ParameterSlider>
    <ParameterSlider id="p-wmetal" v-model="LG_PLANET_DATA.planetWaterMetalness" :step="0.01" :min="0" :max="1">
      {{ $t('editor.controls.planet_rendering.pbr_watermetalness') }}
    </ParameterSlider>
    <ParameterRadio>
      <template #title> {{ $t('editor.controls.planet_rendering.pbr_wateremissivemode') }}: </template>
      <template #options>
        <ParameterRadioOption
          :id="'0'"
          v-model="LG_PLANET_DATA.planetWaterEmissiveMode"
          icon="mingcute:photo-album-line"
          name="emissive-mode"
          :value="EmissiveMode.CURRENT_COLOR"
          :button-aria-label="$t('editor.controls.planet_rendering.pbr_wateremissivemode_current')"
          :title="$t('tooltip.pbr_wateremissivemode_current')"
        >
          {{ $t('editor.controls.planet_rendering.pbr_wateremissivemode_current') }}
        </ParameterRadioOption>
        <ParameterRadioOption
          :id="'1'"
          v-model="LG_PLANET_DATA.planetWaterEmissiveMode"
          icon="mingcute:color-picker-line"
          name="emissive-mode"
          :value="EmissiveMode.DIRECT"
          :button-aria-label="$t('editor.controls.planet_rendering.pbr_wateremissivemode_direct')"
          :title="$t('tooltip.pbr_wateremissivemode_direct')"
        >
        {{ $t('editor.controls.planet_rendering.pbr_wateremissivemode_direct') }}
        </ParameterRadioOption>
      </template>
    </ParameterRadio>
    <template v-if="LG_PLANET_DATA.planetWaterEmissiveMode === EmissiveMode.DIRECT">
      <ParameterColor v-model="LG_PLANET_DATA.planetWaterEmissiveColor">
        {{ $t('editor.controls.planet_rendering.pbr_wateremissivecolor') }}
      </ParameterColor>
    </template>
    <ParameterSlider id="p-wintensity" v-model="LG_PLANET_DATA.planetWaterEmissiveIntensity" :step="0.01" :min="0" :max="5">
      {{ $t('editor.controls.planet_rendering.pbr_wateremissiveintensity') }}
    </ParameterSlider>
    <ParameterDivider />
    <ParameterSlider id="p-grough" v-model="LG_PLANET_DATA.planetGroundRoughness" :step="0.01" :min="0" :max="1">
      {{ $t('editor.controls.planet_rendering.pbr_groundroughness') }}
    </ParameterSlider>
    <ParameterSlider id="p-gmetal" v-model="LG_PLANET_DATA.planetGroundMetalness" :step="0.01" :min="0" :max="1">
      {{ $t('editor.controls.planet_rendering.pbr_groundmetalness') }}
    </ParameterSlider>
  </ParameterGrid>
</template>
<script setup lang="ts">
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import ParameterGrid from '@components/parameters/ParameterGrid.vue'
import ParameterSlider from '@components/parameters/ParameterSlider.vue'
import ParameterCategory from '@components/parameters/ParameterCategory.vue'
import ParameterDivider from '@components/parameters/ParameterDivider.vue'
import ParameterColor from '@components/parameters/ParameterColor.vue'
import { EmissiveMode } from '@/core/types'
</script>
