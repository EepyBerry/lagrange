<template>
  <div class="biome-grid" :id="lgParam!.id" :class="{ expanded: _expanded }">
    <div class="biome-header">
      <div class="biome-info">
        <button class="lg icon-button" @click="toggleExpand()" @keydown.enter="toggleExpand()">
          <iconify-icon class="indicator" icon="mingcute:right-fill" width="1.5rem" aria-hidden="true" />
        </button>
        <span class="current-color" :style="{ backgroundColor: `#${lgParam?.color?.getHexString()}` }"></span>
        <span class="biome-index">{{ getPartialId() }}</span>
      </div>
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
    <div class="biome-content" v-show="_expanded">
      <hr class="info-divider" />
      <div class="biome-type">
        <strong>{{ $t('editor.controls.biomes.biome_type') }}:</strong>
        <div>
          <iconify-icon icon="mingcute:high-temperature-line" height="1.25rem" />
          <span>{{ getBiomeTemperatureType() }},</span>
        </div>
        <div>
          <iconify-icon icon="material-symbols:humidity-mid" height="1.25rem" />
          <span>{{ getBiomeHumidityType() }}</span>
        </div>
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
  </div>
</template>
<script setup lang="ts">
import ParameterSlider from '@components/parameters/ParameterSlider.vue'
import type { BiomeParameters } from '@/core/models/biome-parameters.model'
import ParameterDivider from './ParameterDivider.vue'
import { useI18n } from 'vue-i18n'
import ParameterColor from './ParameterColor.vue'
import { onMounted, ref, type Ref } from 'vue'

const lgParam = defineModel<BiomeParameters>()
const i18n = useI18n()

const _expanded: Ref<boolean> = ref(true)

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

defineEmits(['moveup', 'movedown', 'delete'])
const _props = defineProps<{ index: number, maxIndex: number, expand?: boolean }>()
onMounted(() => (_expanded.value = _props.expand ?? true))

function toggleExpand() {
  _expanded.value = !_expanded.value
}

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
    return humidityTypeTable[minTypeIdx].label
  } else {
    return i18n.t('main.planet_data.biome_type_various')
  }
}

function getPartialId() {
  return lgParam.value?.id.substring(0, 6)
}

</script>
<style scoped lang="scss">
.biome-grid {
  grid-column: span 2;
  max-width: 100%;
  min-height: 2rem;
  background: var(--lg-panel);
  border: 1px solid var(--lg-accent);
  border-radius: 4px;

  display: flex;
  flex-direction: column;
  padding: 0.75rem;

  &.expanded > .biome-header .indicator {
    transform: rotateZ(90deg);
  }

  .biome-header {
    grid-column: span 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    .biome-index {
      font-weight: 400;
    }
    .biome-info, .biome-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
  .biome-content {
    display: grid;
    grid-template-columns: auto auto;
    align-items: center;
    gap: 0.5rem;

    .biome-type {
      grid-column: span 2;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      span {
        max-width: 16ch;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
    .biome-type > div {
      display: flex;
      align-items: center;
      gap: 0.25rem;
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
.current-color {
  display: inline-flex;
  align-self: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 4px;
  border: 1px solid var(--lg-accent);
}
strong {
  font-weight: 550;
}

@media screen and (max-width: 1023px) {
  .biome-grid {
    gap: 0 8px;
    font-size: 1rem;
  }
}
@media screen and (max-width: 767px) {
  .biome-grid {
    .biome-content {
      .biome-type {
        font-size: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }
    }
  }
}
</style>
