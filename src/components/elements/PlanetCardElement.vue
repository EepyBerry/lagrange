<template>
  <div class="planet-card">
    <div class="planet-preview"></div>
    <h3>{{ planet?.data.planetName }}</h3>
  </div>
</template>

<script setup lang="ts">
import { type IDBPlanet } from '@/dexie.config';
defineProps<{ planet: IDBPlanet }>()
</script>

<style scoped lang="scss">
.planet-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>