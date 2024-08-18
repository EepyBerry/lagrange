<template>
  <div class="param-grid">
    <slot>
      Add parameters here
    </slot>
  </div>
</template>
<style scoped lang="scss">
.param-grid {
  width: 100%;
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  gap: 8px 0;
}
@media screen and (max-width: 1023px) {
  .param-grid {
    font-size: 1rem;
  }
}
</style>
