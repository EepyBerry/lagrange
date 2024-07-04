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

const idb = new Dexie('LagrangeIDB') as Dexie & {
  keyBindings: EntityTable<IDBKeyBinding, 'id'>
};

// Schema declaration:
idb.version(1).stores({
  keyBindings: '++id, action'
});

export type { IDBKeyBinding };
export { idb, KeyBindingAction };
