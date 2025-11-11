<template>
  <button class="lgv">
    <span v-if="a11yLabel" class="a11y--visually-hidden">{{ a11yLabel }}</span>
    <iconify-icon :icon="icon" :width="iconWidth ?? '1.5rem'" aria-hidden="true" />
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps<{ icon: string, iconWidth?: string, a11yLabel?: string }>()
</script>

<style lang="scss">
// standard button
button.lgv {
  position: relative;
  padding: 0;
  min-width: 2.5rem;
  min-height: 2.5rem;

  background: var(--lg-button);
  border: none;
  border-radius: 2px;
  color: var(--lg-text);
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;

  &:hover {
    cursor: pointer;
    background: var(--lg-button-hover);
  }
  &:active {
    cursor: pointer;
    background: var(--lg-button-active);
  }
  &:disabled {
    cursor: not-allowed;
    background: var(--lg-button-disabled);
    color: var(--lg-text-disabled);
  }

  &.sm { min-width: 2rem; min-height: 2rem; }

  &.contrast { background: var(--lg-contrast); }
  &.contrast:not(:disabled):hover { background: var(--lg-contrast-hover); }
  &.contrast:not(:disabled):active { background: var(--lg-contrast-active); }

  &.success { background: var(--lg-success); }
  &.success:not(:disabled):hover { background: var(--lg-success-hover); }
  &.success:not(:disabled):active { background: var(--lg-success-active); }

  &.info { background: var(--lg-info); }
  &.info:not(:disabled):hover { background: var(--lg-info-hover); }
  &.info:not(:disabled):active { background: var(--lg-info-active); }

  &.warn { background: var(--lg-warn); }
  &.warn:not(:disabled):hover { background: var(--lg-warn-hover); }
  &.warn:not(:disabled):active { background: var(--lg-warn-active); }
}

// dark button
button.lgv[variant='dark'] {
  background: var(--lg-primary);
  border: 1px solid var(--lg-accent);
  
  min-width: 2.5rem;
  min-height: 2.5rem;
  font-size: 0.875rem;
  overflow: hidden;

  &:hover { background: var(--lg-button-dark-hover); }
  &:active { background: var(--lg-button-dark-active); }
}

// icon button
button.lgv[variant='icon'] {
  border: none;
  background: transparent;

  &:hover { filter: brightness(80%); }
  &:active { filter: brightness(60%); }
  &:disabled { filter: brightness(40%) grayscale(100%); }
}

.a11y--label { display: none; }
</style>
