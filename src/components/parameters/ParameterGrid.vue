<template>
  <div class="param-grid">
    <slot>
      Add parameters here
    </slot>
  </div>
</template>
<style scoped lang="scss">
.param-grid {
  display: grid;
  grid-template-columns: auto auto;
  width: 100%;
}
@media screen and (max-width: 1023px) {
  .param-grid {
    gap: 0 8px;
    font-size: 1rem;
  }
}
</style>
