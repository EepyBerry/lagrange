<template>
  <article class="static-indicator lgv">
    <span class="__label">
      <iconify-icon class="__icon" :icon="icon" :width="iconWidth ?? '1.5rem'" />
      <span><slot name="label"></slot></span>
    </span>
    <span class="__value" :class="value ? 'success' : 'warn'">{{ $t(value ? 'common.yes' : 'common.no') }}</span>
  </article>
</template>

<script setup lang="ts">
defineProps<{ value: boolean; icon?: string; iconWidth?: string; a11yLabel?: string }>();
</script>

<style scoped lang="scss">
.static-indicator.lgv {
  width: 100%;
  height: 2.25rem;
  padding: 0.5rem;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  .__label {
    grid-column: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    span {
      max-width: 16ch;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .__icon {
    grid-column: 1;
  }
  .__value {
    grid-column: 3;
    padding: 0 0.5rem;
    border-radius: 2px;
    &.success {
      background: var(--lg-success);
    }
    &.warn {
      background: var(--lg-warn);
    }
  }
}

@media screen and (max-width: 767px) {
  .static-indicator.lgv {
    height: 2.5rem;
    font-size: 1rem;
  }
}
</style>
