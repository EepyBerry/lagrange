<template>
  <tr class="field">
    <td>
      <slot>ParameterName</slot>
    </td>
    <td colspan="2">
      <template v-for="(opt, idx) in options" :key="opt">
        <label :for="`group-${idx}`"></label>
        <input 
          class="native-radio"
          type="radio"
          :id="`group-${idx}`"
          :name="group"
          :value="opt"
          v-model="lgParam">
      </template>
    </td>
  </tr>
</template>

<script setup lang="ts">
const lgParam = defineModel<string | number | boolean>()
defineProps<{ group: string, options: any[] }>()
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