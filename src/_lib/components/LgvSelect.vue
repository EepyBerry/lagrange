<template>
  <select :id="id" v-model="model" class="lgv">
    <slot name="options"></slot>
  </select>
</template>

<script setup lang="ts">
defineProps<{ id: string }>()
const model = defineModel<unknown>()
</script>

<style lang="scss">
select.lgv {
  background: var(--lg-input);
  border: 1px solid var(--lg-accent);
  border-radius: 2px;
  padding: 0 0.75rem;
  color: var(--lg-text);
  min-height: 2rem;
  font-family: inherit;
  text-overflow: ellipsis;
  cursor: pointer;

  &:hover, &:focus { border-color: var(--lg-contrast); }
  & > option:hover {
    cursor: pointer;
  }
}
select.lgv[disabled] {
  background: var(--lg-input-disabled);
  border: 1px solid var(--lg-border-disabled);
  cursor: not-allowed;
}

</style>