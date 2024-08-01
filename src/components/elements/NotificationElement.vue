<template>
  <div class="notification" :class="type">
    <div class="notification-icon">
      <iconify-icon v-if="type === 'info'" icon="mingcute:information-line" width="1.25rem" aria-hidden="true" />
      <iconify-icon v-if="type === 'warn'" icon="mingcute:alert-line" width="1.25rem" aria-hidden="true" />
      <iconify-icon v-if="type === 'wip'" icon="mingcute:traffic-cone-line" width="1.25rem" aria-hidden="true" />
    </div>
    <div class="notification-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { InfoLevel } from '@/core/types';

defineProps<{ type: InfoLevel }>()
</script>

<style scoped lang="scss">
.notification {
  padding: 0.5rem;
  border-radius: 4px;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.875rem;

  &.success {
    background: var(--lg-success-panel);
    border: 1px solid var(--lg-success);
  }
  &.info {
    background: var(--lg-info-panel);
    border: 1px solid var(--lg-info);
  }
  &.warn,
  &.wip {
    background: var(--lg-warn-panel);
    border: 1px solid var(--lg-warn);
  }
}
.notification-icon {
  display: flex;
  align-items: center;
}
</style>
