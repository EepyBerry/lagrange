<template>
  <p class="radio-label">
    <slot name="title">ParameterName</slot>
  </p>
  <div class="radio-options">
    <slot name="options"></slot>
  </div>
</template>

<style scoped lang="scss">
p {
  grid-column: span 2;
}
.radio-options {
  grid-column: span 2;
  display: flex;
  align-items: center;
  min-height: 2rem;
  height: 100%;
  justify-content: flex-end;
  gap: 2px;
  background: var(--lg-button-active);
  border-radius: 4px;
  border: none;

  & > :deep(.radio-button:first-of-type) {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  & > :deep(.radio-button:last-of-type) {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
}

@media screen and (max-width: 1023px) {
  .radio-options {
    height: 2.75rem;
  }
}
</style>
