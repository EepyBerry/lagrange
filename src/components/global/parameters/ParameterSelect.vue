<template>
  <label :for="id">
    <slot>ParameterName</slot>
  </label>
  <LgvSelect :id="id" v-model="lgParam" :disabled="disabled" @change="$emit('change')">
    <template #options>
      <slot name="options"></slot>
    </template>
  </LgvSelect>
</template>

<script setup lang="ts">
import LgvSelect from '@/_lib/components/LgvSelect.vue';

type AcceptedType = string | number | boolean;
const lgParam = defineModel<AcceptedType>();
defineProps<{ id: string; disabled?: boolean }>();
const $emit = defineEmits(['change']);
</script>

<style scoped lang="scss">
label {
  grid-column: 1;
}
select {
  grid-column: 2;
  min-width: 12rem;
  text-align: center;
  justify-self: flex-end;
}

@media screen and (max-width: 567px) {
  select {
    width: auto;
    min-width: 0;
    text-align: center;
  }
}
</style>
