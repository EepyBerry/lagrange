<template>
  <main>
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
import AppFooter from '@components/main/AppFooter.vue'
import * as DexieUtils from '@/utils/dexie-utils'
import { idb, type IDBKeyBinding, type IDBSettings } from '@/dexie.config'
import { onMounted, ref, type Ref } from 'vue'
import AppInitDialog from '@components/dialogs/AppInitDialog.vue'
import { useI18n } from 'vue-i18n'
import { mapLocale } from './utils/utils'
import { useHead } from '@unhead/vue'
import { A11Y_ANIMATE } from './core/globals'
import AppToastBar from './components/main/AppToastBar.vue'
import { EventBus } from './core/event-bus'
import { EXTRAS_CAT_MODE, EXTRAS_HOLOGRAM_MODE, EXTRAS_SPECIAL_DAYS } from './core/extras'

const i18n = useI18n()
useHead({
  title: i18n.t('main.$title'),
  meta: [{ name: 'description', content: 'A procedural planet-building application!' }],
})

const dialogInit: Ref<{ open: () => void; close: () => void } | null> = ref(null)
const keybinds: Ref<IDBKeyBinding[]> = ref([])
const settings: Ref<IDBSettings | undefined> = ref(undefined)

onMounted(async () => {
  await DexieUtils.initStoragePersistence()
  await initDexie()
  keybinds.value = await idb.keyBindings.toArray()
  settings.value = await idb.settings.limit(1).first()

  // Set locale
  const url = new URL(window.location.href)
  const params = new URLSearchParams(url.search)
  const queryParams = Object.fromEntries(params)
  if (queryParams.uwu !== undefined) {
    EXTRAS_CAT_MODE.value = true
    i18n.locale.value = 'en-UwU'
  } else if (i18n.availableLocales.includes(settings.value!.locale)) {
    i18n.locale.value = settings.value!.locale
    await idb.settings.update(settings.value!.id, { locale: mapLocale(i18n.locale.value) })
  } else {
    i18n.locale.value = 'en-US' // fallback
    await idb.settings.update(settings.value!.id, { locale: mapLocale(i18n.locale.value) })
  }

  // Set initial global values
  A11Y_ANIMATE.value = settings.value!.enableAnimations ?? true
  EXTRAS_HOLOGRAM_MODE.value = settings.value!.extrasHologramMode ?? false
  EXTRAS_SPECIAL_DAYS.value = settings.value!.extrasShowSpecialDays ?? true

  // Open init dialog if necessary
  if (settings.value?.showInitDialog) {
    dialogInit.value?.open()
  }
})

async function initDexie() {
  let settings = await idb.settings.limit(1).first()
  if (!settings) {
    console.debug('No settings found in IndexedDB, adding defaults')
    await DexieUtils.addDefaultSettings()
    settings = await idb.settings.limit(1).first()
  }

  const kb = await idb.keyBindings.limit(4).toArray()
  if (kb.length === 0) {
    console.debug('No keybinds found in IndexedDB, adding defaults')
    await DexieUtils.addDefaultKeyBindings()
  }
  document.documentElement.setAttribute('data-theme', settings!.theme ?? 'default')
  document.documentElement.setAttribute('data-font', settings!.font ?? 'default')
  document.documentElement.setAttribute('data-effects', settings!.enableEffects ? 'on' : 'off')
}

async function disableInitDialog() {
  await idb.settings.update(settings.value!.id, { showInitDialog: false }).catch((err) => console.error(err))
}

async function enablePersistence() {
  if (!navigator.storage) {
    EventBus.sendToastEvent('warn', 'toast.storage_failure_none', 3000)
    return
  }
  const enabled = await navigator.storage.persist()
  if (enabled) {
    EventBus.sendToastEvent('success', 'toast.storage_success', 3000)
  } else {
    EventBus.sendToastEvent('warn', 'toast.storage_failure_rules', 3000)
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
}
</style>
