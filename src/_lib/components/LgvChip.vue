<template>
  <span class="lgv chip">
    <slot></slot>
  </span>
</template>
<style scoped lang="scss">
.lgv.chip {
  padding: 0 0.375rem;
  border-radius: 0.5rem;
  background: var(--lg-accent);
  height: min-content;
  text-wrap: nowrap;
  word-break: keep-all;
  &.contrast {
    background: var(--lg-contrast);
  }
}
</style>
