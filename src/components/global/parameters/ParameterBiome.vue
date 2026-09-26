<template>
  <div
    :id="lgParam!.id"
    class="biome-grid"
    :class="{ expanded: _expanded }"
    :style="{ '--biome-color': `#${lgParam?.color?.getHexString()}` }"
  >
    <div class="biome-header">
      <div class="biome-info">
        <LgvButton
          variant="icon"
          class="sm"
          :icon="_expanded ? 'mingcute:down-fill' : 'mingcute:right-fill'"
          icon-width="1.25rem"
          @click="toggleExpand()"
          @keydown.enter="toggleExpand()"
        />
        <span class="biome-name">{{ getPartialId() }}</span>
      </div>
      <div class="biome-actions">
        <LgvButton
          variant="icon"
          class="sm"
          icon="material-symbols:keyboard-double-arrow-up"
          icon-width="1.5rem"
          :disabled="index === 0"
          @click="$emit('moveup', lgParam!.id)"
        />
        <LgvButton
          variant="icon"
          class="sm"
          icon="material-symbols:keyboard-double-arrow-down"
          icon-width="1.5rem"
          :disabled="index === maxIndex"
          @click="$emit('movedown', lgParam!.id)"
        />
        <LgvButton
          variant="icon"
          class="sm warn"
          icon="mingcute:delete-2-line"
          icon-width="1.5rem"
          @click="$emit('delete', lgParam!.id)"
        />
      </div>
    </div>
    <div v-show="_expanded" class="biome-content">
      <div class="biome-type">
        <iconify-icon icon="mingcute:high-temperature-line" height="1.25rem" />
        <span>{{ getBiomeTemperatureType() }}</span>
      </div>
      <ParameterSlider :id="lgParam!.id + '-b-tmin'" v-model="lgParam!.tempMin" :step="0.005" :min="0" :max="1">
        {{ $t('editor.features.biomes.temperature_min') }}
      </ParameterSlider>
      <ParameterSlider :id="lgParam!.id + '-b-tmax'" v-model="lgParam!.tempMax" :step="0.005" :min="0" :max="1">
        {{ $t('editor.features.biomes.temperature_max') }}
      </ParameterSlider>
      <div class="biome-type">
        <iconify-icon icon="material-symbols:humidity-mid" height="1.25rem" />
        <span>{{ getBiomeHumidityType() }}</span>
      </div>
      <ParameterSlider :id="lgParam!.id + '-b-hmin'" v-model="lgParam!.humiMin" :step="0.005" :min="0" :max="1">
        {{ $t('editor.features.biomes.humidity_min') }}
      </ParameterSlider>
      <ParameterSlider :id="lgParam!.id + '-b-hmax'" v-model="lgParam!.humiMax" :step="0.005" :min="0" :max="1">
        {{ $t('editor.features.biomes.humidity_max') }}
      </ParameterSlider>
      <ParameterDivider />
      <ParameterSlider
        :id="lgParam!.id + '-b-smoothness'"
        v-model="lgParam!.smoothness"
        :step="0.005"
        :min="0"
        :max="0.5"
      >
        {{ $t('editor.features.biomes.smoothness') }}
      </ParameterSlider>
      <ParameterSlider
        :id="lgParam!.id + '-b-emiintensity'"
        v-model="lgParam!.emissiveIntensity"
        :disabled="!EDITOR_STATE.planetData.planetShowEmissive"
        :step="0.005"
        :min="0"
        :max="10"
      >
        {{ $t('editor.general.emissive_intensity') }}
      </ParameterSlider>
      <ParameterColor v-model="lgParam!.color">
        {{ $t('editor.general.noise_color') }}
      </ParameterColor>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { BiomeParameters } from '@core/models/planet/features/biome-parameters.model.js';
