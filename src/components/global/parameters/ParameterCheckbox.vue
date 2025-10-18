<template>
  <label :for="id">
    <slot>ParameterName</slot>
  </label>
  <input
    :id="id"
    v-model="lgParam"
    type="checkbox"
    class="lg"
    :true-value="trueValue"
    :false-value="falseValue"
    :disabled="disabled"
  />
</template>

<script setup lang="ts">
type AcceptedType = string | number | boolean
const lgParam = defineModel<AcceptedType>()
defineProps<{ id: string; trueValue: AcceptedType; falseValue: AcceptedType; disabled?: boolean }>()
</script>

<style scoped lang="scss">
label {
  grid-column: 1;
}
input.lg {
  grid-column: 2;
  justify-self: end;
  text-align: end;
}
</style>
