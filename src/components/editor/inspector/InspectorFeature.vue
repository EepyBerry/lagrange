<template>
  <div class="feature-container">
    <LgvButton
      v-if="toggleable"
      variant="icon"
      :icon="feature ? 'material-symbols:visibility-outline' : 'material-symbols:visibility-off-outline'"
      iconWidth="1.25rem"
      class="toggle"
      @click.stop="feature = !feature"
      :a11y-label="$t('a11y.action_toggle_feature')"
    />
    <span v-else class="filler" />

    <LgvButton class="feature" :disabled="!feature">
      <slot></slot>
    </LgvButton>
  </div>
</template>

<script setup lang="ts">
import LgvButton from '@lib/components/base/LgvButton.vue';

const feature = defineModel<boolean>({ default: true });
defineProps<{ toggleable?: string }>();
</script>

<style scoped lang="scss">
.feature-container {
  display: grid;
  grid-template-columns: 2.5rem 1fr;

  .filler,
  button.toggle {
    grid-column: 1;
    width: 2.5rem;
    height: 2.5rem;
    min-width: 2.5rem;
    min-height: 2.5rem;
    border-right: var(--lg-var-border-width) solid var(--lg-accent);
  }

  button.feature {
    grid-column: 2;
    width: 100%;
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
  }
}
</style>
