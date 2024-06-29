<template>
  <span class="lg chip">
    <slot></slot>
  </span>
</template>
<style scoped lang="scss">
.chip.lg {
  padding: 0 0.375rem;
  border-radius: 0.5rem;
  background-color: var(--lg-contrast);
  height: min-content;
  text-wrap: nowrap;
  word-break: keep-all;
}
</style>