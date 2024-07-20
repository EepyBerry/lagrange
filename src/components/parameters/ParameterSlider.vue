<template>
  <tr class="field">
    <td>
      <label :for="id">
        <slot>ParameterName</slot>
      </label>
    </td>
    <td>
      <InputSliderElement
        class="lg"
        :iid="id"
        :min="min ?? 0"
        :max="max ?? 10"
        :step="step ?? 1"
        :disabled="disabled"
        v-model="lgParam as number"
      />
    </td>
  </tr>
</template>

<script setup lang="ts">
import InputSliderElement from '../elements/InputSliderElement.vue'
const lgParam = defineModel<string | number | boolean>()
defineProps<{ id: string; step?: number; min?: number; max?: number; disabled?: boolean }>()
</script>

<style scoped lang="scss">
tr.field {
  width: 100%;

  td {
    text-wrap: nowrap;
  }
  td:first-of-type {
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

input.lg {
  text-align: end;
}
input.lg:not([type='checkbox'], [type='radio'], [type='range']) {
  width: 3rem;
}
</style>
