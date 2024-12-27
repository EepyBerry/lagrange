<template>
  <span class="filler"></span>
  <hr />
  <div id="footer-nav">
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
    <button
      class="lg dark"
      :title="$t('tooltip.footer_settings')"
      :aria-label="$t('a11y.footer_settings')"
      @click="settingsDialog!.open()"
    >
      <iconify-icon icon="mingcute:settings-6-line" width="1.5rem" aria-hidden="true" />
    </button>
    <button
      class="lg dark"
      :title="$t('tooltip.footer_about')"
      :aria-label="$t('a11y.footer_about')"
      @click="infoDialog!.open()"
    >
      <iconify-icon icon="mingcute:information-line" width="1.5rem" aria-hidden="true" />
    </button>
    <ExtraSpecialDayElement />
  </div>
  <AppAboutDialog ref="infoDialog" />
  <AppSettingsDialog ref="settingsDialog" />
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue'
import AppAboutDialog from '@components/dialogs/AppAboutDialog.vue'
import AppSettingsDialog from '@components/dialogs/AppSettingsDialog.vue'
import ExtraSpecialDayElement from '../extras/ExtraSpecialDayElement.vue';
const infoDialog: Ref<{ open: () => void } | null> = ref(null)
const settingsDialog: Ref<{ open: () => void } | null> = ref(null)
</script>

<style scoped lang="scss">
hr {
  margin: 0.5rem 0;
  width: 50%;
  align-self: center;
}
#footer-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;

  & > button,
  & > a {
    flex: 1;
  }
}
.filler {
  flex: 1;
}
hr {
  margin-top: 0;
}
</style>
