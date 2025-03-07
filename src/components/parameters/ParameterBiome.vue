<template>
  <div :id="lgParam!.id" class="biome-grid" :class="{ expanded: _expanded }">
    <div class="biome-header">
      <div class="biome-info">
        <button class="lg icon-button" @click="toggleExpand()" @keydown.enter="toggleExpand()">
          <iconify-icon class="indicator" icon="mingcute:right-fill" width="1.25rem" aria-hidden="true" />
        </button>
        <span class="current-color" :style="{ backgroundColor: `#${lgParam?.color?.getHexString()}` }"></span>
        <span class="biome-index">{{ getPartialId() }}</span>
      </div>
      <span class="biome-actions">
        <button class="lg" :disabled="index === 0" @click="$emit('moveup', lgParam!.id)">
          <iconify-icon icon="mingcute:up-fill" width="1.25rem" aria-hidden="true" />
        </button>
        <button class="lg" :disabled="index === maxIndex" @click="$emit('movedown', lgParam!.id)">
          <iconify-icon icon="mingcute:down-fill" width="1.25rem" aria-hidden="true" />
        </button>
        <hr class="action-divider" />
        <button class="lg warn" @click="$emit('delete', lgParam!.id)">
          <iconify-icon icon="mingcute:delete-2-line" width="1.25rem" aria-hidden="true" />
        </button>
      </span>
    </div>
    <div v-show="_expanded" class="biome-content">
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
      <ParameterDivider />
      <ParameterSlider :id="lgParam!.id + '-b-tmin'" v-model="lgParam!.tempMin" :step="0.005" :min="0" :max="1">
        {{ $t('editor.controls.biomes.temperature_min') }}
      </ParameterSlider>
      <ParameterSlider :id="lgParam!.id + '-b-tmax'" v-model="lgParam!.tempMax" :step="0.005" :min="0" :max="1">
        {{ $t('editor.controls.biomes.temperature_max') }}
      </ParameterSlider>
      <ParameterDivider />
      <ParameterSlider :id="lgParam!.id + '-b-hmin'" v-model="lgParam!.humiMin" :step="0.005" :min="0" :max="1">
        {{ $t('editor.controls.biomes.humidity_min') }}
      </ParameterSlider>
      <ParameterSlider :id="lgParam!.id + '-b-hmax'" v-model="lgParam!.humiMax" :step="0.005" :min="0" :max="1">
        {{ $t('editor.controls.biomes.humidity_max') }}
      </ParameterSlider>
      <ParameterDivider />
      <ParameterSlider :id="lgParam!.id + '-b-smoo'" v-model="lgParam!.smoothness" :step="0.005" :min="0" :max="0.5">
        {{ $t('editor.controls.biomes.smoothness') }}
      </ParameterSlider>
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

type BiomeType = { min: number; max: number; label: string }
const temperatureTypeTable: BiomeType[] = [
  { min: 0, max: 0.15, label: i18n.t('main.planet_data.biome_type_arctic') },
  { min: 0.15, max: 0.3, label: i18n.t('main.planet_data.biome_type_tundra') },
  { min: 0.3, max: 0.5, label: i18n.t('main.planet_data.biome_type_temperate') },
  { min: 0.5, max: 0.6, label: i18n.t('main.planet_data.biome_type_subtropical') },
  { min: 0.6, max: 0.8, label: i18n.t('main.planet_data.biome_type_tropical') },
  { min: 0.8, max: 1.0, label: i18n.t('main.planet_data.biome_type_volcanic') },
]
const humidityTypeTable: BiomeType[] = [
  { min: 0, max: 0.25, label: i18n.t('main.planet_data.biome_type_arid') },
  { min: 0.25, max: 0.5, label: i18n.t('main.planet_data.biome_type_dry') },
  { min: 0.5, max: 0.75, label: i18n.t('main.planet_data.biome_type_semihumid') },
  { min: 0.75, max: 1.0, label: i18n.t('main.planet_data.biome_type_humid') },
]

defineEmits(['moveup', 'movedown', 'delete'])
const _props = defineProps<{ index: number; maxIndex: number; expand?: boolean }>()
onMounted(() => (_expanded.value = _props.expand ?? true))

function toggleExpand() {
  _expanded.value = !_expanded.value
}

function getBiomeTemperatureType(): string {
  const minTypeIdx = temperatureTypeTable?.findLastIndex((b) => b.min <= lgParam.value!.tempMin)
  const maxTypeIdx = temperatureTypeTable?.findIndex((b) => b.max >= lgParam.value!.tempMax)
  if (minTypeIdx >= 0 && minTypeIdx === maxTypeIdx) {
    return temperatureTypeTable[minTypeIdx].label
  } else {
    return i18n.t('main.planet_data.biome_type_various')
  }
}

function getBiomeHumidityType(): string {
  const minTypeIdx = humidityTypeTable.findLastIndex((b) => b.min <= lgParam.value!.humiMin)
  const maxTypeIdx = humidityTypeTable.findIndex((b) => b.max >= lgParam.value!.humiMax)
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
  padding: 0.5rem;

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
    .biome-info,
    .biome-actions {
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
      justify-content: center;
      text-align: center;
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
    border-style: dotted;
    grid-column: span 2;
    margin: 0.5rem 0;
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
        flex-wrap: wrap;
      }
    }
  }
}
</style>
