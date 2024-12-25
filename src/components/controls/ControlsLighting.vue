<template>
  <ParameterGrid>
    <ParameterCategory top>{{ $t('editor.controls.lighting.lensflare') }}</ParameterCategory>
    <ParameterCheckbox id="f-toggle" v-model="LG_PLANET_DATA.lensFlareEnabled" :true-value="true" :false-value="false">
      {{ $t('editor.controls.lighting.lensflare_show') }}
    </ParameterCheckbox>
    <template v-if="LG_PLANET_DATA.lensFlareEnabled">
      <ParameterSlider
        id="f-pointsint"
        v-model="LG_PLANET_DATA.lensFlarePointsIntensity"
        :step="0.01"
        :min="0"
        :max="1"
      >
        {{ $t('editor.controls.lighting.lensflare_points_intensity') }}
      </ParameterSlider>
      <ParameterSlider id="f-glareint" v-model="LG_PLANET_DATA.lensFlareGlareIntensity" :step="0.01" :min="0" :max="1">
        {{ $t('editor.controls.lighting.lensflare_glare_intensity') }}
      </ParameterSlider>
    </template>
    <ParameterCategory>{{ $t('editor.controls.lighting.sunlight') }}</ParameterCategory>
    <ParameterSlider id="l-angle" v-model="LG_PLANET_DATA.sunLightAngle" :step="0.1" :min="-90" :max="90">
      {{ $t('editor.controls.lighting.sunlight_angle') }} <sup>(°)</sup>
    </ParameterSlider>
    <ParameterSlider id="l-int" v-model="LG_PLANET_DATA.sunLightIntensity" :step="0.1" :min="0" :max="50">
      {{ $t('editor.controls.lighting.sunlight_intensity') }}
    </ParameterSlider>
    <ParameterColor v-model="LG_PLANET_DATA.sunLightColor">
      {{ $t('editor.controls.lighting.sunlight_color') }}
    </ParameterColor>
    <ParameterCategory>{{ $t('editor.controls.lighting.amblight') }}</ParameterCategory>
    <ParameterSlider id="m-int" v-model="LG_PLANET_DATA.ambLightIntensity" :step="0.01" :min="0" :max="1">
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
