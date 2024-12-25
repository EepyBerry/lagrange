<template>
  <footer v-show="$route.name !== 'page-not-found'" :class="{ transparent: $route.name !== 'codex' }">
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
      <div v-if="checkSpecialDay()" class="special-day-box" :title="$t(checkSpecialDay()!.translationKey)">
        <iconify-icon :icon="checkSpecialDay()!.emoji" width="1.75rem" aria-hidden="true" />
      </div>
    </div>
  </footer>
  <AppAboutDialog ref="infoDialog" />
  <AppSettingsDialog ref="settingsDialog" />
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue'
import AppAboutDialog from '@components/dialogs/AppAboutDialog.vue'
import AppSettingsDialog from '@components/dialogs/AppSettingsDialog.vue'
import { checkSpecialDay } from '@/core/extras';
const infoDialog: Ref<{ open: () => void; close: () => void } | null> = ref(null)
const settingsDialog: Ref<{ open: () => void; close: () => void } | null> = ref(null)
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
footer:not(.transparent) {
  backdrop-filter: blur(8px) brightness(25%);
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
@media screen and (max-width: 1199px) {
  footer,
  footer:not(.transparent) {
    padding: 0.5rem;
    align-self: flex-end;
    border-top-right-radius: 0;
  }
}

@media screen and (max-width: 767px) {
  footer,
  footer:not(.transparent) {
    display: none;
  }
}
</style>
