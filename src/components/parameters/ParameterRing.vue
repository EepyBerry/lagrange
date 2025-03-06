<template>
  <div :id="lgParam!.id" class="ring-grid" :class="{ expanded: _expanded }">
    <div class="ring-header">
      <div class="ring-info">
        <button class="lg icon-button" @click="toggleExpand()" @keydown.enter="toggleExpand()">
          <iconify-icon class="indicator" icon="mingcute:right-fill" width="1.25rem" aria-hidden="true" />
        </button>
        <span
          class="current-color"
          :style="{ background: colorRampToStyle(lgParam!.colorRamp).color }"
        >
          <div
            class="alpha-color"
            :style="{ background: colorRampToStyle(lgParam!.colorRamp).alpha }"
          ></div>
        </span>
        <span class="biome-index">{{ getPartialId() }}</span>
      </div>
      <span class="ring-actions">
        <button class="lg warn" @click="$emit('delete', lgParam!.id)">
          <iconify-icon icon="mingcute:delete-2-line" width="1.25rem" aria-hidden="true" />
        </button>
      </span>
    </div>
    <div v-show="_expanded" class="ring-content">
      <ParameterSlider :id="lgParam!.id + '-r-inner'" v-model="lgParam!.innerRadius" :step="0.01" :min="1.25" :max="5">
        {{ $t('editor.controls.biomes.temperature_min') }}
      </ParameterSlider>
      <ParameterSlider :id="lgParam!.id + '-r-outer'" v-model="lgParam!.outerRadius" :step="0.01" :min="1.25" :max="5">
        {{ $t('editor.controls.biomes.temperature_max') }}
      </ParameterSlider>
      <ParameterDivider />
      <ParameterColorRamp
        :key="lgParam!.id"
        v-model="lgParam!.colorRamp"
        mode="rgba"
      >
        {{ $t('editor.general.noise_rgbaramp') }}
      </ParameterColorRamp>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RingParameters } from '@/core/models/ring-parameters.model';
import { colorRampToStyle } from '@/utils/utils';
import { onMounted, ref, type Ref } from 'vue';

const lgParam = defineModel<RingParameters>()

const _expanded: Ref<boolean> = ref(true)
const _props = defineProps<{ index: number; expand?: boolean }>()

defineEmits(['delete'])
onMounted(() => (_expanded.value = _props.expand ?? true))

function toggleExpand() {
  _expanded.value = !_expanded.value
}

function getPartialId() {
  return lgParam.value?.id.substring(0, 6)
}
</script>

<style lang="scss">

</style>