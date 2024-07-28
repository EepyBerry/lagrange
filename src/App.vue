<template>
  <main>
    <RouterView></RouterView>
  </main>
  <AppFooter />
  <AppInitDialog ref="dialogInit" :keybinds="keybinds" @disable-init-dialog="disableInitDialog" />
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

const i18n = useI18n()
useHead({
  title: i18n.t('main.$title'),
  meta: [{ name: 'description', content: 'A procedural planet-building application!' }],
})

const dialogInit: Ref<{ open: Function; close: Function } | null> = ref(null)
const keybinds: Ref<IDBKeyBinding[]> = ref([])
const settings: Ref<IDBSettings | undefined> = ref(undefined)

onMounted(async () => {
  await initDexie()
  keybinds.value = await idb.keyBindings.limit(4).toArray()
  settings.value = await idb.settings.limit(1).first()

  // Set locale
  const url = new URL(window.location.href)
  const params = new URLSearchParams(url.search)
  const queryParams = Object.fromEntries(params)
  if (queryParams.uwu !== undefined) {
    i18n.locale.value = 'en-UwU'
  } else if (i18n.availableLocales.includes(settings.value?.locale!)) {
    i18n.locale.value = settings.value?.locale!
  } else {
    i18n.locale.value = 'en-US' // fallback
  }
  await idb.settings.update(settings.value!.id, { locale: mapLocale(i18n.locale.value) })

  // Set initial global values
  A11Y_ANIMATE.value = settings.value?.enableAnimations!

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
  }

  let kb = await idb.keyBindings.limit(4).toArray()
  if (kb.length === 0) {
    console.debug('No keybinds found in IndexedDB, adding defaults')
    await DexieUtils.addDefaultKeyBindings()
  }
  document.documentElement.setAttribute('data-theme', settings?.theme ?? 'default')
  document.documentElement.setAttribute('data-font', settings?.font ?? 'default')
}

async function disableInitDialog() {
  await idb.settings.update(settings.value!.id, { showInitDialog: false }).catch((err) => console.error(err))
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
