<template>
  <footer>
    <SVGAppLogo aria-label="Lagrange logo" />
    <div id="footer-nav">
      <a href="https://github.com/EepyBerry/lagrange" target="_blank" rel="noopener" class="lg dark">
        <iconify-icon class="spinner-icon" icon="mingcute:github-line" width="1.5rem" aria-hidden="true" />
      </a>
      <button class="lg dark">
        <iconify-icon class="spinner-icon" icon="mingcute:settings-6-line" width="1.5rem" aria-hidden="true" />
      </button>
      <button class="lg dark">
        <iconify-icon class="spinner-icon" icon="mingcute:information-line" width="1.5rem" aria-hidden="true" />
      </button>
    </div>
  </footer>
</template>

<script setup lang="ts">
import SVGAppLogo from './svg/SVGAppLogo.vue';
import SVGProgressIcon from './svg/SVGProgressIcon.vue';
</script>

<style lang="scss">
footer {
  position: absolute;
  inset: auto 0 0 auto;
  padding: 1rem;
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  z-index: 5;

  #app-logo {
    width: clamp(160px, 10rem + 5vw, 25vw);
    grid-column: 1;
    grid-row: span 3;
  }
  #footer-nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media screen and (max-width: 767px) {
  footer {
    #app-logo {
      display: none;
    }
  }
}
</style>