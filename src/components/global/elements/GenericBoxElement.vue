<template>
  <div :id="id" ref="elementRef" class="generic-box">
    <span>{{ valueLabel }}:</span>
    <p class="generic-box-inner" :style="{ background: backgroundColor, color: textColor }">
      <slot></slot>
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ id: string; valueLabel: string; backgroundColor?: string; textColor?: string }>();
</script>

<style scoped lang="scss">
.generic-box > p,
span {
  font-size: 0.875rem;
}
.generic-box-inner {
  width: 100%;
  padding: 0.25rem;

  background: var(--lg-panel);
  border: 1px solid var(--lg-accent);
  border-radius: 2px;

  text-align: center;
}
</style>
