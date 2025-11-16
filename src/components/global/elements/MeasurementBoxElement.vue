<template>
  <div class="measurement-box" role="region">
    <p>{{ valueLabel }}:</p>
    <div class="measurement-box-inner">
      <iconify-icon
        :icon="icon"
        width="1.5rem"
        aria-hidden="true"
      />
      <p>{{ strValue }}{{ unit }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ strValue?: string, unit?: string, icon: string, valueLabel: string }>()
</script>

<style scoped lang="scss">
.measurement-box > p {
  font-size: 0.875rem;
}
.measurement-box-inner {
  border-radius: 2px;

  display: grid;
  grid-template-columns: 2rem 1fr;
  align-items: center;
  iconify-icon {
    background: var(--lg-contrast);
    border: 1px solid var(--lg-contrast);
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;;
  }
  p {
    background: var(--lg-input);
    border: 1px solid var(--lg-accent);
    border-left: 0;
  }
  & > * {
    padding: 0.25rem;
    text-align: center;
  }
}
</style>