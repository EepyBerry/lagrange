<template>
  <tr class="field">
    <td>
      <slot>ParameterName</slot>
    </td>
    <td>
      <input v-if="type === 'number'" type="text" inputmode="numeric" pattern="[0-9.,]*"
        @keydown.backspace="emit('input')"
        @keydown.delete="emit('input')"
        @input="checkDigit">
      <input v-if="['text', 'checkbox'].includes(type)" :type="type"
        @input="emit('input')">
    </td>
    <td>
      {{ unit }}
    </td>
  </tr>
</template>

<script setup lang="ts">
const numberRgx = /^(-?\d{1,}[\\.,]?\d{1,})$/
const keyRgx = /[\d\b\\.,]/

const emit = defineEmits(['input'])
defineProps<{ type: string, unit: string }>()

function checkDigit(event: Event) {
  if (keyRgx.test((event as KeyboardEvent).key)) {
    emit('input')
  }
}
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