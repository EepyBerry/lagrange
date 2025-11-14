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

  <LgvButton
    class="sm radio-button"
    :class="{ selected: value === lgParam }"
    :aria-label="buttonAriaLabel"
    :icon="icon"
    :title="title"
    :disabled="disabled"
    @click="select()"
  >
    <slot></slot>
  </LgvButton>
</template>

<script setup lang="ts">
import LgvButton from '@/_lib/components/LgvButton.vue';
import { ref, useTemplateRef, type Ref } from 'vue'

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
const htmlRadio = useTemplateRef('htmlRadio')

function select() {
  ;(htmlRadio.value as HTMLInputElement).click()
}
</script>

<style scoped lang="scss">
.radio-button {
  flex: 1;
  height: 100%;
  padding: 0 0.75rem;
  &.selected { background: var(--lg-button-active); cursor: default; }
}

input[type='radio'] {
  display: none;
}

@media screen and (max-width: 1023px) {
  .radio-button { font-size: 0.875rem; }
}
</style>
