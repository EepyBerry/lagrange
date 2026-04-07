<template>
  <div class="param-grid">
    <slot></slot>
  </div>
</template>
<style scoped lang="scss">
.param-grid {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px 0;
}
@media screen and (max-width: 1023px) {
  .param-grid {
    font-size: 1rem;
    grid-template-columns: minmax(8rem, 1fr) auto;
    word-wrap: anywhere;
  }
}
</style>
