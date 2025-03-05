<template>
  <ParameterGrid>
    <ParameterCheckbox id="r-show" v-model="LG_PLANET_DATA.ringsEnabled" :true-value="true" :false-value="false">
      {{ $t('editor.controls.ring.ring_show') }}
    </ParameterCheckbox>
    <template v-if="LG_PLANET_DATA.ringsEnabled">
      <ParameterGroup :toggleable="true">
        <template #title>{{ $t('editor.controls.ring.transform') }}</template>
        <template #content>
          <ParameterSlider id="s-freq" v-model="LG_PLANET_DATA.ringInnerRadius" :step="0.01" :min="1" :max="5">
            {{ $t('editor.controls.ring.transform_radius_inner') }}
          </ParameterSlider>
          <ParameterSlider id="s-amp" v-model="LG_PLANET_DATA.ringOuterRadius" :step="0.01" :min="1" :max="5">
            {{ $t('editor.controls.ring.transform_radius_outer') }}
          </ParameterSlider>
        </template>
      </ParameterGroup>
      <ParameterGroup :toggleable="true">
        <template #title>{{ $t('editor.controls.ring.rgba') }}</template>
        <template #content>
          <ParameterColorRamp
            :key="LG_PLANET_DATA.planetName"
            v-model="LG_PLANET_DATA.ringColorRamp as ColorRamp"
            mode="rgba"
          >
            {{ $t('editor.general.noise_rgbaramp') }}
          </ParameterColorRamp>
        </template>
      </ParameterGroup>
    </template>
  </ParameterGrid>
</template>
<script setup lang="ts">
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import type { ColorRamp } from '@/core/models/color-ramp.model'
</script>
