<template>
  <label :for="id">
    <slot>ParameterName</slot>
  </label>
  <select :id="id" v-model="lgParam" class="lg" :disabled="disabled" @change="$emit('change')">
    <slot name="options"></slot>
  </select>
</template>

<script setup lang="ts">
type AcceptedType = string | number | boolean
const lgParam = defineModel<AcceptedType>()
defineProps<{ id: string; disabled?: boolean }>()
const $emit = defineEmits(['change'])
</script>

<style scoped lang="scss">
label {
  grid-column: 1;
}
select.lg {
  grid-column: 2;
  min-width: 16rem;
  text-align: center;
}

@media screen and (max-width: 567px) {
  select.lg {
    min-width: 0;
    width: 100%;
    text-align: center;
  }
}
</style>
