<template>
  <main>
    <span v-if="$route.path === '/'" class="blur" />
    <RouterView></RouterView>
  </main>
  <AppToastBar />
  <AppFooter />
  <AppInitDialog
    ref="dialogInit"
    :keybinds="keybinds"
    @disable-init-dialog="disableInitDialog"
    @enable-persistence="enablePersistence"
  />
</template>

<script setup lang="ts">
import AppFooter from '@components/global/AppFooter.vue';
import AppToastBar from '@components/global/AppToastBar.vue';
import AppInitDialog from '@components/global/dialogs/InitDialog.vue';
import { useHead } from '@unhead/vue';
import { onMounted, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import * as DexieService from '@/core/services/dexie.service';
import { idb, type IDBKeyBinding, type IDBSettings } from '@/dexie.config';
import { EventBus } from './core/event-bus';
import {
  EXTRAS_CAT_MODE,
  EXTRAS_CRT_EFFECT,
  EXTRAS_HOLOGRAM_EFFECT,
  EXTRAS_METAL_SLUG_MODE,
  EXTRAS_SPECIAL_DAYS,
} from './core/extras';
import { mapLocale } from './core/utils/utils';

const i18n = useI18n();
useHead({
  title: i18n.t('main.$title'),
  meta: [{ name: 'description', content: 'A procedural planet-building application!' }],
});

const dialogInit: Ref<{ open: () => void; close: () => void } | null> = ref(null);
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
    dialogInit.value?.open();
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
    EventBus.sendToastEvent('warn', 'toast.storage_failure_none', 3000);
    return;
  }
  const enabled = await navigator.storage.persist();
  if (enabled) {
    EventBus.sendToastEvent('success', 'toast.storage_success', 3000);
  } else {
    EventBus.sendToastEvent('warn', 'toast.storage_failure_rules', 3000);
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
