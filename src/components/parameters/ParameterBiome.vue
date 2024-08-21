<template>
  <div class="biome-grid" :id="lgParam!.id">
    <div class="biome-name">
      <p>{{ $t('editor.controls.biomes.biome_name') }}:</p>
      <p>???</p>
    </div>
    <hr class="name-divider">
    <ParameterSlider v-model="lgParam!.tempMin" :id="lgParam!.id + '-b-tmin'" :step="0.01" :min="0" :max="1">
      {{ $t('editor.controls.biomes.temperature_min') }}
    </ParameterSlider>
    <ParameterSlider v-model="lgParam!.tempMax" :id="lgParam!.id + '-b-tmax'" :step="0.01" :min="0" :max="1">
      {{ $t('editor.controls.biomes.temperature_max') }}
    </ParameterSlider>
    <ParameterDivider />
    <ParameterSlider v-model="lgParam!.humiMin" :id="lgParam!.id + '-b-hmin'" :step="0.01" :min="0" :max="1">
      {{ $t('editor.controls.biomes.humidity_min') }}
    </ParameterSlider>
    <ParameterSlider v-model="lgParam!.humiMax" :id="lgParam!.id + '-b-hmax'" :step="0.01" :min="0" :max="1">
      {{ $t('editor.controls.biomes.humidity_max') }}
    </ParameterSlider>
    <ParameterDivider />
    <ParameterColorRamp
      mode="rgba"
      v-model="(lgParam!.rgbaRamp as ColorRamp)"
      :key="lgParam!.id"
    >
      {{ $t('editor.general.noise_rgbaramp') }}
    </ParameterColorRamp>
  </div>
</template>
<script setup lang="ts">
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import ParameterSlider from '@components/parameters/ParameterSlider.vue'
import ParameterColorRamp from '@components/parameters/ParameterColorRamp.vue'
import type { ColorRamp } from '@/core/models/color-ramp.model'
import type { BiomeParameters } from '@/core/models/biome-parameters.model'
import ParameterDivider from './ParameterDivider.vue'
const lgParam = defineModel<BiomeParameters>()
</script>
<style scoped lang="scss">
.biome-grid {
  grid-column: span 2;
  width: 100%;
  min-height: 2rem;
  background: var(--lg-panel);
  border: 1px solid var(--lg-accent);
  border-radius: 4px;

  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  padding: 1rem;

  .biome-name {
    grid-column: span 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  hr.name-divider {
    grid-column: span 2;
    margin: 1rem 0;
  }
}
@media screen and (max-width: 1023px) {
  .biome-grid {
    gap: 0 8px;
    font-size: 1rem;
  }
}
</style>
