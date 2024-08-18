<template>
  <p class="parameter-category">
    <span class="divider"></span>
    <slot></slot>
    <span class="divider"></span>
  </p>
</template>
<style scoped lang="scss">
.parameter-category {
  grid-column: span 2;
  font-size: 1rem;
  font-weight: 500;
  padding: 1.125rem 0 0.375rem;

  display: flex;
  align-items: center;
  gap: 0.625rem;
}
.divider {
  flex: 1;
  border-bottom: 3px solid var(--lg-accent);
}
.parameter-category[top] {
  padding: 0 0 0.375rem;
}
</style>
