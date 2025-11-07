<template>
  <div class="generic-box" role="region">
    <p>{{ valueLabel }}</p>
    <div class="generic-box-inner" :style="{ background: backgroundColor, color: textColor }">
      <p><slot></slot></p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ valueLabel: string, backgroundColor?: string, textColor?: string }>()
</script>

<style scoped lang="scss">
.generic-box > p {
  font-size: 0.875rem;
}
.generic-box-inner {
  background: var(--lg-input);
  border-radius: 2px;
  width: 100%;
  p {
    border: 1px solid var(--lg-accent);
    border-radius: 2px;
  }
  & > * {
    padding: 0.25rem;
    text-align: center;
  }
}
</style>