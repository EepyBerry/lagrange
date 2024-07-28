import { idb, KeyBindingAction } from '@/dexie.config'

export async function addDefaultSettings(): Promise<any> {
  const disableAnims = window.matchMedia(`(prefers-reduced-motion: reduce)`).matches || window.matchMedia(`(prefers-reduced-motion: reduce)`).matches
  return idb.settings.put({
    theme: 'default',
    locale: navigator.language ?? 'en-US',
    font: 'default',
    showInitDialog: true,
    enableAnimations: !disableAnims
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
