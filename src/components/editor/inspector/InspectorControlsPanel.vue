<template>
  <section id="panel-controls" class="panel">
    <div id="panel-controls-header">
      <p>
        <iconify-icon :icon="featureIcon" width="1.25rem" :style="{ color: featureColor }" />
        <span v-if="selectedFeature">{{ $t('editor.inspector.features.' + selectedFeature) }}</span>
      </p>
      <span id="panel-controls-header__color" :style="{ background: featureColor }" />
    </div>
    <div id="panel-controls-content">
      <ControlsObjectData v-show="selectedFeature === 'data'" />
      <ControlsTransform v-show="selectedFeature === 'transform'" />
      <ControlsRendering v-show="selectedFeature === 'rendering'" />
      <ControlsLighting v-show="selectedFeature === 'lighting'" />
      <ControlsSurface v-show="selectedFeature === 'surface'" />
      <ControlsCracks v-show="selectedFeature === 'cracks'" />
      <ControlsCraters v-show="selectedFeature === 'craters'" />
      <ControlsBiomes v-show="selectedFeature === 'biomes'" />
      <ControlsClouds v-show="selectedFeature === 'clouds'" />
      <ControlsAtmosphere v-show="selectedFeature === 'atmosphere'" />
      <ControlsRings v-show="selectedFeature === 'rings'" />
      <ControlsPostProcessing v-show="selectedFeature === 'postprocessing'" />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { EditorFeatures } from '@core/types.ts';
import ControlsAtmosphere from '@components/editor/controls/ControlsAtmosphere.vue';
import ControlsBiomes from '@components/editor/controls/ControlsBiomes.vue';
import ControlsClouds from '@components/editor/controls/ControlsClouds.vue';
import ControlsCracks from '@components/editor/controls/ControlsCracks.vue';
import ControlsCraters from '@components/editor/controls/ControlsCraters.vue';
import ControlsLighting from '@components/editor/controls/ControlsLighting.vue';
import ControlsObjectData from '@components/editor/controls/ControlsObjectData.vue';
import ControlsPostProcessing from '@components/editor/controls/ControlsPostProcessing.vue';
import ControlsRendering from '@components/editor/controls/ControlsRendering.vue';
import ControlsRings from '@components/editor/controls/ControlsRings.vue';
import ControlsSurface from '@components/editor/controls/ControlsSurface.vue';
import ControlsTransform from '@components/editor/controls/ControlsTransform.vue';
import { computed, type ComputedRef } from 'vue';

const selectedFeature = defineModel<EditorFeatures | null>();
const featureIcon: ComputedRef<string> = computed(() => {
  switch (selectedFeature.value) {
    case 'data':
      return 'material-symbols:overview-outline';
    case 'transform':
      return 'tabler:gizmo';
    case 'rendering':
      return 'material-symbols:vr180-create2d-outline';
    case 'lighting':
      return 'mingcute:sun-line';
    case 'surface':
      return 'mingcute:grass-line';
    case 'cracks':
      return 'boxicons:explosion';
    case 'craters':
      return 'hugeicons:moon-01';
    case 'biomes':
      return 'fluent:leaf-two-20-regular';
    case 'clouds':
      return 'material-symbols:cloud-outline';
    case 'atmosphere':
      return 'material-symbols:line-curve';
    case 'rings':
      return 'ph:planet';
    case 'postprocessing':
      return 'mingcute:camera-2-line';
    default:
      return '';
  }
});
const featureColor = computed(() => `var(--lg-feature-${selectedFeature.value})`);
</script>

<style scoped lang="scss">
#panel-controls {
  flex: 1;
  height: 100%;
  background: var(--lg-panel);
  scrollbar-width: auto;
  overflow: hidden;

  display: flex;
  flex-direction: column;

  #panel-controls-header {
    width: 100%;
    height: 2.5rem;
    padding: 0.5rem;
    background: linear-gradient(to right, var(--lg-accent), var(--lg-primary-static));
    border-bottom: var(--lg-var-border-width) solid var(--lg-accent);

    display: flex;
    align-items: center;
    justify-content: space-between;

    p {
      line-height: 1;
      text-shadow: 0 0 4px black;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    iconify-icon {
      filter: drop-shadow(0 0 4px black);
    }
    #panel-controls-header__color {
      width: 1rem;
      height: 1rem;
      border-radius: 4px;
      filter: drop-shadow(0 0 4px black);
    }
  }
  #panel-controls-content {
    flex: 1 1 auto;
    min-height: 0;
    padding: 0.5rem;
    overflow-y: auto;
  }
}
</style>
