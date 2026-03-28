import { idb, KeyBindingAction, type IDBSettings, type IDBKeyBinding } from '@/dexie.config';
import { I18N_SUPPORTED_LANGS } from '@/i18n.config';
import { prefersReducedMotion } from '../utils/utils';

export async function initSettings(): Promise<IDBSettings> {
  const settings = await idb.settings.limit(1).first();
  await idb.settings.upsert(1, {
    // general
    theme: settings?.theme ?? 'default',
    locale: settings?.locale ?? (navigator.language in I18N_SUPPORTED_LANGS ? navigator.language : 'en-US'),
    font: settings?.font ?? 'default',
    showInitDialog: settings?.showInitDialog ?? true,
    // rendering
    renderingBackend: settings?.renderingBackend ?? 'webgl',
    skybox: settings?.skybox ?? 'deepspace',
    // baking
    bakingResolution: settings?.bakingResolution ?? 2048,
    bakingPixelize: settings?.bakingPixelize ?? false,
    // accessibility
    enableEffects: settings?.enableEffects ?? !prefersReducedMotion(),
    enableAnimations: settings?.enableAnimations ?? !prefersReducedMotion(),
    // extras
    extrasCRTEffect: settings?.extrasCRTEffect ?? false,
    extrasHologramEffect: settings?.extrasHologramEffect ?? false,
    extrasMetalSlugMode: settings?.extrasMetalSlugMode ?? false,
    extrasShowSpecialDays: settings?.extrasShowSpecialDays ?? true,
  });
  return (await idb.settings.limit(1).first()) as IDBSettings;
}

export async function initKeyBindings(): Promise<IDBKeyBinding[]> {
  const keybinds = await idb.keyBindings.toArray();
  await idb.keyBindings.upsert(1, {
    action: KeyBindingAction.ToggleLensFlare,
    key: tryGetKeyFromBinding(keybinds, 1) ?? 'L',
  });
  await idb.keyBindings.upsert(2, {
    action: KeyBindingAction.ToggleBiomes,
    key: tryGetKeyFromBinding(keybinds, 2) ?? 'B',
  });
  await idb.keyBindings.upsert(3, {
    action: KeyBindingAction.ToggleClouds,
    key: tryGetKeyFromBinding(keybinds, 3) ?? 'C',
  });
  await idb.keyBindings.upsert(4, {
    action: KeyBindingAction.ToggleAtmosphere,
    key: tryGetKeyFromBinding(keybinds, 4) ?? 'A',
  });
  await idb.keyBindings.upsert(5, {
    action: KeyBindingAction.TakeScreenshot,
    key: tryGetKeyFromBinding(keybinds, 5) ?? 'X',
  });
  await idb.keyBindings.upsert(6, {
    action: KeyBindingAction.CameraRotate,
    key: tryGetKeyFromBinding(keybinds, 6) ?? 'MOUSE_LEFT',
  });
  await idb.keyBindings.upsert(7, {
    action: KeyBindingAction.CameraDolly,
    key: tryGetKeyFromBinding(keybinds, 7) ?? 'MOUSE_MIDDLE',
  });
  await idb.keyBindings.upsert(8, {
    action: KeyBindingAction.CameraPan,
    key: tryGetKeyFromBinding(keybinds, 8) ?? 'MOUSE_RIGHT',
  });
  await idb.keyBindings.upsert(9, {
    action: KeyBindingAction.StepDollyIn,
    key: tryGetKeyFromBinding(keybinds, 9) ?? '+',
  });
  await idb.keyBindings.upsert(10, {
    action: KeyBindingAction.StepDollyOut,
    key: tryGetKeyFromBinding(keybinds, 10) ?? '-',
  });
  return idb.keyBindings.toArray();
}
function tryGetKeyFromBinding(keybinds: IDBKeyBinding[], id: number): string | undefined {
  return keybinds.find((keybind) => keybind.id === id)?.key;
}

export async function setRenderingBackendFallback() {
  const settings = await idb.settings.limit(1).first();
  idb.settings.update(settings!.id, {
    renderingBackend: 'webgl',
  });
}

export async function clearData(): Promise<void> {
  const settings = await idb.settings.limit(1).toArray();
  await idb.settings.update(settings[0].id, {
    // general
    theme: 'default',
    locale: navigator.language in I18N_SUPPORTED_LANGS ? navigator.language : 'en-US',
    font: 'default',
    showInitDialog: true,
    // rendering
    renderingBackend: 'webgl',
    skybox: 'deepspace',
    // baking
    bakingResolution: 2048,
    bakingPixelize: false,
    // accessibility
    enableEffects: !prefersReducedMotion(),
    enableAnimations: !prefersReducedMotion(),
    // extras
    extrasCRTEffect: false,
    extrasHologramEffect: false,
    extrasMetalSlugMode: false,
  });
  await idb.keyBindings.clear();
  await initKeyBindings();
  await idb.planets.clear();
}

export async function initStoragePersistence() {
  try {
    const persist = await tryPersistWithoutPromptingUser();
    switch (persist) {
      case 'never':
        console.warn('<Lagrange> Cannot persist storage, continuing in best-effort mode.');
        break;
      case 'persisted':
        console.info('<Lagrange> Successfully persisted storage silently!');
        break;
      case 'prompt':
        console.warn('<Lagrange> Storage not persisted, user should be prompted first');
        break;
    }
  } catch (error) {
    console.error(
      '<Lagrange> Failed to persist storage despite granted permission, continuing in best-effort mode.',
      error,
    );
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
  if (!navigator.storage?.persisted) {
    return 'never';
  }
  let persisted = await navigator.storage.persisted();
  if (persisted) {
    return 'persisted';
  }
  if (!navigator.permissions?.query) {
    return 'prompt'; // It MAY be successful to prompt. Don't know.
  }
  const permission = await navigator.permissions.query({
    name: 'persistent-storage',
  });
  if (permission.state === 'granted') {
    persisted = await navigator.storage.persist();
    if (persisted) {
      return 'persisted';
    } else {
      throw new Error('Failed to persist local storage');
    }
  }
  if (permission.state === 'prompt') {
    return 'prompt';
  }
  return 'never';
}
