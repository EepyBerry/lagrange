<template>
  <footer>
    <div id="footer-nav">
      <a class="lg dark"
         href="https://github.com/EepyBerry/lagrange" target="_blank" rel="noopener"
         title="GitHub repository (opens in new tab)"
         aria-label="GitHub page"
      >
        <iconify-icon icon="mingcute:github-line" width="1.5rem" aria-hidden="true" />
        <iconify-icon class="link-icon" icon="mingcute:right-small-fill" width="2rem" aria-hidden="true" />
      </a>
      <hr width="50%">
      <button class="lg dark"
              title="Settings"
              aria-label="Settings"  
              @click="settingsDialog!.open()"
      >
        <iconify-icon icon="mingcute:settings-6-line" width="1.5rem" aria-hidden="true" />
      </button>
      <button class="lg dark"
              title="About Lagrange"
              aria-label="About Lagrange"
              @click="infoDialog!.open()"
      >
        <iconify-icon icon="mingcute:information-line" width="1.5rem" aria-hidden="true" />
      </button>
    </div>
  </footer>
  <AppInfoDialog ref="infoDialog" />
  <AppSettingsDialog ref="settingsDialog" />
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import AppInfoDialog from './dialogs/AppInfoDialog.vue';
import AppSettingsDialog from './dialogs/AppSettingsDialog.vue';
const infoDialog: Ref<{ open: Function }|null> = ref(null)
const settingsDialog: Ref<{ open: Function }|null> = ref(null)

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

  #footer-nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    hr { border-color: var(--lg-accent); }
  }
}

@media screen and (max-width: 767px) {
  footer {
    padding: 0.5rem;
  }
}
</style>