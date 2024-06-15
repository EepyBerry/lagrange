<template>
  <tr class="field">
    <td>
      <label :for="id">
        <slot>ParameterName</slot>
      </label>
    </td>
    <td>
      <input v-if="type === 'number'"
        class="lg"
        :id="id"
        type="number"
        inputmode="numeric"
        pattern="[0-9.,]*"
        min="0"
        :step="step ?? 1"
        aria-label="Parameter input"
        v-model="lgParam">
      <input v-if="['text', 'checkbox'].includes(type)"
        class="lg"
        :id="id"
        :type="type"
        min="0"
        aria-label="Parameter input"
        v-model="lgParam">
    </td>
  </tr>
</template>

<script setup lang="ts">
const lgParam = defineModel<string | number | boolean>()
defineProps<{ id: string, type: string, step?: number }>()
</script>

<style scoped lang="scss">
tr.field {
  width: 100%;

  td {
    font-size: 0.875rem;
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
input.lg:not([type=checkbox]) {
  width: 4.5rem;
}
</style>