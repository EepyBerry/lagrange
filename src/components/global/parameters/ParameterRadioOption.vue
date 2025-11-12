<template>
  <input
    :id="`${name}-${id}`"
    ref="htmlRadio"
    v-model="lgParam"
    class="lg"
    type="radio"
    :name="name"
    :value="value"
    :checked="value === lgParam"
    :disabled="disabled"
  />

  <button
    class="radio-button"
    :class="{ selected: value === lgParam }"
    :aria-label="buttonAriaLabel"
    :title="title"
    :disabled="disabled"
    @click="select()"
  >
    <iconify-icon v-if="icon" :icon="icon" width="1.25rem" aria-hidden="true" />
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue'

defineProps<{
  name: string
  id: string
  value: string | number | boolean | object
  icon?: string
  buttonAriaLabel: string
  title?: string
  disabled?: boolean
}>()
const lgParam = defineModel<string | number | boolean>()
const htmlRadio: Ref<HTMLInputElement | null> = ref(null)

function select() {
  ;(htmlRadio.value as HTMLInputElement).click()
}
</script>

<style scoped lang="scss">
.radio-button {
  flex-grow: 1;
  height: 100%;
  padding: 0 0.5rem;

  background: var(--lg-button);
  color: var(--lg-text);
  border: none;
  border-radius: 0;
  font-family: inherit;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;

  iconify-icon {
    width: 1.25rem;
    height: 1.25rem;
  }
}
.radio-button.selected {
  background: var(--lg-button-active);
}
.radio-button:not(:disabled):hover {
  background: var(--lg-button-hover);
}

input[type='radio'] {
  display: none;
}

@media screen and (max-width: 1023px) {
  .radio-button {
    font-size: 0.875rem;
  }
}
</style>
