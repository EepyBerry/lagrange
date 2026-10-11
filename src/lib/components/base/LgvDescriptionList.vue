<script setup lang="ts"></script>
<template>
  <dl class="lgv">
    <slot></slot>
  </dl>
</template>

<style scoped lang="scss">
dl.lgv {
  flex-grow: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  & > :slotted(.description) {
    flex: 1;
  }
  & > :slotted(.description:not(:last-child)),
  :slotted(.description:not(:last-child)) {
    border-bottom: 1px solid var(--lg-accent);
  }
}
</style>
