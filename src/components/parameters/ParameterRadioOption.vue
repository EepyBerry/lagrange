<template>
  <input
    ref="htmlRadio"
    class="lg"
    type="radio"
    :id="`${name}-${id}`"
    :name="name"
    :value="value"
    :checked="value === lgParam"
    v-model="lgParam"
  />

  <button
    class="lg radio-button"
    :class="{ selected: value === lgParam }"
    @click="select()"
    :aria-label="ariaLabel"
    :title="title"
  >
    <iconify-icon v-if="icon" :icon="icon" width="1.25rem" aria-hidden="true" />
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue'

defineProps<{ name: string; id: string; value: any; icon?: string; ariaLabel: string; title?: string }>()
const lgParam = defineModel<string | number | boolean>()
const htmlRadio: Ref<HTMLInputElement | null> = ref(null)

function select() {
  ;(htmlRadio.value as HTMLInputElement).click()
}
</script>

<style scoped lang="scss">
.radio-button {
  background: var(--lg-button);
  color: var(--lg-text);
  padding: 0 0.5rem;
  border: none;
  border-radius: 0;
  flex-grow: 1;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  cursor: pointer;

  iconify-icon {
    width: 1.25rem;
    height: 1.25rem;
  }
}
.radio-button.selected {
  background: var(--lg-button-active);
}
.radio-button:hover {
  background: var(--lg-button-hover);
}

input.lg[type='radio'] {
  display: none;
}

@media screen and (max-width: 1023px) {
  .radio-button {
    font-size: 0.875rem;
  }
}
</style>
