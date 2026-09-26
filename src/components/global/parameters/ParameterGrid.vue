<template>
  <div class="param-grid">
    <slot></slot>
  </div>
</template>
<style scoped lang="scss">
.param-grid {
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.5rem 0.75rem;
}
@media screen and (max-width: 1023px) {
  .param-grid {
    font-size: 1rem;
    grid-template-columns: minmax(8rem, 1fr) auto;
    word-wrap: anywhere;
  }
}
</style>
