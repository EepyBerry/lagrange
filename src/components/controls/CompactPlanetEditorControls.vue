<template>
  <div id="controls">
    <!-- Lighting -->
    <CollapsibleSection icon="mingcute:sun-line" :expand="false" ariaLabel="Lighting settings">
      <template v-slot:title>{{ $t('editor.controls.lighting.$title') }}</template>
      <template v-slot:content><ControlsLighting /></template>
    </CollapsibleSection>

    <!-- Planet & Rendering -->
    <CollapsibleSection icon="tabler:gizmo" :expand="false" ariaLabel="Planet rendering settings">
      <template v-slot:title>{{ $t('editor.controls.planet_rendering.$title') }}</template>
      <template v-slot:content><ControlsRendering /></template>
    </CollapsibleSection>

    <!-- Surface -->
    <CollapsibleSection icon="mingcute:planet-line" :expand="false">
      <template v-slot:title>{{ $t('editor.controls.surface.$title') }}</template>
      <template v-slot:content><ControlsSurface /></template>
    </CollapsibleSection>

    <!-- Biomes -->
    <CollapsibleSection icon="mingcute:mountain-2-line" :expand="false">
      <template v-slot:title>{{ $t('editor.controls.biomes.$title') }}</template>
      <template v-slot:content><ControlsBiomes /></template>
    </CollapsibleSection>

    <!-- Clouds -->
    <CollapsibleSection icon="mingcute:clouds-line" :expand="false">
      <template v-slot:title>{{ $t('editor.controls.clouds.$title') }}</template>
      <template v-slot:content><ControlsClouds /></template>
    </CollapsibleSection>

    <!-- Atmosphere -->
    <CollapsibleSection icon="material-symbols:line-curve-rounded" :expand="false">
      <template v-slot:title>{{ $t('editor.controls.atmosphere.$title') }}</template>
      <template v-slot:content><ControlsAtmosphere /></template>
    </CollapsibleSection>
    <InlineFooter />
  </div>
</template>

<script setup lang="ts">
import CollapsibleSection from '../elements/CollapsibleSection.vue'
import InlineFooter from '../main/InlineFooter.vue'
import ControlsLighting from './ControlsLighting.vue'
import ControlsRendering from './ControlsRendering.vue'
import ControlsSurface from './ControlsSurface.vue'
import ControlsBiomes from './ControlsBiomes.vue'
import ControlsClouds from './ControlsClouds.vue'
import ControlsAtmosphere from './ControlsAtmosphere.vue'
</script>

<style scoped lang="scss">
#controls {
  z-index: 5;
  position: absolute;
  inset: 50% 0 0;
  padding: 0.75rem 0.5rem 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 0.5rem;
  overflow-y: auto;
}
</style>
