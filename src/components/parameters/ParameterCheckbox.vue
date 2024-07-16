<template>
  <tr class="field">
    <td>
      <label :for="id">
        <slot>ParameterName</slot>
      </label>
    </td>
    <td>
      <input type="checkbox"
        class="lg"
        :id="id"
        :true-value="trueValue"
        :false-value="falseValue"
        :disabled="disabled"
        v-model="lgParam">
    </td>
  </tr>
</template>

<script setup lang="ts">
type AcceptedType = string | number | boolean
const lgParam = defineModel<AcceptedType>()
defineProps<{ id: string, trueValue: AcceptedType, falseValue: AcceptedType, disabled?: boolean }>()
</script>

<style scoped lang="scss">
tr.field {
  width: 100%;

  td {
    text-wrap: nowrap;
  }
  td:first-of-type {
    width: 100%;
    white-space: nowrap;
  }
  td:last-of-type {
    width: auto;
    min-width: 10px;
    padding-left: 4px;
    text-align: end;
  }

  td.unit {
    font-size: 0.75rem;
  }
}
input.lg {
  text-align: end;
}
</style>