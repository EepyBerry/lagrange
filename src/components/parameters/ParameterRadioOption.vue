<template>
  <input ref="htmlRadio"
    class="lg"
    type="radio"
    :id="`${name}-${id}`"
    :name="name"
    :value="value"
    v-model="lgParam">
  
  <button class="lg radio-button" :class="{selected: htmlRadio?.checked }" @click="select()" :aria-label="ariaLabel">
    <iconify-icon v-if="icon" :icon="icon" width="1.25rem" aria-hidden="true" />
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';

defineProps<{ name: string, id: string, value: any , icon?: string, ariaLabel: string }>()
const lgParam = defineModel<string | number | boolean>()
const htmlRadio: Ref<HTMLInputElement | null> = ref(null)

function select() {
  (htmlRadio.value as HTMLInputElement).click()
}
</script>

<style scoped lang="scss">
.radio-button {
  background-color: var(--lg-button);
  color: var(--lg-text);
  padding: 0 0.5rem;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  cursor: pointer;
}
.radio-button.selected {
  background-color: var(--lg-button-active);
}
.radio-button:hover {
  background-color: var(--lg-button-hover);
}

input.lg[type=radio] { display: none; }
</style>