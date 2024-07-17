import { idb, KeyBindingAction } from '@/dexie'

export async function addDefaultSettings(): Promise<any> {
  return idb.settings.put({
    theme: 'default',
    locale: navigator.language ?? 'en-US',
    font: 'default',
    showInitDialog: true,
  })
}

export async function addDefaultKeyBindings(): Promise<any> {
  return idb.keyBindings.bulkPut([
    { action: KeyBindingAction.ToggleLensFlare, key: 'L' },
    { action: KeyBindingAction.ToggleBiomes, key: 'B' },
    { action: KeyBindingAction.ToggleClouds, key: 'C' },
    { action: KeyBindingAction.ToggleAtmosphere, key: 'A' },
  ])
}
