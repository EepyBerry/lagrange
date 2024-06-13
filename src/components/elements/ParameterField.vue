<template>
  <tr class="field">
    <td>
      <slot>ParameterName</slot>
    </td>
    <td>
      <input v-if="type === 'number'"
        type="number"
        inputmode="numeric"
        pattern="[0-9.,]*"
        min="0"
        :step="step ?? 1"
        aria-label="Parameter input"
        v-model="lgParam">
      <input v-if="['text', 'checkbox'].includes(type)"
        :type="type"
        min="0"
        aria-label="Parameter input"
        v-model="lgParam">
    </td>
    <td class="unit">
      {{ unit }}
    </td>
  </tr>
</template>

<script setup lang="ts">
const lgParam = defineModel<string | number | boolean>()
defineProps<{ type: string, unit?: string, step?: number }>()
</script>

<style scoped lang="scss">
tr.field {
  width: 100%;

  td {
    font-size: 0.875rem;
    text-wrap: nowrap;
  }
  td:first-child {
      width: 100%;
      white-space: nowrap;
  }
  td:nth-child(2),
  td:last-child {
    width: auto;
    min-width: 10px;
    padding-left: 4px;
    text-align: end;
  }

  td.unit {
    font-size: 0.75rem;
  }
}

input {
  text-align: end;
}
input:not([type=checkbox]) {
  width: 4.5rem;
}
</style>