<template>
  <label :for="id">
    <slot>ParameterName</slot>
  </label>
  <InputSliderElement
    class="lg"
    :class="extras"
    :iid="id"
    :min="min ?? 0"
    :max="max ?? 10"
    :step="step ?? 1"
    :disabled="disabled"
    v-model="lgParam as number"
  />
</template>

<script setup lang="ts">
import InputSliderElement from '../elements/InputSliderElement.vue'
const lgParam = defineModel<string | number | boolean>()

type SliderExtras = 'rgb' | undefined
defineProps<{ id: string; step?: number; min?: number; max?: number; extras?: SliderExtras; disabled?: boolean }>()
</script>

<style scoped lang="scss">
label {
  grid-column: 1;
  text-wrap: nowrap;
}
input.lg {
  grid-column: 2;
  justify-self: end;
  text-align: end;
}
input.lg:not([type='checkbox'], [type='radio'], [type='range']) {
  width: 3rem;
}

@media screen and (max-width: 567px) {
  label {
    grid-column: span 2;
    margin-bottom: -0.375rem;
  }
  .lg {
    grid-column: span 2;
  }
}
</style>
