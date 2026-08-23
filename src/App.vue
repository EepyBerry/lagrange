<template>
  <main>
    <span v-if="$route.path === '/'" class="blur" />
    <RouterView></RouterView>
  </main>
  <AppToastBar />
  <LgvFooter>
    <LgvButton
      variant="icon"
      icon="ph:info"
      icon-width="1.75rem"
      :a11y-label="$t('main.footer.about')"
      @click="infoDialog!.open()"
    />
    <LgvButton
      variant="icon"
      icon="ph:sliders"
      icon-width="1.75rem"
      :a11y-label="$t('main.footer.settings')"
      @click="settingsDialog!.open()"
    />
    <LgvLink
      variant="icon"
      link-type="external"
      href="https://github.com/EepyBerry/lagrange"
      icon="mynaui:github"
      icon-width="1.75rem"
    />
    <ExtraSpecialDayElement />
  </LgvFooter>
  <AppInitDialog
    ref="initDialog"
    :keybinds="keybinds"
    @disable-init-dialog="disableInitDialog"
    @enable-persistence="enablePersistence"
  />
  <AppAboutDialog ref="infoDialog" />
  <AppSettingsDialog ref="settingsDialog" />
</template>

<script setup lang="ts">
import AppToastBar from '@components/global/AppToastBar.vue';
import ExtraSpecialDayElement from '@components/global/extras/ExtraSpecialDayElement.vue';
import { UIEventBus } from '@core/ui-event-bus.ts';
import LgvButton from '@lib/components/base/LgvButton.vue';
import LgvLink from '@lib/components/base/LgvLink.vue';
import LgvFooter from '@lib/components/main/LgvFooter.vue';
import { useHead } from '@unhead/vue';
import { defineAsyncComponent, onMounted, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import * as DexieService from '@/core/services/dexie.service';
import { idb, type IDBKeyBinding, type IDBSettings } from '@/dexie.config';
import {
  EXTRAS_CAT_MODE,
  EXTRAS_CRT_EFFECT,
  EXTRAS_HOLOGRAM_EFFECT,
  EXTRAS_METAL_SLUG_MODE,
  EXTRAS_SPECIAL_DAYS,
} from './core/extras';
import { mapLocale } from './core/utils/utils';

const AppInitDialog = defineAsyncComponent(() => import('@components/global/dialogs/InitDialog.vue'));
const AppAboutDialog = defineAsyncComponent(() => import('@components/global/dialogs/AboutDialog.vue'));
const AppSettingsDialog = defineAsyncComponent(() => import('@components/global/dialogs/SettingsDialog.vue'));

const i18n = useI18n();
useHead({
  title: i18n.t('main.$title'),
  meta: [{ name: 'description', content: 'A procedural planet-building application!' }],
});

const initDialog: Ref<{ open: () => void; close: () => void } | null> = ref(null);
const infoDialog: Ref<{ open: () => void; close: () => void } | null> = ref(null);
const settingsDialog: Ref<{ open: () => void; close: () => void } | null> = ref(null);

const keybinds: Ref<IDBKeyBinding[]> = ref([]);
const settings: Ref<IDBSettings | undefined> = ref(undefined);

onMounted(async () => {
  // Init IndexedDB via Dexie
  await DexieService.initStoragePersistence();
  await initDexie();

  // Set locale
  const url = new URL(globalThis.location.href);
  const params = new URLSearchParams(url.search);
  const queryParams = Object.fromEntries(params);
  if (queryParams.uwu !== undefined) {
    EXTRAS_CAT_MODE.value = true;
    i18n.locale.value = 'en-UwU';
  } else if (i18n.availableLocales.includes(settings.value!.locale)) {
    i18n.locale.value = settings.value!.locale;
    await idb.settings.update(settings.value!.id, { locale: mapLocale(i18n.locale.value) });
  } else {
    i18n.locale.value = 'en-US'; // fallback
    await idb.settings.update(settings.value!.id, { locale: mapLocale(i18n.locale.value) });
  }

  // Set initial global values
  EXTRAS_CRT_EFFECT.value = settings.value!.extrasCRTEffect ?? false;
  EXTRAS_HOLOGRAM_EFFECT.value = settings.value!.extrasHologramEffect ?? false;
  EXTRAS_METAL_SLUG_MODE.value = settings.value!.extrasMetalSlugMode ?? false;
  EXTRAS_SPECIAL_DAYS.value = settings.value!.extrasShowSpecialDays ?? true;

  // Open init dialog if necessary
  if (settings.value?.showInitDialog) {
    initDialog.value?.open();
  }
});

async function initDexie() {
  settings.value = await DexieService.initSettings();
  keybinds.value = await DexieService.initKeyBindings();

  // Init HTML data (theme, font, effects)
  document.documentElement.dataset.theme = settings.value.theme;
  document.documentElement.dataset.font = settings.value.font;
  document.documentElement.dataset.effects = settings.value.enableEffects ? 'on' : 'off';
  document.documentElement.dataset.animations = settings.value.enableAnimations ? 'on' : 'off';
}

async function disableInitDialog() {
  await idb.settings.update(settings.value!.id, { showInitDialog: false }).catch((err) => console.error(err));
}

async function enablePersistence() {
  if (!navigator.storage) {
    UIEventBus.sendToastEvent('warn', 'toast.storage_failure_none', 3000);
    return;
  }
  const enabled = await navigator.storage.persist();
  if (enabled) {
    UIEventBus.sendToastEvent('success', 'toast.storage_success', 3000);
  } else {
    UIEventBus.sendToastEvent('warn', 'toast.storage_failure_rules', 3000);
  }
}
</script>

<style scoped lang="scss">
main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: transparent;
  .blur {
    z-index: 1;
    position: fixed;
    inset: 0 -4rem;
    box-shadow: inset 0 0 2.5rem 1.5rem var(--black);
    pointer-events: none;
    user-select: none;
  }
}
</style>
