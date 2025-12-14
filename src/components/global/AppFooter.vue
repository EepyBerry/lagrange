<template>
  <footer v-show="$route.name !== 'page-not-found'" id="app-footer">
    <span class="footer-corner lb" />
    <span class="footer-corner l" />
    <span class="footer-corner rb" />
    <span class="footer-corner r" />
    <div id="app-footer-nav">
      <LgvButton
        variant="dark"
        icon="mingcute:information-line"
        :a11y-label="$t('a11y.footer_about')"
        @click="infoDialog!.open()"
      />
      <LgvButton
        variant="dark"
        icon="mingcute:settings-6-line"
        :a11y-label="$t('a11y.footer_settings')"
        @click="settingsDialog!.open()"
      />
      <LgvLink
        variant="dark"
        link-type="external"
        href="https://github.com/EepyBerry/lagrange"
        icon="mingcute:github-line"
      />
      <ExtraSpecialDayElement />
    </div>
  </footer>
  <AppAboutDialog ref="infoDialog" />
  <AppSettingsDialog ref="settingsDialog" />
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import AppAboutDialog from '@components/global/dialogs/AboutDialog.vue';
import AppSettingsDialog from '@components/global/dialogs/SettingsDialog.vue';
import ExtraSpecialDayElement from '@components/global/extras/ExtraSpecialDayElement.vue';
import LgvButton from '@/_lib/components/LgvButton.vue';
import LgvLink from '@/_lib/components/LgvLink.vue';
const infoDialog: Ref<{ open: () => void; close: () => void } | null> = ref(null);
const settingsDialog: Ref<{ open: () => void; close: () => void } | null> = ref(null);
</script>

<style lang="scss">
#app-footer {
  position: fixed;
  bottom: 0;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  align-self: center;
  gap: 1rem;
  z-index: 5;

  background: var(--lg-panel);
  border: 1px solid var(--lg-accent);
  border-bottom: 0;

  .footer-corner {
    position: absolute;
    bottom: 0;
    width: 0;
    height: 0;
    border-style: solid;

    $corner-width: 1.5rem;
    $corner-height: 3.5rem;
    $corner-border-width: calc(1.5rem + 1px);
    $corner-border-height: calc(3.5rem + 1px);

    &.lb {
      left: calc(0px - $corner-border-width);
      border-width: 0 0 $corner-border-height $corner-width;
      border-color: transparent transparent var(--lg-accent) transparent;
    }
    &.l {
      left: -$corner-width;
      border-width: 0 0 $corner-height $corner-width;
      border-color: transparent transparent var(--lg-panel) transparent;
    }
    &.rb {
      right: calc(0px - $corner-border-width);
      border-width: $corner-border-height 0 0 $corner-width;
      border-color: transparent transparent transparent var(--lg-accent);
    }
    &.r {
      right: -$corner-width;
      border-width: $corner-height 0 0 $corner-width;
      border-color: transparent transparent transparent var(--lg-panel);
    }
  }
  #app-footer-nav {
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
  #app-footer {
    align-self: flex-end;
    border-top-right-radius: 0;
    border-right: 0;
  }
}

@media screen and (max-width: 767px) {
  #app-footer {
    display: none;
  }
}
</style>