import ParameterSlider from '@components/global/parameters/ParameterSlider.vue';
import { EDITOR_STATE } from '@core/editor/state/editor.state.ts';
import LgvButton from '@lib/components/base/LgvButton.vue';
import { onMounted, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ParameterColor from './ParameterColor.vue';
import ParameterDivider from './ParameterDivider.vue';

const lgParam = defineModel<BiomeParameters>();
const i18n = useI18n();

const _expanded: Ref<boolean> = ref(true);

type BiomeType = { min: number; max: number; label: string };
const temperatureTypeTable: BiomeType[] = [
  { min: 0, max: 0.15, label: i18n.t('common.planet_data.biome_type_arctic') },
  { min: 0.15, max: 0.3, label: i18n.t('common.planet_data.biome_type_tundra') },
  { min: 0.3, max: 0.5, label: i18n.t('common.planet_data.biome_type_temperate') },
  { min: 0.5, max: 0.6, label: i18n.t('common.planet_data.biome_type_subtropical') },
  { min: 0.6, max: 0.8, label: i18n.t('common.planet_data.biome_type_tropical') },
  { min: 0.8, max: 1, label: i18n.t('common.planet_data.biome_type_volcanic') },
];
const humidityTypeTable: BiomeType[] = [
  { min: 0, max: 0.25, label: i18n.t('common.planet_data.biome_type_arid') },
  { min: 0.25, max: 0.5, label: i18n.t('common.planet_data.biome_type_dry') },
  { min: 0.5, max: 0.75, label: i18n.t('common.planet_data.biome_type_semihumid') },
  { min: 0.75, max: 1, label: i18n.t('common.planet_data.biome_type_humid') },
];

defineEmits(['moveup', 'movedown', 'delete']);
const _props = defineProps<{ index: number; maxIndex: number; expand?: boolean }>();
onMounted(() => (_expanded.value = _props.expand ?? true));

function toggleExpand() {
  _expanded.value = !_expanded.value;
}

function getBiomeTemperatureType(): string {
  const minTypeIdx = temperatureTypeTable?.findLastIndex((b) => b.min <= lgParam.value!.tempMin);
  const maxTypeIdx = temperatureTypeTable?.findIndex((b) => b.max >= lgParam.value!.tempMax);
  if (minTypeIdx >= 0 && minTypeIdx === maxTypeIdx) {
    return temperatureTypeTable[minTypeIdx].label;
  } else {
    return i18n.t('common.planet_data.biome_type_various');
  }
}

function getBiomeHumidityType(): string {
  const minTypeIdx = humidityTypeTable.findLastIndex((b) => b.min <= lgParam.value!.humiMin);
  const maxTypeIdx = humidityTypeTable.findIndex((b) => b.max >= lgParam.value!.humiMax);
  if (minTypeIdx === maxTypeIdx) {
    return humidityTypeTable[minTypeIdx].label;
  } else {
    return i18n.t('common.planet_data.biome_type_various');
  }
}

function getPartialId() {
  return lgParam.value?.id.substring(0, 12);
}
</script>
<style scoped lang="scss">
.biome-grid {
  grid-column: span 2;
  max-width: 100%;
  min-height: 2rem;
  background: var(--lg-panel);
  border: 1px solid var(--lg-accent);
  border-left: 4px solid var(--biome-color);
  border-radius: 2px;

  display: flex;
  flex-direction: column;
  padding: 0.5rem;

  .biome-header {
    font-size: 0.8125rem;
    grid-column: span 2;
    overflow: hidden;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;

    .biome-name {
      font-weight: 400;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .biome-info {
      overflow: hidden;
      display: flex;
      align-items: center;
      gap: 4px;

      & > button {
        padding: 0;
      }
    }
    .biome-actions {
      display: flex;
      align-items: center;
      & > button {
        padding: 0;
      }
    }
  }
  .biome-content {
    overflow: hidden;
    margin-top: 0.5rem;

    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 0.5rem;

    .biome-type {
      grid-column: span 2;
      font-size: 0.875rem;
      background: var(--lg-primary);
      border: 1px solid var(--lg-accent);

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
    grid-column: span 2;
    margin: 0.5rem 0;
    border-top: none;
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
