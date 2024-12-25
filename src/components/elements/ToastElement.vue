<template>
  <div class="toast" :class="classObject">
    <div class="toast-icon">
      <iconify-icon v-if="type === 'success'" icon="mingcute:check-circle-line" width="1.5rem" aria-hidden="true" />
      <iconify-icon v-if="type === 'info'" icon="mingcute:information-line" width="1.5rem" aria-hidden="true" />
      <iconify-icon v-if="type === 'warn'" icon="mingcute:alert-line" width="1.5rem" aria-hidden="true" />
      <iconify-icon v-if="type === 'wip'" icon="mingcute:traffic-cone-line" width="1.5rem" aria-hidden="true" />
    </div>
    <div class="toast-message">
      <slot>TOAST_MESSAGE</slot>
    </div>
    <button
      class="lg icon-button"
      :aria-label="$t('a11y.action_close_toast')"
      :tabindex="visible ? 'auto' : '-1'" 
      @click="$emit('close')"
    >
      <iconify-icon icon="mingcute:close-line" width="1.5rem" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
import type { InfoLevel } from '@/core/types'
import { computed, type ComputedRef } from 'vue'

const $props = defineProps<{ type: InfoLevel; visible: boolean }>()
defineEmits(['close'])

const classObject: ComputedRef<string[]> = computed(() => [$props.visible ? 'visible' : '', $props.type])
</script>

<style scoped lang="scss">
.toast {
  width: fit-content;
  min-height: 2.75rem;
  background: var(--lg-panel);
  border: 1px solid var(--lg-accent);
  border-radius: 4px;
  transition:
    opacity 150ms ease-in-out,
    transform 150ms ease-in-out;
  opacity: 0;
  transform: scale(95%);

  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 0.5rem;
  overflow: hidden;
  pointer-events: none;
  user-select: none;

  &.visible {
    pointer-events: all;
    user-select: all;
    opacity: 1;
    transform: scale(100%);
  }

  &.success .toast-icon {
    background: var(--lg-success);
  }
  &.info .toast-icon {
    background: var(--lg-info);
  }
  &.warn .toast-icon,
  &.wip .toast-icon {
    background: var(--lg-warn);
  }
}
.toast-icon {
  display: flex;
  align-items: center;
  padding: 0.5rem;
}
.toast-message {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
}

button {
  padding: 0.5rem;
}
</style>
