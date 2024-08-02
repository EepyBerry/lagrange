<template>
  <!-- Lighting -->
  <CollapsibleSection
    icon="mingcute:sun-line"
    :expand="false"
    :compact-mode="compactMode"
    :allow-icon-mode="true"
    :ariaLabel="$t('editor.controls.lighting.$title')"
  >
    <template v-slot:title>{{ $t('editor.controls.lighting.$title') }}</template>
    <template v-slot:content><ControlsLighting /></template>
  </CollapsibleSection>

  <!-- Planet & Rendering -->
  <CollapsibleSection
    icon="tabler:gizmo"
    :expand="false"
    :compact-mode="compactMode"
    :allow-icon-mode="true"
    :ariaLabel="$t('editor.controls.planet_rendering.$title')"
  >
    <template v-slot:title>{{ $t('editor.controls.planet_rendering.$title') }}</template>
    <template v-slot:content><ControlsRendering /></template>
  </CollapsibleSection>

  <!-- Surface -->
  <CollapsibleSection
    icon="mingcute:planet-line"
    :expand="false"
    :compact-mode="compactMode"
    :allow-icon-mode="true"
    :ariaLabel="$t('editor.controls.surface.$title')"
  >
    <template v-slot:title>{{ $t('editor.controls.surface.$title') }}</template>
    <template v-slot:content><ControlsSurface /></template>
  </CollapsibleSection>

  <!-- Biomes -->
  <CollapsibleSection
    icon="mingcute:mountain-2-line"
    :expand="false"
    :compact-mode="compactMode"
    :allow-icon-mode="true"
    :ariaLabel="$t('editor.controls.biomes.$title')"
  >
    <template v-slot:title>{{ $t('editor.controls.biomes.$title') }}</template>
    <template v-slot:content><ControlsBiomes /></template>
  </CollapsibleSection>

  <!-- Clouds -->
  <CollapsibleSection
    icon="mingcute:clouds-line"
    :expand="false"
    :compact-mode="compactMode"
    :allow-icon-mode="true"
    :ariaLabel="$t('editor.controls.clouds.$title')"
  >
    <template v-slot:title>{{ $t('editor.controls.clouds.$title') }}</template>
    <template v-slot:content><ControlsClouds /></template>
  </CollapsibleSection>

  <!-- Atmosphere -->
  <CollapsibleSection
    icon="material-symbols:line-curve-rounded"
    :expand="false"
    :compact-mode="compactMode"
    :allow-icon-mode="true"
    :ariaLabel="$t('editor.controls.atmosphere.$title')"
  >
    <template v-slot:title>{{ $t('editor.controls.atmosphere.$title') }}</template>
    <template v-slot:content><ControlsAtmosphere /></template>
  </CollapsibleSection>
</template>
<script setup lang="ts">
import CollapsibleSection from '@components/elements/CollapsibleSection.vue'
import ControlsLighting from './ControlsLighting.vue'
import ControlsRendering from './ControlsRendering.vue'
import ControlsSurface from './ControlsSurface.vue'
import ControlsBiomes from './ControlsBiomes.vue'
import ControlsClouds from './ControlsClouds.vue'
import ControlsAtmosphere from './ControlsAtmosphere.vue'
defineProps<{ compactMode: boolean }>()
</script>
