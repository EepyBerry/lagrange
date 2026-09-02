<template>
  <article class="static-value lgv">
    <span class="__label">
      <iconify-icon class="__icon" :icon="icon" :width="iconWidth ?? '1.5rem'" />
      <span><slot name="label"></slot></span>
    </span>
    <span class="__value"><slot name="value"></slot></span>
  </article>
</template>

<script setup lang="ts">
defineProps<{ icon?: string; iconWidth?: string; a11yLabel?: string }>();
</script>

<style scoped lang="scss">
.static-value.lgv {
  width: 100%;
  height: 2.25rem;
  padding: 0.375rem 0.5rem;
  background: var(--lg-panel);

  display: flex;
  align-items: center;
  justify-content: space-between;

  .__label {
    grid-column: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .__icon {
    grid-column: 1;
  }
  .__value {
    grid-column: 3;
    font-size: 1rem;
  }
}

@media screen and (max-width: 767px) {
  .static-value.lgv {
    height: 2.5rem;
    font-size: 1rem;
  }
}
</style>
