<template>
  <ParameterGrid>
    <ParameterCheckbox id="a-toggle" v-model="LG_PLANET_DATA.atmosphereEnabled" :true-value="true" :false-value="false">
      {{ $t('editor.controls.atmosphere.atmosphere_show') }}
    </ParameterCheckbox>
    <template v-if="LG_PLANET_DATA.atmosphereEnabled">
      <ParameterGroup :toggleable="true">
        <template #title>{{ $t('editor.controls.atmosphere.transform') }}</template>
        <template #content>
          <ParameterSlider id="a-height" v-model="LG_PLANET_DATA.atmosphereHeight" :step="0.05" :min="0.25" :max="8">
            {{ $t('editor.controls.atmosphere.transform_height') }}
          </ParameterSlider>
          <ParameterSlider
            id="a-density"
            v-model="LG_PLANET_DATA.atmosphereDensityScale"
            :step="0.05"
            :min="0.25"
            :max="10"
          >
            {{ $t('editor.controls.atmosphere.transform_density') }}
          </ParameterSlider>
        </template>
      </ParameterGroup>
      <ParameterGroup :toggleable="true">
        <template #title>{{ $t('editor.controls.atmosphere.rgba') }}</template>
        <template #content>
          <ParameterSlider id="a-int" v-model="LG_PLANET_DATA.atmosphereIntensity" :step="0.01" :min="0" :max="2">
            {{ $t('editor.controls.atmosphere.rgba_intensity') }}
          </ParameterSlider>
          <ParameterRadio>
            <template #title> {{ $t('editor.controls.atmosphere.rgba_mode') }}: </template>
            <template #options>
              <ParameterRadioOption
                :id="'0'"
                v-model="LG_PLANET_DATA.atmosphereColorMode"
                icon="mingcute:photo-album-line"
                name="atmos-mode"
                :value="ColorMode.REALISTIC"
                :button-aria-label="$t('editor.controls.atmosphere.rgba_mode_realistic')"
                :title="$t('tooltip.rgba_mode_realistic')"
              >
                {{ $t('editor.controls.atmosphere.rgba_mode_realistic') }}
              </ParameterRadioOption>
              <ParameterRadioOption
                :id="'1'"
                v-model="LG_PLANET_DATA.atmosphereColorMode"
                icon="mingcute:color-picker-line"
                name="atmos-mode"
                :value="ColorMode.DIRECT"
                :button-aria-label="$t('editor.controls.atmosphere.rgba_mode_direct')"
                :title="$t('tooltip.rgba_mode_direct')"
              >
                {{ $t('editor.controls.atmosphere.rgba_mode_direct') }}
              </ParameterRadioOption>
              <ParameterRadioOption
                :id="'1'"
                v-model="LG_PLANET_DATA.atmosphereColorMode"
                icon="mingcute:color-filter-line"
                name="atmos-mode"
                :value="ColorMode.MIXED"
                :button-aria-label="$t('editor.controls.atmosphere.rgba_mode_mixed')"
                :title="$t('tooltip.rgba_mode_mixed')"
              >
                {{ $t('editor.controls.atmosphere.rgba_mode_mixed') }}
              </ParameterRadioOption>
            </template>
          </ParameterRadio>
          <template v-if="[ColorMode.REALISTIC, ColorMode.MIXED].includes(LG_PLANET_DATA.atmosphereColorMode)">
            <ParameterSlider
              id="a-hue"
              v-model="LG_PLANET_DATA.atmosphereHue"
              :step="0.01"
              :min="0"
              :max="2"
              extras="rgb"
            >
              {{ $t('editor.controls.atmosphere.rgba_hue') }}
            </ParameterSlider>
          </template>
          <template v-if="[ColorMode.DIRECT, ColorMode.MIXED].includes(LG_PLANET_DATA.atmosphereColorMode)">
            <ParameterColor v-model="LG_PLANET_DATA.atmosphereTint">
              {{ $t('editor.controls.atmosphere.rgba_tint') }}
            </ParameterColor>
          </template>
        </template>
      </ParameterGroup>
    </template>
  </ParameterGrid>
</template>
<script setup lang="ts">
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import { ColorMode } from '@/core/types'
</script>
