<template>
  <div class="biome-grid" :id="lgParam!.id">
    <div class="biome-header">
      <p>
        <strong>{{ $t('editor.controls.biomes.biome_type') }}:</strong>
        &nbsp;{{ getBiomeTemperatureType() }}{{ getBiomeHumidityType() }}<br />
      </p>
      <span class="biome-actions">
        <button class="lg" @click="$emit('moveup', lgParam!.id)" :disabled="index === 0">
          <iconify-icon icon="mingcute:up-fill" width="1.25rem" aria-hidden="true" />
        </button>
        <button class="lg" @click="$emit('movedown', lgParam!.id)" :disabled="index === maxIndex">
          <iconify-icon icon="mingcute:down-fill" width="1.25rem" aria-hidden="true" />
        </button>
        <hr class="action-divider" />
        <button class="lg warn" @click="$emit('delete', lgParam!.id)">
          <iconify-icon icon="mingcute:delete-2-line" width="1.25rem" aria-hidden="true" />
        </button>
      </span>
    </div>
    <hr class="info-divider" />
    <ParameterDivider />
    <ParameterSlider v-model="lgParam!.tempMin" :id="lgParam!.id + '-b-tmin'" :step="0.005" :min="0" :max="1">
      {{ $t('editor.controls.biomes.temperature_min') }}
    </ParameterSlider>
    <ParameterSlider v-model="lgParam!.tempMax" :id="lgParam!.id + '-b-tmax'" :step="0.005" :min="0" :max="1">
      {{ $t('editor.controls.biomes.temperature_max') }}
    </ParameterSlider>
    <ParameterDivider />
    <ParameterSlider v-model="lgParam!.humiMin" :id="lgParam!.id + '-b-hmin'" :step="0.005" :min="0" :max="1">
      {{ $t('editor.controls.biomes.humidity_min') }}
    </ParameterSlider>
    <ParameterSlider v-model="lgParam!.humiMax" :id="lgParam!.id + '-b-hmax'" :step="0.005" :min="0" :max="1">
      {{ $t('editor.controls.biomes.humidity_max') }}
    </ParameterSlider>
    <ParameterDivider />
    <ParameterColor v-model="lgParam!.color">
      {{ $t('editor.general.noise_color') }}
    </ParameterColor>
  </div>
</template>
<script setup lang="ts">
import ParameterSlider from '@components/parameters/ParameterSlider.vue'
import type { BiomeParameters } from '@/core/models/biome-parameters.model'
import ParameterDivider from './ParameterDivider.vue'
import { useI18n } from 'vue-i18n'
import ParameterColor from './ParameterColor.vue'

const lgParam = defineModel<BiomeParameters>()

const i18n = useI18n()

const temperatureTypeTable = [
  { tempMin: 0, tempMax: 0.15, label: i18n.t('main.planet_data.biome_type_arctic') },
  { tempMin: 0.15, tempMax: 0.3, label: i18n.t('main.planet_data.biome_type_tundra') },
  { tempMin: 0.3, tempMax: 0.5, label: i18n.t('main.planet_data.biome_type_temperate') },
  { tempMin: 0.5, tempMax: 0.6, label: i18n.t('main.planet_data.biome_type_subtropical') },
  { tempMin: 0.6, tempMax: 0.8, label: i18n.t('main.planet_data.biome_type_tropical') },
  { tempMin: 0.8, tempMax: 1.0, label: i18n.t('main.planet_data.biome_type_volcanic') },
]
const humidityTypeTable = [
  { humiMin: 0, humiMax: 0.25, label: i18n.t('main.planet_data.biome_type_arid') },
  { humiMin: 0.25, humiMax: 0.5, label: i18n.t('main.planet_data.biome_type_dry') },
  { humiMin: 0.5, humiMax: 0.75, label: i18n.t('main.planet_data.biome_type_semihumid') },
  { humiMin: 0.75, humiMax: 1.0, label: i18n.t('main.planet_data.biome_type_humid') },
]

function getBiomeTemperatureType() {
  let minTypeIdx = temperatureTypeTable.findLastIndex((b) => b.tempMin <= lgParam.value!.tempMin)
  let maxTypeIdx = temperatureTypeTable.findIndex((b) => b.tempMax >= lgParam.value!.tempMax)
  if (minTypeIdx === maxTypeIdx) {
    return temperatureTypeTable[minTypeIdx].label
  } else {
    return i18n.t('main.planet_data.biome_type_various')
  }
}

function getBiomeHumidityType() {
  let minTypeIdx = humidityTypeTable.findLastIndex((b) => b.humiMin <= lgParam.value!.humiMin)
  let maxTypeIdx = humidityTypeTable.findIndex((b) => b.humiMax >= lgParam.value!.humiMax)
  if (minTypeIdx === maxTypeIdx) {
    return ' / '+ humidityTypeTable[minTypeIdx].label
  } else {
    return ''
  }
}

defineProps<{ index: number, maxIndex: number }>()
defineEmits(['moveup', 'movedown', 'delete'])
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
    .biome-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
  hr.info-divider {
    grid-column: span 2;
    margin: 1rem 0;
  }
  hr.action-divider {
    height: 1.25rem;
  }
}
@media screen and (max-width: 1023px) {
  .biome-grid {
    gap: 0 8px;
    font-size: 1rem;
  }
}
</style>
