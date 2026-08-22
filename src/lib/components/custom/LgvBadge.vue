<template>
  <span class="lgv badge">
    <slot></slot>
  </span>
</template>
<style scoped lang="scss">
.lgv.badge {
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--lg-accent);
  height: min-content;
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
