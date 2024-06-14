<template>
  <input ref="htmlRadio"
    type="radio"
    :id="`${name}-${id}`"
    :name="name"
    :value="value"
    v-model="lgParam">
  
  <button class="radio-button" :class="{selected: htmlRadio?.checked }" @click="select()" :aria-label="ariaLabel">
    <iconify-icon :icon="icon" width="1.25rem" aria-hidden="true" />
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
  border: none;
  padding: 0.125rem 0.5rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.radio-button.selected {
  background-color: var(--lg-button-active);
}
.radio-button:hover {
  background-color: var(--lg-button-hover);
}

input[type=radio] { display: none; }
</style>