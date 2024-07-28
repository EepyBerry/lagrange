import { idb, KeyBindingAction } from '@/dexie.config'
import { prefersReducedMotion } from './utils'

export async function addDefaultSettings(): Promise<any> {
  return idb.settings.put({
    theme: 'default',
    locale: navigator.language ?? 'en-US',
    font: 'default',
    showInitDialog: true,
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
