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
        <span class="ring-index">{{ getPartialId() }}</span>
      </div>
      <span class="ring-actions">
        <button class="lg warn" @click="$emit('delete', lgParam!.id)">
          <iconify-icon icon="mingcute:delete-2-line" width="1.25rem" aria-hidden="true" />
        </button>
      </span>
    </div>
    <div v-show="_expanded" class="ring-content">
      <hr class="info-divider" />
      <ParameterSlider :id="lgParam!.id + '-r-inner'" v-model="lgParam!.innerRadius" :step="0.01" :min="1.25" :max="5">
        {{ $t('editor.controls.ring.transform_radius_inner') }}
      </ParameterSlider>
      <ParameterSlider :id="lgParam!.id + '-r-outer'" v-model="lgParam!.outerRadius" :step="0.01" :min="1.25" :max="5">
        {{ $t('editor.controls.ring.transform_radius_outer') }}
      </ParameterSlider>
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


<style scoped lang="scss">
.ring-grid {
  grid-column: span 2;
  max-width: 100%;
  min-height: 2rem;
  background: var(--lg-panel);
  border: 1px solid var(--lg-accent);
  border-radius: 4px;

  display: flex;
  flex-direction: column;
  padding: 0.5rem;

  &.expanded > .ring-header .indicator {
    transform: rotateZ(90deg);
  }

  .ring-header {
    grid-column: span 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    .ring-index {
      font-weight: 400;
    }
    .ring-info,
    .ring-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
  .ring-content {
    display: grid;
    grid-template-columns: auto auto;
    align-items: center;
    gap: 0.5rem;
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
  width: 3rem;
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