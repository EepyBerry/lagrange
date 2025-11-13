<template>
  <button ref="btnRef" type="button" class="lgv">
    <span v-if="a11yLabel" class="a11y--visually-hidden">{{ a11yLabel }}</span>
    <iconify-icon :icon="icon" :width="iconWidth ?? getDefaultIconWidth()" aria-hidden="true" />
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue';

const btnRef = useTemplateRef('btnRef')
defineProps<{ icon: string, iconWidth?: string, a11yLabel?: string }>()

function getDefaultIconWidth() {
  return btnRef.value?.classList.contains('sm') ? '1.25rem' : '1.5rem'
}
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
  font-family: inherit;
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

  iconify-icon, iconify-icon * { 
    pointer-events: none;
  }

  &.pad { padding: 0 0.75rem; }
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
  min-width: 2.5rem;
  min-height: 2.5rem;
  overflow: hidden;

  background: var(--lg-primary);
  border: 1px solid var(--lg-accent);

  &:hover { background: var(--lg-button-dark-hover); }
  &:active { background: var(--lg-button-dark-active); }

  &.flush {
    border-width: 0;
    border-radius: 0;
  }

  &.contrast { background: var(--lg-button-dark-contrast); border-color: var(--lg-contrast); }
  &.contrast:not(:disabled):hover { background: var(--lg-button-dark-contrast-hover); }
  &.contrast:not(:disabled):active { background: var(--lg-button-dark-contrast-active); }
}

// icon button
button.lgv[variant='icon'] {
  border: none;
  background: transparent;

  &:hover { filter: brightness(80%); transform: scale(1.05);}
  &:active { filter: brightness(60%); transform: scale(0.95); }
  &:disabled { filter: brightness(40%) grayscale(100%); }
}

// a11y
.a11y--label {
  display: none;
}
</style>
