<template>
  <footer>
    <SVGAppLogo aria-label="Lagrange logo" />
  </footer>
</template>

<script setup lang="ts">
import SVGAppLogo from './svg/SVGAppLogo.vue';
</script>

<style lang="scss">
footer {
  position: absolute;
  inset: auto 0 0 auto;
  padding: 1rem;
  pointer-events: none;

  #app-logo {
    width: clamp(160px, 10rem + 5vw, 25vw);
  }
}
</style>