<template>
  <label :for="id">
    <slot>ParameterName</slot>
  </label>
  <!--suppress HtmlUnknownAttribute (true-value and false-value exist but aren't recognized properly) -->
  <input
    :id="id"
    type="checkbox"
    v-model="lgParam"
    :true-value="trueValue"
    :false-value="falseValue"
    :disabled="disabled"
  />
</template>

<script setup lang="ts">
type AcceptedType = string | number | boolean;
const lgParam = defineModel<AcceptedType>();
defineProps<{ id: string; trueValue: AcceptedType; falseValue: AcceptedType; disabled?: boolean }>();
</script>

<style scoped lang="scss">
label {
  grid-column: 1;
}
input {
  grid-column: 2;
  justify-self: end;
  text-align: end;
  &:hover {
    cursor: pointer;
  }
}
</style>
