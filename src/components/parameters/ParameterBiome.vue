<template>
  <div class="biome-grid" :id="lgParam!.id">
    <div class="biome-header">
      <p>
        <strong>{{ $t('editor.controls.biomes.biome_type') }}:</strong> {{ getBiomeType() }}<br />
      </p>
      <button class="lg warn" @click="$emit('delete', lgParam!.id)">
        <iconify-icon icon="mingcute-delete-2-line" width="1.25rem" aria-hidden="true" />
      </button>
    </div>
    <hr class="name-divider" />
    <!-- <ParameterSlider v-model="lgParam!.heightMin" :id="lgParam!.id + '-b-hmin'" :step="0.01" :min="0" :max="1">
      {{ $t('editor.controls.biomes.height_min') }}
    </ParameterSlider>
    <ParameterSlider v-model="lgParam!.heightMax" :id="lgParam!.id + '-b-hmax'" :step="0.01" :min="0" :max="1">
      {{ $t('editor.controls.biomes.height_max') }}
    </ParameterSlider> -->
    <ParameterDivider />
    <ParameterSlider v-model="lgParam!.tempMin" :id="lgParam!.id + '-b-tmin'" :step="0.01" :min="0" :max="1">
      {{ $t('editor.controls.biomes.temperature_min') }}
    </ParameterSlider>
    <ParameterSlider v-model="lgParam!.tempMax" :id="lgParam!.id + '-b-tmax'" :step="0.01" :min="0" :max="1">
      {{ $t('editor.controls.biomes.temperature_max') }}
    </ParameterSlider>
    <ParameterDivider />
    <!-- TODO: add humidity controls once the system works -->
    <!-- <ParameterSlider v-model="lgParam!.humiMin" :id="lgParam!.id + '-b-hmin'" :step="0.01" :min="0" :max="1">
      {{ $t('editor.controls.biomes.humidity_min') }}
    </ParameterSlider>
    <ParameterSlider v-model="lgParam!.humiMax" :id="lgParam!.id + '-b-hmax'" :step="0.01" :min="0" :max="1">
      {{ $t('editor.controls.biomes.humidity_max') }}
    </ParameterSlider> -->
    <ParameterDivider />
    <ParameterColorRamp mode="rgba" v-model="(lgParam!.rgbaRamp as ColorRamp)" :key="lgParam!.id">
      {{ $t('editor.general.noise_rgbaramp') }}
    </ParameterColorRamp>
  </div>
</template>
<script setup lang="ts">
import ParameterSlider from '@components/parameters/ParameterSlider.vue'
import ParameterColorRamp from '@components/parameters/ParameterColorRamp.vue'
import type { ColorRamp } from '@/core/models/color-ramp.model'
import type { BiomeParameters } from '@/core/models/biome-parameters.model'
import ParameterDivider from './ParameterDivider.vue'
import { useI18n } from 'vue-i18n'
const lgParam = defineModel<BiomeParameters>()

const i18n = useI18n()

const biomeTypeTable = [
  { tempMin: 0, tempMax: 0.15, label: i18n.t('main.planet_data.biome_type_arctic') },
  { tempMin: 0.15, tempMax: 0.3, label: i18n.t('main.planet_data.biome_type_tundra') },
  { tempMin: 0.3, tempMax: 0.5, label: i18n.t('main.planet_data.biome_type_temperate') },
  { tempMin: 0.5, tempMax: 0.6, label: i18n.t('main.planet_data.biome_type_subtropical') },
  { tempMin: 0.6, tempMax: 0.8, label: i18n.t('main.planet_data.biome_type_tropical') },
  { tempMin: 0.8, tempMax: 1.0, label: i18n.t('main.planet_data.biome_type_volcanic') },
]

function getBiomeType() {
  let minType = biomeTypeTable.find((b) => b.tempMin >= lgParam.value!.tempMin)?.label
  let maxType = biomeTypeTable.find((b) => b.tempMax >= lgParam.value!.tempMax)?.label
  if (minType === maxType) {
    return minType
  } else {
    return i18n.t('main.planet_data.biome_type_various')
  }
}

defineEmits(['delete'])
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

  .biome-header {
    grid-column: span 2;
    display: flex;
    align-items: center;
    justify-content: space-between;

    strong {
      font-weight: 550;
    }
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
