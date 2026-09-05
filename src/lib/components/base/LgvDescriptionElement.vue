<template>
  <div class="description lgv">
    <dt class="__label">
      <iconify-icon v-if="icon" class="__icon" :icon="icon" :width="iconWidth ?? '1.5rem'" aria-hidden="true" />
      <span><slot name="label"></slot></span>
    </dt>
    <dd class="__value"><slot name="value"></slot></dd>
  </div>
</template>

<script setup lang="ts">
defineProps<{ icon?: string; iconWidth?: string }>();
</script>

<style scoped lang="scss">
div.description.lgv {
  width: 100%;
  height: 2.25rem;
  padding: 0.5rem;

  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  .__icon {
    grid-column: 1;
  }
  .__label {
    grid-column: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    span {
      max-width: 16ch;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .__value {
    grid-column: 3;
  }
}

@media screen and (max-width: 767px) {
  div.description.lgv {
    height: 2.5rem;
    font-size: 1rem;
  }
}
</style>
