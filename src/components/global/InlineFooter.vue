<template>
  <span class="filler"></span>
  <hr />
  <div id="footer-nav">
    <LgvButton
      variant="dark"
      icon="mingcute:information-line"
      :title="$t('tooltip.footer_about')"
      :a11y-label="$t('a11y.footer_about')"
      @click="infoDialog!.open()"
    />
    <LgvButton
      variant="dark"
      icon="mingcute:settings-6-line"
      :title="$t('tooltip.footer_settings')"
      :a11y-label="$t('a11y.footer_settings')"
      @click="settingsDialog!.open()"
    />
    <LgvLink
      variant="dark"
      link-type="external"
      href="https://github.com/EepyBerry/lagrange"
      icon="mingcute:github-line"
      :title="$t('tooltip.footer_github')"
    />
    <ExtraSpecialDayElement />
  </div>
  <AppAboutDialog ref="infoDialog" />
  <AppSettingsDialog ref="settingsDialog" />
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue'
import AppAboutDialog from '@components/global/dialogs/AboutDialog.vue'
import AppSettingsDialog from '@components/global/dialogs/SettingsDialog.vue'
import ExtraSpecialDayElement from '@components/global/extras/ExtraSpecialDayElement.vue'
import LgvButton from '@/_lib/components/LgvButton.vue'
import LgvLink from '@/_lib/components/LgvLink.vue'

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
  z-index: 15;
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
