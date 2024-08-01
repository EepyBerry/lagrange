import { idb, KeyBindingAction } from '@/dexie.config'
import { prefersReducedMotion } from './utils'
import { I18N_SUPPORTED_LANGS } from '@/i18n.config'

export async function addDefaultSettings(): Promise<any> {
  return idb.settings.put({
    theme: 'default',
    locale: (I18N_SUPPORTED_LANGS.includes(navigator.language as any) ? navigator.language : 'en-US'),
    font: 'default',
    showInitDialog: true,
    enableEffects: !prefersReducedMotion(),
    enableAnimations: !prefersReducedMotion()
  })
}

export async function addDefaultKeyBindings(): Promise<any> {
  return idb.keyBindings.bulkPut([
    { action: KeyBindingAction.ToggleLensFlare, key: 'L' },
    { action: KeyBindingAction.ToggleBiomes, key: 'B' },
    { action: KeyBindingAction.ToggleClouds, key: 'C' },
    { action: KeyBindingAction.ToggleAtmosphere, key: 'A' },
    { action: KeyBindingAction.TakeScreenshot, key: 'X' },
  ])
}

export async function clearData(): Promise<any> {
  const settings = await idb.settings.limit(1).toArray()
  const keyBindings = (await idb.keyBindings.toArray()).sort((a,b) => a.id - b.id)

  await idb.settings.update(settings[0].id, {
    theme: 'default',
    locale: (I18N_SUPPORTED_LANGS.includes(navigator.language as any) ? navigator.language : 'en-US'),
    font: 'default',
    showInitDialog: true,
    enableEffects: !prefersReducedMotion(),
    enableAnimations: !prefersReducedMotion()
  })
  await idb.keyBindings.bulkUpdate([
    { key: keyBindings[0].id, changes: { key: 'L' }},
    { key: keyBindings[1].id, changes: { key: 'B' }},
    { key: keyBindings[2].id, changes: { key: 'C' }},
    { key: keyBindings[3].id, changes: { key: 'A' }},
    { key: keyBindings[4].id, changes: { key: 'X' }},
  ])
  await idb.planets.clear()
}

export async function initStoragePersistence() {
  try {
    const persist = await tryPersistWithoutPromptingUser()
    switch (persist) {
      case "never":
        console.warn("Cannot persist storage, continuing in best-effort mode.")
        break;
      case "persisted":
        console.info("Successfully persisted storage silently!")
        break;
      case "prompt":
        console.warn("Storage not persisted, user should be prompted first")
        break;
    }
  } catch(error) {
    console.error("Failed to persist storage despite granted permission, continuing in best-effort mode.")
  }
}


/** Tries to persist storage without ever prompting user.
  @returns {Promise<string>}
    "never" In case persisting is not ever possible. Caller don't bother
      asking user for permission.
    "prompt" In case persisting would be possible if prompting user first.
    "persisted" In case this call successfully silently persisted the storage,
      or if it was already persisted.
*/
export async function tryPersistWithoutPromptingUser(): Promise<string> {
  if (!navigator.storage || !navigator.storage.persisted) {
    return "never"
  }
  let persisted = await navigator.storage.persisted()
  if (persisted) {
    return "persisted"
  }
  if (!navigator.permissions || !navigator.permissions.query) {
    return "prompt" // It MAY be successful to prompt. Don't know.
  }
  const permission = await navigator.permissions.query({
    name: "persistent-storage"
  })
  if (permission.state === "granted") {
    persisted = await navigator.storage.persist()
    if (persisted) {
      return "persisted"
    } else {
      throw new Error("Failed to persist local storage")
    }
  }
  if (permission.state === "prompt") {
    return "prompt"
  }
  return "never"
}