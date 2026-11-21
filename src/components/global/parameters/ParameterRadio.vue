<script setup lang="ts"></script>
<template>
  <p class="radio-label">
    <slot name="title">ParameterName</slot>
  </p>
  <div class="radio-options">
    <slot name="options"></slot>
  </div>
</template>

<style scoped lang="scss">
p.radio-label {
  grid-column: span 2;
  font-size: 0.875rem;
  font-weight: 500;
}
.radio-options {
  grid-column: span 2;
  min-height: 2rem;
  height: 100%;

  $corner-length: 10px;
  clip-path: polygon(
    0 $corner-length,
    $corner-length 0,
    100% 0,
    100% calc(100% - $corner-length),
    calc(100% - $corner-length) 100%,
    0 100%
  );
  background: var(--lg-button-active);
  border-radius: 2px;
  border: none;

  font-family: inherit;

  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;

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
  .radio-options,
  .radio-options > * {
    height: 2.75rem;
  }
}
</style>
