<template>
  <tr class="field">
    <td>
      <label :for="id">
        <slot>ParameterName</slot>
      </label>
    </td>
    <td>
      <input v-if="type === 'number'"
        :id="id"
        class="lg"
        type="number"
        :min="min ?? 0"
        :step="step ?? 1"
        aria-label="Parameter input"
        v-model="lgParam">
      <input v-if="['text', 'checkbox'].includes(type)"
        class="lg"
        :id="id"
        :type="type"
        :min="min ?? 0"
        aria-label="Parameter input"
        v-model="lgParam">
      <InputSliderElement v-if="type === 'range'"
        class="lg"
        :id="id"
        :min="min ?? 0"
        :max="max ?? 10"
        :step="step ?? 1"
        aria-label="Parameter input"
        v-model="(lgParam as number)" />
    </td>
  </tr>
</template>

<script setup lang="ts">
import InputSliderElement from '../elements/InputSliderElement.vue';
const lgParam = defineModel<string | number | boolean>()
defineProps<{ id: string, type: string, step?: number, min ?: number, max?: number }>()
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
input.lg:not([type=checkbox],[type=radio], [type=range]) {
  max-width: 3rem;
}
</style>