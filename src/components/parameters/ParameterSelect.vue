<template>
  <tr class="field">
    <td>
      <label :for="id">
        <slot>ParameterName</slot>
      </label>
    </td>
    <td>
      <select class="lg" :id="id" :disabled="disabled" v-model="lgParam" @change="$emit('change')">
        <slot name="options"></slot>
      </select>
    </td>
  </tr>
</template>

<script setup lang="ts">
type AcceptedType = string | number | boolean
const lgParam = defineModel<AcceptedType>()
defineProps<{ id: string; disabled?: boolean }>()
const $emit = defineEmits(['change'])
</script>

<style scoped lang="scss">
tr.field {
  width: 100%;

  td {
    text-wrap: nowrap;
  }
  td:first-of-type {
    width: auto;
    white-space: nowrap;
  }
  td:last-of-type {
    width: 100%;
    min-width: 10px;
    padding-left: 4px;
    text-align: end;
  }

  td.unit {
    font-size: 0.75rem;
  }
}
select.lg {
  min-width: 16rem;
  text-align: center;
}

@media screen and (max-width: 567px) {
  #dialog-settings {
    min-width: 0;
    width: 100%;
  }
  select.lg {
    min-width: 0;
    width: 100%;
    text-align: center;
  }
}
</style>
