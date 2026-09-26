<template>
  <div id="editor-inspector">
    <LgvResizableVContainer id="inspector__inner" startingTopHeight="40%">
      <template #top>
        <InspectorFeaturesPanel ref="inspectorTopPanel" @featureChange="selectedFeature = $event" />
      </template>
      <template #bottom>
        <InspectorControlsPanel v-model="selectedFeature" />
      </template>
    </LgvResizableVContainer>
  </div>
</template>

<script setup lang="ts">
import type { EditorFeatures } from '@core/types.ts';
import InspectorControlsPanel from '@components/editor/inspector/InspectorControlsPanel.vue';
import InspectorFeaturesPanel from '@components/editor/inspector/InspectorFeaturesPanel.vue';
import LgvResizableVContainer from '@lib/components/layout/LgvResizableVContainer.vue';

const selectedFeature = defineModel<EditorFeatures | null>();
</script>

<style scoped lang="scss">
#editor-inspector {
  max-width: 30rem;
  height: 100%;

  display: flex;
  flex-direction: column;

  border-radius: 2px;
  background: var(--lg-primary);
}
#editor-inspector.collapsed {
  position: absolute;
  #inspector__inner {
    display: none;
  }
}
</style>
