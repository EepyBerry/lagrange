<template>
  <!-- Lighting -->
  <CollapsibleSection
    icon="mingcute:sun-line"
    :expand="false"
    :compact-mode="compactMode"
    :allow-icon-mode="true"
    :button-aria-label="$t('editor.controls.lighting.$title')"
  >
    <template #title>{{ $t('editor.controls.lighting.$title') }}</template>
    <template #content>
      <ControlsLighting />
    </template>
  </CollapsibleSection>

  <!-- Planet & Rendering -->
  <CollapsibleSection
    icon="tabler:gizmo"
    :expand="false"
    :compact-mode="compactMode"
    :allow-icon-mode="true"
    :button-aria-label="$t('editor.controls.planet_rendering.$title')"
  >
    <template #title>{{ $t('editor.controls.planet_rendering.$title') }}</template>
    <template #content>
      <ControlsRendering />
    </template>
  </CollapsibleSection>

  <!-- Surface -->
  <CollapsibleSection
    icon="mingcute:grass-line"
    :expand="false"
    :compact-mode="compactMode"
    :allow-icon-mode="true"
    :button-aria-label="$t('editor.controls.surface.$title')"
  >
    <template #title>{{ $t('editor.controls.surface.$title') }}</template>
    <template #content>
      <ControlsSurface />
    </template>
  </CollapsibleSection>

  <!-- Biomes -->
  <CollapsibleSection
    icon="mingcute:mountain-2-line"
    :expand="false"
    :compact-mode="compactMode"
    :allow-icon-mode="true"
    :button-aria-label="$t('editor.controls.biomes.$title')"
  >
    <template #title>{{ $t('editor.controls.biomes.$title') }}</template>
    <template #content>
      <ControlsBiomes />
    </template>
  </CollapsibleSection>

  <!-- Clouds -->
  <CollapsibleSection
    icon="mingcute:clouds-line"
    :expand="false"
    :compact-mode="compactMode"
    :allow-icon-mode="true"
    :button-aria-label="$t('editor.controls.clouds.$title')"
  >
    <template #title>{{ $t('editor.controls.clouds.$title') }}</template>
    <template #content>
      <ControlsClouds />
    </template>
  </CollapsibleSection>

  <!-- Atmosphere -->
  <CollapsibleSection
    icon="material-symbols:line-curve-rounded"
    :expand="false"
    :compact-mode="compactMode"
    :allow-icon-mode="true"
    :button-aria-label="$t('editor.controls.atmosphere.$title')"
  >
    <template #title>{{ $t('editor.controls.atmosphere.$title') }}</template>
    <template #content>
      <ControlsAtmosphere />
    </template>
  </CollapsibleSection>

  <!-- Ring -->
  <CollapsibleSection
    icon="mingcute:planet-line"
    :expand="false"
    :compact-mode="compactMode"
    :allow-icon-mode="true"
    :button-aria-label="$t('editor.controls.atmosphere.$title')"
  >
    <template #title>{{ $t('editor.controls.ring.$title') }}</template>
    <template #content>
      <ControlsRing />
    </template>
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
import ControlsRing from './ControlsRing.vue'
defineProps<{ compactMode: boolean }>()
</script>
