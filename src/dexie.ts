// db.ts
import Dexie, { type EntityTable } from 'dexie';

enum KeyBindingAction {
  ToggleLensFlare = 'toggle-lens-flare',
  ToggleClouds = 'toggle-clouds',
  ToggleAtmosphere = 'toggle-atmosphere',
  ToggleBiomes = 'toggle-biomes'
}

interface IDBKeyBinding {
  id: number
  action: KeyBindingAction
  key: string
}

interface IDBSettings {
  id: number
  theme: string
  font: string
  showInitDialog?: boolean
}

const idb = new Dexie('LagrangeIDB', { autoOpen: true }) as Dexie & {
  keyBindings: EntityTable<IDBKeyBinding, 'id'>,
  settings: EntityTable<IDBSettings, 'id'>
};

// Schema declaration:
idb.version(1).stores({
  keyBindings: '++id, action',
  settings: '++id'
});

export type { IDBKeyBinding, IDBSettings };
export { idb, KeyBindingAction };
