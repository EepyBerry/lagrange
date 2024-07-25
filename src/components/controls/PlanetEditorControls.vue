<template>
  <div id="controls">
    <aside class="sidebar">
      <!-- Lighting -->
      <SidebarSection icon="mingcute:sun-line" :expand="false" :ariaLabel="$t('editor.controls.lighting.$title')">
        <template v-slot:title>{{ $t('editor.controls.lighting.$title') }}</template>
        <template v-slot:content><ControlsLighting /></template>
      </SidebarSection>

      <!-- Planet & Rendering -->
      <SidebarSection icon="tabler:gizmo" :expand="false" :ariaLabel="$t('editor.controls.planet_rendering.$title')">
        <template v-slot:title>{{ $t('editor.controls.planet_rendering.$title') }}</template>
        <template v-slot:content><ControlsRendering /></template>
      </SidebarSection>

      <!-- Surface -->
      <SidebarSection icon="mingcute:planet-line" :expand="false" :ariaLabel="$t('editor.controls.surface.$title')">
        <template v-slot:title>{{ $t('editor.controls.surface.$title') }}</template>
        <template v-slot:content><ControlsSurface /></template>
      </SidebarSection>

      <!-- Biomes -->
      <SidebarSection icon="mingcute:mountain-2-line" :expand="false" :ariaLabel="$t('editor.controls.biomes.$title')">
        <template v-slot:title>{{ $t('editor.controls.biomes.$title') }}</template>
        <template v-slot:content><ControlsBiomes /></template>
      </SidebarSection>

      <!-- Clouds -->
      <SidebarSection icon="mingcute:clouds-line" :expand="false" :ariaLabel="$t('editor.controls.clouds.$title')">
        <template v-slot:title>{{ $t('editor.controls.clouds.$title') }}</template>
        <template v-slot:content><ControlsClouds /></template>
      </SidebarSection>

      <!-- Atmosphere -->
      <SidebarSection icon="material-symbols:line-curve-rounded" :expand="false" :ariaLabel="$t('editor.controls.atmosphere.$title')">
        <template v-slot:title>{{ $t('editor.controls.atmosphere.$title') }}</template>
        <template v-slot:content><ControlsAtmosphere /></template>
      </SidebarSection>
    </aside>
  </div>
</template>

<script setup lang="ts">
import SidebarSection from '@components/elements/SidebarSection.vue'
import ControlsLighting from './ControlsLighting.vue'
import ControlsRendering from './ControlsRendering.vue'
import ControlsSurface from './ControlsSurface.vue'
import ControlsBiomes from './ControlsBiomes.vue'
import ControlsClouds from './ControlsClouds.vue'
import ControlsAtmosphere from './ControlsAtmosphere.vue'
</script>

<style scoped lang="scss">
#controls {
  z-index: 10;
  position: absolute;
  inset: 0 auto 0;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;

  .sidebar {
    width: 100%;
    padding: 1rem;
    margin-top: 3.875rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    overflow: auto;

    user-select: none;
    direction: rtl;

    & > section {
      direction: ltr;
      align-self: flex-end;
      min-width: 26rem;
    }
  }
}
@media screen and (max-width: 1199px) {
  #controls {
    .sidebar {
      padding: 0.5rem;
      margin-top: 3.375rem;

      & > section {
        min-width: 0;
      }
      & > section.expanded {
        min-width: 26rem;
      }
    }
  }
}
@media screen and (max-width: 767px) {
  #controls {
    min-width: 2rem;
    margin-bottom: 3.875rem;

    .sidebar {
      padding: 0.5rem;
    }
  }
}
@media screen and (max-width: 567px) {
  #controls {
    .sidebar {
      padding: 0.5rem;
      min-width: 0;
      max-width: 100%;
    }
  }
}
</style>
