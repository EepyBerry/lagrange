<template>
  <ParameterGrid>
    <ParameterGroup toggleable>
      <template #title>{{ $t('editor.controls.postprocessing.basepipeline') }}</template>
      <template #content>
        <ParameterSelect id="rb-base" v-model="EDITOR_STATE.renderPipelineData.basePipelineIdentifier">
          {{ $t('editor.controls.postprocessing.basepipeline_select') }}
          <template #options>
            <option value="none">{{ $t('editor.controls.postprocessing.basepipeline_none') }}</option>
            <option value="pixelation">{{ $t('editor.controls.postprocessing.basepipeline_pixelation') }}</option>
            <option value="retro">{{ $t('editor.controls.postprocessing.basepipeline_retro') }}</option>
          </template>
        </ParameterSelect>
        <template v-if="EDITOR_STATE.renderPipelineData.basePipelineIdentifier === 'pixelation'">
          <ParameterSlider
            id="rp-b-threshold"
            v-model="EDITOR_STATE.renderPipelineData.basePipelinePixelation.pixelSize"
            :step="1"
            :min="1"
            :max="16"
          >
            {{ $t('editor.controls.postprocessing.basepipeline_pixelation_pixelsize') }}
          </ParameterSlider>
          <ParameterSlider
            id="rp-b-intensity"
            v-model="EDITOR_STATE.renderPipelineData.basePipelinePixelation.normalEdgeIntensity"
            :step="0.05"
            :min="0"
            :max="2"
          >
            {{ $t('editor.controls.postprocessing.basepipeline_pixelation_normaledgeintensity') }}
          </ParameterSlider>
          <ParameterSlider
            id="rp-b-radius"
            v-model="EDITOR_STATE.renderPipelineData.basePipelinePixelation.depthEdgeIntensity"
            :step="0.05"
            :min="0"
            :max="1"
          >
            {{ $t('editor.controls.postprocessing.basepipeline_pixelation_depthedgeintensity') }}
          </ParameterSlider>
        </template>
      </template>
    </ParameterGroup>
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
  </ParameterGrid>
</template>
<script setup lang="ts">
import ParameterGrid from "@components/global/parameters/ParameterGrid.vue";
import ParameterGroup from "@components/global/parameters/ParameterGroup.vue";
import { EDITOR_STATE } from "@core/state/editor.state.ts";
import ParameterSlider from "@components/global/parameters/ParameterSlider.vue";
import ParameterSelect from "@components/global/parameters/ParameterSelect.vue";
</script>
