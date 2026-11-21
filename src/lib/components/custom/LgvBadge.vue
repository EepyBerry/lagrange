<template>
  <span class="lgv badge">
    <slot></slot>
  </span>
</template>
<style scoped lang="scss">
.lgv.badge {
  height: min-content;
  padding: 1px 6px;

  border-radius: 4px;
  background: var(--lg-update-06-background);

  font-weight: 500;
  text-wrap: nowrap;
  word-break: keep-all;

  &.contrast {
    background: var(--lg-contrast);
  }
  &.info {
    background: var(--lg-info);
  }
  &.success {
    background: var(--lg-success);
  }
  &.warn {
    background: var(--lg-warn);
  }
}
</style>
