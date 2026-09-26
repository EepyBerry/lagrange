<template>
  <LgvButton class="planet-feature" :disabled="!feature">
    <LgvButton
      v-if="toggleable"
      variant="icon"
      :icon="feature ? 'material-symbols:visibility-outline' : 'material-symbols:visibility-off-outline'"
      iconWidth="1.25rem"
      class="toggle"
      @click.stop="feature = !feature"
    />
    <span v-else class="filler" />
    <slot></slot>
  </LgvButton>
</template>

<script setup lang="ts">
import LgvButton from '@lib/components/base/LgvButton.vue';

const feature = defineModel<boolean>({ default: true });
defineProps<{ toggleable?: string }>();
</script>

<style scoped lang="scss">
button.planet-feature {
  width: 100%;
  padding: 0;
  background: transparent;

  display: flex;
  justify-content: flex-start;

  &.selected-feature {
    background: var(--lg-button-active);
  }

  &:not(:disabled):hover {
    background: var(--lg-button-hover);
  }
  &:not(:disabled):active {
    background: var(--lg-button-active);
  }
  &:disabled {
    background: transparent;
    color: var(--lg-text-disabled);
  }

  .filler,
  button.toggle {
    width: 2.5rem;
    height: 2.5rem;
    min-width: 2.5rem;
    min-height: 2.5rem;
  }
}
</style>
