<template>
  <main>
    <PlanetEditorControls />
    <PlanetEditorView />
  </main>
  <AppFooter />
</template>

<script setup lang="ts">
import PlanetEditorControls from './components/PlanetEditorControls.vue';
import AppFooter from './components/AppFooter.vue';
import PlanetEditorView from './views/PlanetEditorView.vue';
</script>

<style scoped lang="scss">
</style>
