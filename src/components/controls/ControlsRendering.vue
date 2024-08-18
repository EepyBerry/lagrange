<template>
  <ParameterGrid>
    <ParameterCategory top>{{ $t('editor.controls.planet_rendering.transform') }}</ParameterCategory>
    <ParameterSlider v-model="LG_PLANET_DATA.planetRadius" id="p-tilt" :step="0.01" :min="0.5" :max="1">
      {{ $t('editor.controls.planet_rendering.transform_radius') }}
    </ParameterSlider>
    <ParameterSlider v-model="LG_PLANET_DATA.planetAxialTilt" id="p-tilt" :step="1" :min="0" :max="180">
      {{ $t('editor.controls.planet_rendering.transform_axialtilt') }} <sup>(°)</sup>
    </ParameterSlider>
    <ParameterSlider v-model="LG_PLANET_DATA.planetRotation" id="p-rot" :step="1" :min="0" :max="360">
      {{ $t('editor.controls.planet_rendering.transform_rotation') }} <sup>(°)</sup>
    </ParameterSlider>
    <ParameterCategory>{{ $t('editor.controls.planet_rendering.pbr') }}</ParameterCategory>
    <ParameterSlider v-model="LG_PLANET_DATA.planetWaterLevel" id="p-wlevel" :step="0.01" :min="0" :max="1">
      {{ $t('editor.controls.planet_rendering.pbr_waterlevel') }}
    </ParameterSlider>
    <ParameterDivider />
    <ParameterSlider v-model="LG_PLANET_DATA.planetWaterRoughness" id="p-wrough" :step="0.01" :min="0" :max="1">
      {{ $t('editor.controls.planet_rendering.pbr_waterroughness') }}
    </ParameterSlider>
    <ParameterSlider v-model="LG_PLANET_DATA.planetWaterMetalness" id="p-wmetal" :step="0.01" :min="0" :max="1">
      {{ $t('editor.controls.planet_rendering.pbr_watermetalness') }}
    </ParameterSlider>
    <ParameterDivider />
    <ParameterSlider v-model="LG_PLANET_DATA.planetGroundRoughness" id="p-grough" :step="0.01" :min="0" :max="1">
      {{ $t('editor.controls.planet_rendering.pbr_groundroughness') }}
    </ParameterSlider>
    <ParameterSlider v-model="LG_PLANET_DATA.planetGroundMetalness" id="p-gmetal" :step="0.01" :min="0" :max="1">
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
</script>
