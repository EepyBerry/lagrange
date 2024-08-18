<template>
  <ParameterGrid>
    <ParameterCategory top>{{ $t('editor.controls.lighting.lensflare') }}</ParameterCategory>
    <ParameterCheckbox v-model="LG_PLANET_DATA.lensFlareEnabled" id="f-toggle" :true-value="true" :false-value="false">
      {{ $t('editor.controls.lighting.lensflare_show') }}
    </ParameterCheckbox>
    <template v-if="LG_PLANET_DATA.lensFlareEnabled">
      <ParameterSlider
        v-model="LG_PLANET_DATA.lensFlarePointsIntensity"
        id="f-pointsint"
        :step="0.01"
        :min="0"
        :max="1"
      >
        {{ $t('editor.controls.lighting.lensflare_points_intensity') }}
      </ParameterSlider>
      <ParameterSlider v-model="LG_PLANET_DATA.lensFlareGlareIntensity" id="f-glareint" :step="0.01" :min="0" :max="1">
        {{ $t('editor.controls.lighting.lensflare_glare_intensity') }}
      </ParameterSlider>
    </template>
    <ParameterCategory>{{ $t('editor.controls.lighting.sunlight') }}</ParameterCategory>
    <ParameterSlider v-model="LG_PLANET_DATA.sunLightAngle" id="l-angle" :step="0.1" :min="-90" :max="90">
      {{ $t('editor.controls.lighting.sunlight_angle') }} <sup>(°)</sup>
    </ParameterSlider>
    <ParameterSlider v-model="LG_PLANET_DATA.sunLightIntensity" id="l-int" :step="0.1" :min="0" :max="50">
      {{ $t('editor.controls.lighting.sunlight_intensity') }}
    </ParameterSlider>
    <ParameterColor v-model="LG_PLANET_DATA.sunLightColor">
      {{ $t('editor.controls.lighting.sunlight_color') }}
    </ParameterColor>
    <ParameterCategory>{{ $t('editor.controls.lighting.amblight') }}</ParameterCategory>
    <ParameterSlider v-model="LG_PLANET_DATA.ambLightIntensity" id="m-int" :step="0.01" :min="0" :max="1">
      {{ $t('editor.controls.lighting.amblight_intensity') }}
    </ParameterSlider>
    <ParameterColor v-model="LG_PLANET_DATA.ambLightColor">
      {{ $t('editor.controls.lighting.amblight_color') }}
    </ParameterColor>
  </ParameterGrid>
</template>
<script setup lang="ts">
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import ParameterGrid from '@components/parameters/ParameterGrid.vue'
import ParameterSlider from '@components/parameters/ParameterSlider.vue'
import ParameterCheckbox from '@components/parameters/ParameterCheckbox.vue'
import ParameterCategory from '@components/parameters/ParameterCategory.vue'
import ParameterColor from '@components/parameters/ParameterColor.vue'
</script>
