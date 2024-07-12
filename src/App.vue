<template>
  <main>
    <RouterView></RouterView>
  </main>
  <AppFooter />
  <AppInitDialog ref="dialogInit" :keybinds="keybinds" @disable-init-dialog="disableInitDialog" />
</template>

<script setup lang="ts">
import AppFooter from './components/AppFooter.vue';
import * as DexieUtils from '@/utils/dexie-utils';
import { idb, type IDBKeyBinding, type IDBSettings } from '@/dexie';
import { onMounted, ref, type Ref } from 'vue';
import AppInitDialog from './components/dialogs/AppInitDialog.vue';

const dialogInit: Ref<{ open: Function, close: Function }|null> = ref(null)
const keybinds: Ref<IDBKeyBinding[]> = ref([])
const settings: Ref<IDBSettings|undefined> = ref(undefined)

onMounted(async () => {
  await initDexie()
  keybinds.value = await idb.keyBindings.limit(4).toArray()
  settings.value = await idb.settings.limit(1).first()
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
  await idb.settings
    .update(settings.value!.id, { showInitDialog: false })
    .catch(err => console.error(err))
}
</script>

<style scoped lang="scss">
</style>
