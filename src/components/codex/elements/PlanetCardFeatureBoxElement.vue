<template>
  <div class="planet-feature-box" :class="{ active }">
    <iconify-icon
      inline
      :icon="icon"
      width="1.25rem"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{ icon: string, active?: boolean }>()
</script>

<style scoped lang="scss">
.planet-feature-box {
  flex: 1;
  min-height: 2rem;
  background: var(--lg-accent);
  border: 1px solid var(--lg-accent);
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: help;

  iconify-icon {
    min-width: 1.5rem;
  }

  &:not(.active) {
    background: var(--lg-panel);
    align-items: flex-end;
    iconify-icon {
      opacity: 0.375;
      padding-bottom: 0.25rem;
    }
  }
}
</style>