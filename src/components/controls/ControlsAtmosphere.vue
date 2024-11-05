<template>
  <ParameterGrid>
    <ParameterCheckbox v-model="LG_PLANET_DATA.atmosphereEnabled" id="a-toggle" :true-value="true" :false-value="false">
      {{ $t('editor.controls.atmosphere.atmosphere_show') }}
    </ParameterCheckbox>
    <template v-if="LG_PLANET_DATA.atmosphereEnabled">
      <ParameterCategory>{{ $t('editor.controls.atmosphere.transform') }}</ParameterCategory>
      <ParameterSlider v-model="LG_PLANET_DATA.atmosphereHeight" id="a-height" :step="0.05" :min="0.25" :max="8">
        {{ $t('editor.controls.atmosphere.transform_height') }}
      </ParameterSlider>
      <ParameterSlider v-model="LG_PLANET_DATA.atmosphereDensityScale" id="a-density" :step="0.05" :min="0.25" :max="10">
        {{ $t('editor.controls.atmosphere.transform_density') }}
      </ParameterSlider>
      <ParameterCategory>{{ $t('editor.controls.atmosphere.rgba') }}</ParameterCategory>
      <ParameterSlider v-model="LG_PLANET_DATA.atmosphereIntensity" id="a-int" :step="0.01" :min="0" :max="2">
        {{ $t('editor.controls.atmosphere.rgba_intensity') }}
      </ParameterSlider>
      <ParameterDivider />
      <ParameterRadio>
        <template v-slot:title> {{ $t('editor.controls.atmosphere.rgba_mode') }}: </template>
        <template v-slot:options>
          <ParameterRadioOption v-model="LG_PLANET_DATA.atmosphereColorMode" icon="mingcute:photo-album-line"
            name="atmos-mode" :id="'0'" :value="ColorMode.REALISTIC"
            :ariaLabel="$t('editor.controls.atmosphere.rgba_mode_realistic')"
            :title="$t('tooltip.rgba_mode_realistic')">
            {{ $t('editor.controls.atmosphere.rgba_mode_realistic') }}
          </ParameterRadioOption>
          <ParameterRadioOption v-model="LG_PLANET_DATA.atmosphereColorMode" icon="mingcute:color-picker-line"
            name="atmos-mode" :id="'1'" :value="ColorMode.DIRECT"
            :ariaLabel="$t('editor.controls.atmosphere.rgba_mode_direct')" :title="$t('tooltip.rgba_mode_direct')">
            {{ $t('editor.controls.atmosphere.rgba_mode_direct') }}
          </ParameterRadioOption>
          <ParameterRadioOption v-model="LG_PLANET_DATA.atmosphereColorMode" icon="mingcute:color-filter-line"
            name="atmos-mode" :id="'1'" :value="ColorMode.MIXED"
            :ariaLabel="$t('editor.controls.atmosphere.rgba_mode_mixed')" :title="$t('tooltip.rgba_mode_mixed')">
            {{ $t('editor.controls.atmosphere.rgba_mode_mixed') }}
          </ParameterRadioOption>
        </template>
      </ParameterRadio>
      <ParameterDivider />
      <template v-if="[ColorMode.REALISTIC, ColorMode.MIXED].includes(LG_PLANET_DATA.atmosphereColorMode)">
        <ParameterSlider v-model="LG_PLANET_DATA.atmosphereHue" id="a-hue" :step="0.01" :min="0" :max="2" extras="rgb">
          {{ $t('editor.controls.atmosphere.rgba_hue') }}
        </ParameterSlider>
      </template>
      <template v-if="[ColorMode.DIRECT, ColorMode.MIXED].includes(LG_PLANET_DATA.atmosphereColorMode)">
        <ParameterColor v-model="LG_PLANET_DATA.atmosphereTint">
          {{ $t('editor.controls.atmosphere.rgba_tint') }}
        </ParameterColor>
      </template>
    </template>
  </ParameterGrid>
</template>
<script setup lang="ts">
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import ParameterGrid from '@components/parameters/ParameterGrid.vue'
import ParameterSlider from '@components/parameters/ParameterSlider.vue'
import ParameterCheckbox from '@components/parameters/ParameterCheckbox.vue'
import ParameterCategory from '@components/parameters/ParameterCategory.vue'
import ParameterColor from '../parameters/ParameterColor.vue'
import ParameterDivider from '../parameters/ParameterDivider.vue'
import { ColorMode } from '@/core/types'
</script>
