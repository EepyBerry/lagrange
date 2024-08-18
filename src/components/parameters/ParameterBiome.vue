<template>
  <div class="biome-grid">
    
  </div>
</template>
<script setup lang="ts">
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import ParameterTable from '@components/parameters/ParameterTable.vue'
import ParameterSlider from '@components/parameters/ParameterSlider.vue'
import ParameterCheckbox from '@components/parameters/ParameterCheckbox.vue'
import ParameterCategory from '@components/parameters/ParameterCategory.vue'
import ParameterColorRamp from '@components/parameters/ParameterColorRamp.vue'
import ParameterColor from '@components/parameters/ParameterColor.vue'
import type { ColorRamp } from '@/core/models/color-ramp.model'
</script>
<style scoped lang="scss">
.biome-grid {
  display: grid;
  grid-template-columns: auto auto;
  width: 100%;
}
@media screen and (max-width: 1023px) {
  .biome-grid {
    gap: 0 8px;
    font-size: 1rem;
  }
}
</style>
