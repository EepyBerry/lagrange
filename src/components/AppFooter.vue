<template>
  <footer>
    <SVGAppLogo aria-label="Lagrange logo" />
    <div id="footer-nav">
      <a href="https://github.com/EepyBerry/lagrange" target="_blank" rel="noopener" class="lg dark">
        <iconify-icon icon="mingcute:github-line" width="1.5rem" aria-hidden="true" />
        <iconify-icon class="link-icon" icon="mingcute:right-line" width="1.5rem" aria-hidden="true" />
      </a>
      <hr width="50%">
      <button class="lg dark">
        <iconify-icon icon="mingcute:settings-6-line" width="1.5rem" aria-hidden="true" />
      </button>
      <button class="lg dark">
        <iconify-icon icon="mingcute:information-line" width="1.5rem" aria-hidden="true" />
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
    align-items: center;
    justify-content: center;
    gap: 0.375rem;

    hr { border-color: var(--lg-accent); }
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