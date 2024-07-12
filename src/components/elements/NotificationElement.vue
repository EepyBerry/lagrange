<template>
  <div class="lg notification" :class="type">
    <div class="notification-icon">
      <iconify-icon v-if="type === 'info'" icon="mingcute:information-line" width="1.25rem" aria-hidden="true" />
      <iconify-icon v-if="type === 'warn'" icon="mingcute:alert-line" width="1.25rem" aria-hidden="true" />
    </div>
    <div class="notification-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ type: 'info' | 'warn' }>()
</script>

<style scoped lang="scss">
.lg.notification {
  padding: 0.5rem;
  border-radius: 4px;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.875rem;

  &.info {
    background-color: var(--lg-info);
    border: 1px solid var(--lg-info-active);
  }
  &.warn {
    background-color: var(--lg-warn);
    border: 1px solid var(--lg-warn-active);
  }
}
</style>