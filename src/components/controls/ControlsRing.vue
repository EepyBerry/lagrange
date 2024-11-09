<template>
  <ParameterGrid>
    <button class="lg debug" style="padding: 0 0.5rem" @click="DebugUtils.getRawRingData">
      <iconify-icon icon="material-symbols:code-rounded" aria-hidden="true" />
      get tex
    </button>
    <ParameterCheckbox v-model="LG_PLANET_DATA.ringEnabled" id="r-show" :true-value="true" :false-value="false">
      {{ $t('editor.controls.ring.ring_show') }}
    </ParameterCheckbox>
    <template v-if="LG_PLANET_DATA.ringEnabled">
      <ParameterCategory>{{ $t('editor.controls.ring.transform') }}</ParameterCategory>
      <ParameterSlider v-model="LG_PLANET_DATA.ringInnerRadius" id="s-freq" :step="0.01" :min="1" :max="5">
        {{ $t('editor.controls.ring.transform_radius_inner') }}
      </ParameterSlider>
      <ParameterSlider v-model="LG_PLANET_DATA.ringOuterRadius" id="s-amp" :step="0.01" :min="1" :max="5">
        {{ $t('editor.controls.ring.transform_radius_outer') }}
      </ParameterSlider>
      <ParameterCategory>{{ $t('editor.controls.ring.rgba') }}</ParameterCategory>
      <!-- prettier-ignore-attribute -->
      <ParameterColorRamp
        mode="rgba"
        v-model="(LG_PLANET_DATA.ringColorRamp as ColorRamp)"
        :key="LG_PLANET_DATA.planetName"
      >
        {{ $t('editor.general.noise_rgbaramp') }}
      </ParameterColorRamp>
    </template>
  </ParameterGrid>
</template>
<script setup lang="ts">
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import ParameterGrid from '@components/parameters/ParameterGrid.vue'
import ParameterSlider from '@components/parameters/ParameterSlider.vue'
import ParameterCheckbox from '@components/parameters/ParameterCheckbox.vue'
import ParameterCategory from '@components/parameters/ParameterCategory.vue'
import ParameterColorRamp from '@components/parameters/ParameterColorRamp.vue'
import type { ColorRamp } from '@/core/models/color-ramp.model'
import { DebugUtils } from '@/utils/debug-utils'
</script>
