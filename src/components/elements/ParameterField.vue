<template>
  <tr class="field">
    <td>
      <slot>ParameterName</slot>
    </td>
    <td>
      <input v-if="type === 'number'" type="text" inputmode="numeric" pattern="[0-9.,]*" v-model="lgParam">
      <input v-if="['text', 'checkbox'].includes(type)" :type="type" ref="input" v-model="lgParam">
    </td>
    <td class="unit">
      {{ unit }}
    </td>
  </tr>
</template>

<script setup lang="ts">
const lgParam = defineModel<string | number | boolean>()
defineProps<{ type: string, unit?: string }>()
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
    padding-left: 4px;
    text-align: end;
  }

  td.unit {
    font-size: 0.75rem;
  }
}

input[type=text] {
  border: none;
  border-radius: 2px;
  width: 3rem;
  color: var(--lg-text);
  background: var(--lg-input);
}
</style>