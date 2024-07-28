<template>
  <footer>
    <div id="footer-nav">
      <button
        class="lg dark"
        :title="$t('tooltip.footer_about')"
        :aria-label="$t('a11y.footer_about')"
        @click="infoDialog!.open()"
      >
        <iconify-icon icon="mingcute:information-line" width="1.5rem" aria-hidden="true" />
      </button>
      <hr />
      <button
        class="lg dark"
        :title="$t('tooltip.footer_settings')"
        :aria-label="$t('a11y.footer_settings')"
        @click="settingsDialog!.open()"
      >
        <iconify-icon icon="mingcute:settings-6-line" width="1.5rem" aria-hidden="true" />
      </button>
      <hr />
      <a
        class="lg dark"
        href="https://github.com/EepyBerry/lagrange"
        target="_blank"
        rel="noopener"
        :title="$t('tooltip.footer_github')"
        :aria-label="$t('a11y.footer_github')"
      >
        <iconify-icon icon="mingcute:github-line" width="1.5rem" aria-hidden="true" />
        <iconify-icon class="link-icon" icon="mingcute:right-small-fill" width="2rem" aria-hidden="true" />
      </a>
    </div>
  </footer>
  <AppAboutDialog ref="infoDialog" />
  <AppSettingsDialog ref="settingsDialog" />
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue'
import AppAboutDialog from '@components/dialogs/AppAboutDialog.vue'
import AppSettingsDialog from '@components/dialogs/AppSettingsDialog.vue'
const infoDialog: Ref<{ open: Function } | null> = ref(null)
const settingsDialog: Ref<{ open: Function } | null> = ref(null)
</script>

<style lang="scss">
footer {
  position: fixed;
  bottom: 0;
  padding: 1rem;
  display: flex;
  align-items: flex-end;
  align-self: center;
  gap: 1rem;
  z-index: 5;

  #footer-nav {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    hr {
      height: 1.5rem;
      border-color: var(--lg-accent);
    }
  }
}
@media screen and (max-width: 1199px) {
  footer {
    padding: 0.5rem;
    align-self: flex-end;
  }
}

@media screen and (max-width: 767px) {
  footer {
    display: none;
  }
}
</style>
