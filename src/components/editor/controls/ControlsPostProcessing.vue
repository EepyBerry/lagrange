<template>
  <ParameterGrid>
    <ParameterGroup
      v-model="EDITOR_STATE.renderPipelineData.bloomEnabled"
      :toggleable="EDITOR_STATE.renderPipelineData.bloomEnabled"
    >
      <template #title>{{ $t('editor.controls.postprocessing.bloom') }}</template>
      <template #content>
        <ParameterSlider
          id="rp-b-intensity"
          v-model="EDITOR_STATE.renderPipelineData.bloomStrength"
          :step="0.01"
          :min="0"
          :max="3"
        >
          {{ $t('editor.controls.postprocessing.bloom_strength') }}
        </ParameterSlider>
        <ParameterSlider
          id="rp-b-threshold"
          v-model="EDITOR_STATE.renderPipelineData.bloomThreshold"
          :step="0.01"
          :min="0"
          :max="1"
        >
          {{ $t('editor.controls.postprocessing.bloom_threshold') }}
        </ParameterSlider>
        <ParameterSlider
          id="rp-b-radius"
          v-model="EDITOR_STATE.renderPipelineData.bloomRadius"
          :step="0.01"
          :min="0"
          :max="1"
        >
          {{ $t('editor.controls.postprocessing.bloom_radius') }}
        </ParameterSlider>
      </template>
    </ParameterGroup>
    <ParameterGroup
      v-model="EDITOR_STATE.renderPipelineData.pixelationEnabled"
      :toggleable="EDITOR_STATE.renderPipelineData.pixelationEnabled"
    >
      <template #title>{{ $t('editor.controls.postprocessing.pixelation') }}</template>
      <template #content>
        <ParameterSlider
          id="rp-b-threshold"
          v-model="EDITOR_STATE.renderPipelineData.pixelationPixelSize"
          :step="1"
          :min="1"
          :max="16"
        >
          {{ $t('editor.controls.postprocessing.pixelation_pixelsize') }}
        </ParameterSlider>
        <ParameterSlider
          id="rp-b-intensity"
          v-model="EDITOR_STATE.renderPipelineData.pixelationNormalEdgeIntensity"
          :step="0.05"
          :min="0"
          :max="2"
        >
          {{ $t('editor.controls.postprocessing.pixelation_normaledgeintensity') }}
        </ParameterSlider>
        <ParameterSlider
          id="rp-b-radius"
          v-model="EDITOR_STATE.renderPipelineData.pixelationDepthEdgeIntensity"
          :step="0.05"
          :min="0"
          :max="1"
        >
          {{ $t('editor.controls.postprocessing.pixelation_depthedgeintensity') }}
        </ParameterSlider>
      </template>
    </ParameterGroup>
  </ParameterGrid>
</template>
<script setup lang="ts">
import ParameterGrid from "@components/global/parameters/ParameterGrid.vue";
import ParameterGroup from "@components/global/parameters/ParameterGroup.vue";
import { EDITOR_STATE } from "@core/state/editor.state.ts";
import ParameterSlider from "@components/global/parameters/ParameterSlider.vue";
</script>
