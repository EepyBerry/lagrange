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
            id="rp-pixelation-threshold"
            v-model="EDITOR_STATE.renderPipelineData.basePipelinePixelation.pixelSize"
            :step="1"
            :min="1"
            :max="16"
          >
            {{ $t('editor.controls.postprocessing.basepipeline_pixelation_pixelsize') }}
          </ParameterSlider>
          <ParameterSlider
            id="rp-pixelation-intensity"
            v-model="EDITOR_STATE.renderPipelineData.basePipelinePixelation.normalEdgeIntensity"
            :step="0.05"
            :min="0.05"
            :max="2"
          >
            {{ $t('editor.controls.postprocessing.basepipeline_pixelation_normaledgeintensity') }}
          </ParameterSlider>
          <ParameterSlider
            id="rp-pixelation-radius"
            v-model="EDITOR_STATE.renderPipelineData.basePipelinePixelation.depthEdgeIntensity"
            :step="0.05"
            :min="0.05"
            :max="1"
          >
            {{ $t('editor.controls.postprocessing.basepipeline_pixelation_depthedgeintensity') }}
          </ParameterSlider>
        </template>
        <template v-if="EDITOR_STATE.renderPipelineData.basePipelineIdentifier === 'retro'">
          <ParameterSlider
            id="rp-retro-colordepthsteps"
            v-model="EDITOR_STATE.renderPipelineData.basePipelineRetro.colorDepthSteps"
            :step="1"
            :min="1"
            :max="32"
          >
            {{ $t('editor.controls.postprocessing.basepipeline_retro_colordepthsteps') }}
          </ParameterSlider>
          <ParameterSlider
            id="rp-retro-colorbleeding"
            v-model="EDITOR_STATE.renderPipelineData.basePipelineRetro.colorBleeding"
            :step="0.001"
            :min="0"
            :max="0.005"
          >
            {{ $t('editor.controls.postprocessing.basepipeline_retro_colorbleeding') }}
          </ParameterSlider>
          <ParameterDivider bordered />
          <ParameterSlider
            id="rp-retro-scanlineintensity"
            v-model="EDITOR_STATE.renderPipelineData.basePipelineRetro.scanlineIntensity"
            :step="0.01"
            :min="0.01"
            :max="1"
          >
            {{ $t('editor.controls.postprocessing.basepipeline_retro_scanlineintensity') }}
          </ParameterSlider>
          <ParameterSlider
            id="rp-retro-scanlinedensity"
            v-model="EDITOR_STATE.renderPipelineData.basePipelineRetro.scanlineDensity"
            :step="0.01"
            :min="0.02"
            :max="1"
          >
            {{ $t('editor.controls.postprocessing.basepipeline_retro_scanlinedensity') }}
          </ParameterSlider>
          <ParameterSlider
            id="rp-retro-scanlinespeed"
            v-model="EDITOR_STATE.renderPipelineData.basePipelineRetro.scanlineSpeed"
            :step="0.01"
            :min="0.01"
            :max="0.1"
          >
            {{ $t('editor.controls.postprocessing.basepipeline_retro_scanlinespeed') }}
          </ParameterSlider>
          <ParameterDivider bordered />
          <ParameterSlider
            id="rp-retro-curvature"
            v-model="EDITOR_STATE.renderPipelineData.basePipelineRetro.curvature"
            :step="0.01"
            :min="0.01"
            :max="0.2"
          >
            {{ $t('editor.controls.postprocessing.basepipeline_retro_curvature') }}
          </ParameterSlider>
        </template>
      </template>
    </ParameterGroup>
    <ParameterGroup
      v-model="EDITOR_STATE.renderPipelineData.rgbShiftEnabled"
      :toggleable="EDITOR_STATE.renderPipelineData.rgbShiftEnabled"
    >
      <template #title>{{ $t('editor.controls.postprocessing.rgbshift') }}</template>
      <template #content>
        <ParameterSlider
          id="rp-rgbshift-angle"
          v-model="EDITOR_STATE.renderPipelineData.rgbShiftAngle"
          :step="0.5"
          :min="0"
          :max="360"
        >
          {{ $t('editor.controls.postprocessing.rgbshift_angle') }}
        </ParameterSlider>
        <ParameterSlider
          id="rp-rgbshift-amount"
          v-model="EDITOR_STATE.renderPipelineData.rgbShiftAmount"
          :step="0.001"
          :min="0.001"
          :max="0.01"
        >
          {{ $t('editor.controls.postprocessing.rgbshift_amount') }}
        </ParameterSlider>
      </template>
    </ParameterGroup>
    <ParameterGroup
      v-model="EDITOR_STATE.renderPipelineData.chromaticAberrationEnabled"
      :toggleable="EDITOR_STATE.renderPipelineData.chromaticAberrationEnabled"
    >
      <template #title>{{ $t('editor.controls.postprocessing.chromaticaberration') }}</template>
      <template #content>
        <ParameterSlider
          id="rp-chromaticaberration-strength"
          v-model="EDITOR_STATE.renderPipelineData.chromaticAberrationStrength"
          :step="0.01"
          :min="0.01"
          :max="1"
        >
          {{ $t('editor.controls.postprocessing.chromaticaberration_strength') }}
        </ParameterSlider>
        <ParameterSlider
          id="rp-chromaticaberration-scale"
          v-model="EDITOR_STATE.renderPipelineData.chromaticAberrationScale"
          :step="0.01"
          :min="0.01"
          :max="2"
        >
          {{ $t('editor.controls.postprocessing.chromaticaberration_scale') }}
        </ParameterSlider>
      </template>
    </ParameterGroup>
    <ParameterGroup
      v-model="EDITOR_STATE.renderPipelineData.bloomEnabled"
      :toggleable="EDITOR_STATE.renderPipelineData.bloomEnabled"
    >
      <template #title>{{ $t('editor.controls.postprocessing.bloom') }}</template>
      <template #content>
        <ParameterSlider
          id="rp-bloom-intensity"
          v-model="EDITOR_STATE.renderPipelineData.bloomStrength"
          :step="0.01"
          :min="0.01"
          :max="3"
        >
          {{ $t('editor.controls.postprocessing.bloom_strength') }}
        </ParameterSlider>
        <ParameterSlider
          id="rp-bloom-threshold"
          v-model="EDITOR_STATE.renderPipelineData.bloomThreshold"
          :step="0.01"
          :min="0.01"
          :max="1"
        >
          {{ $t('editor.controls.postprocessing.bloom_threshold') }}
        </ParameterSlider>
        <ParameterSlider
          id="rp-bloom-radius"
          v-model="EDITOR_STATE.renderPipelineData.bloomRadius"
          :step="0.01"
          :min="0.01"
          :max="1"
        >
          {{ $t('editor.controls.postprocessing.bloom_radius') }}
        </ParameterSlider>
      </template>
    </ParameterGroup>
    <ParameterGroup
      v-model="EDITOR_STATE.renderPipelineData.vignetteEnabled"
      :toggleable="EDITOR_STATE.renderPipelineData.vignetteEnabled"
    >
      <template #title>{{ $t('editor.controls.postprocessing.vignette') }}</template>
      <template #content>
        <ParameterSlider
          id="rp-vignette-intensity"
          v-model="EDITOR_STATE.renderPipelineData.vignetteIntensity"
          :step="0.01"
          :min="0.01"
          :max="2"
        >
          {{ $t('editor.controls.postprocessing.vignette_intensity') }}
        </ParameterSlider>
        <ParameterSlider
          id="rp-vignette-smoothness"
          v-model="EDITOR_STATE.renderPipelineData.vignetteSmoothness"
          :step="0.01"
          :min="0.05"
          :max="1"
        >
          {{ $t('editor.controls.postprocessing.vignette_smoothness') }}
        </ParameterSlider>
      </template>
    </ParameterGroup>
    <ParameterGroup
      v-model="EDITOR_STATE.renderPipelineData.antiAliasingEnabled"
      :toggleable="EDITOR_STATE.renderPipelineData.antiAliasingEnabled"
    >
      <template #title>{{ $t('editor.controls.postprocessing.antialiasing') }}</template>
      <template #content>
        <ParameterRadio>
          <template #title> {{ $t('editor.controls.postprocessing.antialiasing_mode') }}: </template>
          <template #options>
            <ParameterRadioOption
              :id="'0'"
              v-model="EDITOR_STATE.renderPipelineData.antiAliasingMode"
              name="antialiasing-mode"
              :value="AntiAliasingMode.FXAA"
              :button-aria-label="$t('editor.controls.postprocessing.antialiasing_mode_fxaa')"
              :title="$t('editor.controls.postprocessing.antialiasing_mode_fxaa')"
            >
              {{ $t('editor.controls.postprocessing.antialiasing_mode_fxaa') }}
            </ParameterRadioOption>
            <ParameterRadioOption
              :id="'1'"
              v-model="EDITOR_STATE.renderPipelineData.antiAliasingMode"
              name="antialiasing-mode"
              :value="AntiAliasingMode.SMAA"
              :button-aria-label="$t('editor.controls.postprocessing.antialiasing_mode_smaa')"
              :title="$t('editor.controls.postprocessing.antialiasing_mode_smaa')"
            >
              {{ $t('editor.controls.postprocessing.antialiasing_mode_smaa') }}
            </ParameterRadioOption>
          </template>
        </ParameterRadio>
      </template>
    </ParameterGroup>
  </ParameterGrid>
</template>
<script setup lang="ts">
import ParameterDivider from '@components/global/parameters/ParameterDivider.vue';
import ParameterGrid from '@components/global/parameters/ParameterGrid.vue';
import ParameterGroup from '@components/global/parameters/ParameterGroup.vue';
import ParameterRadio from '@components/global/parameters/ParameterRadio.vue';
import ParameterSelect from '@components/global/parameters/ParameterSelect.vue';
import ParameterSlider from '@components/global/parameters/ParameterSlider.vue';
import { AntiAliasingMode } from '@core/models/renderpipeline/render-pipeline-data.model.ts';
import { EDITOR_STATE } from '@core/state/editor.state.ts';
</script>
