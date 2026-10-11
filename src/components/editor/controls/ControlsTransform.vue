<template>
  <ParameterGrid>
    <ParameterSlider id="p-tilt" v-model="EDITOR_STATE.planetData.planetRadius" :step="0.01" :min="0.5" :max="1">
      {{ $t('editor.planet_rendering.transform_radius') }}
    </ParameterSlider>
    <ParameterSlider id="p-tilt" v-model="EDITOR_STATE.planetData.planetAxialTilt" :step="1" :min="-180" :max="180">
      {{ $t('editor.planet_rendering.transform_axialtilt') }} <sup>(°)</sup>
    </ParameterSlider>
    <ParameterSlider id="p-rot" v-model="EDITOR_STATE.planetData.planetRotation" :step="1" :min="0" :max="360">
      {{ $t('editor.planet_rendering.transform_rotation') }} <sup>(°)</sup>
    </ParameterSlider>
    <ParameterDivider />
  </ParameterGrid>
</template>

<script setup lang="ts">
import ParameterDivider from '@components/global/parameters/ParameterDivider.vue';
import { EDITOR_STATE } from '@core/editor/state/editor.state.ts';
</script>
