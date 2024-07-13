<template>
  <tr>
    <td colspan="3">
      <p class="parameter-category">
        <span class="divider"></span>
        <slot></slot>
        <span class="divider"></span>
      </p>
    </td>
  </tr>
</template>
<style scoped lang="scss">
.parameter-category {
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
tr[top] {
  .parameter-category {
    padding: 0 0 0.375rem;
  }
}
</style>