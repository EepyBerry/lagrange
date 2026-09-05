<template>
  <button ref="btnRef" type="button" class="lgv">
    <span v-if="a11yLabel" class="a11y--visually-hidden">{{ a11yLabel }}</span>
    <iconify-icon v-if="icon" :icon="icon" :width="iconWidth ?? '1.5rem'" aria-hidden="true" />
    <span v-if="!!$slots.default" class="__text"><slot></slot></span>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ showText?: boolean; icon?: string; iconWidth?: string; a11yLabel?: string }>(), {
  showText: true,
});
</script>

<style scoped lang="scss">
// standard button
button.lgv {
  position: relative;
  padding: 0;
  min-width: 2.5rem;
  min-height: 2.5rem;

  background: var(--lg-button);
  box-shadow: inset 0 -8px 8px var(--lg-shadow);
  border: none;
  color: var(--lg-text);
  font-family: inherit;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;

  &:hover,
  &:focus-visible {
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

  .__text {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  iconify-icon,
  iconify-icon * {
    pointer-events: none;
  }

  &.sm {
    min-width: 2rem;
    min-height: 2rem;
  }

  &.contrast {
    background: var(--lg-contrast);
  }
  &.contrast:not(:disabled):hover,
  &.contrast:not(:disabled):focus-visible {
    background: var(--lg-contrast-hover);
  }
  &.contrast:not(:disabled):active {
    background: var(--lg-contrast-active);
  }

  &.success {
    background: var(--lg-success);
  }
  &.success:not(:disabled):hover,
  &.success:not(:disabled):focus-visible {
    background: var(--lg-success-hover);
  }
  &.success:not(:disabled):active {
    background: var(--lg-success-active);
  }

  &.info {
    background: var(--lg-info);
  }
  &.info:not(:disabled):hover,
  &.info:not(:disabled):focus-visible {
    background: var(--lg-info-hover);
  }
  &.info:not(:disabled):active {
    background: var(--lg-info-active);
  }

  &.warn {
    background: var(--lg-warn);
  }
  &.warn:not(:disabled):hover,
  &.warn:not(:disabled):focus-visible {
    background: var(--lg-warn-hover);
  }
  &.warn:not(:disabled):active {
    background: var(--lg-warn-active);
  }
}

// dark button
button.lgv[variant='dark'] {
  min-width: 2.5rem;
  min-height: 2.5rem;
  overflow: hidden;
  box-shadow: none;

  background: var(--lg-primary);
  border: 1px solid var(--lg-accent);

  &:not(:disabled):hover,
  &:not(:disabled):focus-visible {
    background: var(--lg-button-dark-hover);
  }
  &:not(:disabled):active {
    background: var(--lg-button-dark-active);
  }

  &.contrast {
    background: var(--lg-button-dark-contrast);
    border-color: var(--lg-contrast);
  }
  &.contrast:not(:disabled):hover,
  &.contrast:not(:disabled):focus-visible {
    background: var(--lg-button-dark-contrast-hover);
  }
  &.contrast:not(:disabled):active {
    background: var(--lg-button-dark-contrast-active);
  }
}

// icon button
button.lgv[variant='icon'] {
  border: none;
  background: transparent;
  box-shadow: none;

  &:not(:disabled):hover,
  &:not(:disabled):focus-visible {
    color: var(--lg-button-icon-hover);
    transform: scale(1.05);
  }
  &:not(:disabled):active {
    color: var(--lg-button-icon-active);
    transform: scale(0.95);
  }
  &:disabled {
    filter: brightness(40%) grayscale(100%);
  }
}

// blank button
button.lgv[variant='blank'] {
  padding: 0;
  border: none;
  background-color: transparent;
  box-shadow: none;
  border-radius: 0;

  &:not(:disabled):hover,
  &:not(:disabled):focus-visible {
    background: none;
  }
  &:not(:disabled):active {
    background: none;
  }
  &:disabled {
    filter: grayscale(100%);
    background: none;
  }
}
</style>
