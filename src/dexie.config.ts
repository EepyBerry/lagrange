// db.ts
import Dexie, { type EntityTable } from 'dexie'
import type PlanetData from './core/models/planet-data.model'

enum KeyBindingAction {
  ToggleLensFlare = 'toggle-lens-flare',
  ToggleClouds = 'toggle-clouds',
  ToggleAtmosphere = 'toggle-atmosphere',
  ToggleBiomes = 'toggle-biomes',
  TakeScreenshot = 'take-screenshot',
}

interface IDBKeyBinding {
  id: number
  action: KeyBindingAction
  key: string
}

interface IDBSettings {
  id: number
  locale: string
  theme: string
  font: string
  showInitDialog?: boolean
  bakingResolution?: number
  bakingPixelize?: boolean
  enableEffects?: boolean
  enableAnimations?: boolean
  extrasHologramMode?: boolean
  extrasShowSpecialDays?: boolean
}

interface IDBPlanet {
  id: string
  timestamp?: number
  version?: string
  preview?: string
  data: PlanetData
}

const idb = new Dexie('LagrangeIDB', { autoOpen: true }) as Dexie & {
  keyBindings: EntityTable<IDBKeyBinding, 'id'>
  settings: EntityTable<IDBSettings, 'id'>
  planets: EntityTable<IDBPlanet, 'id'>
}

// Schema declaration:
idb.version(1).stores({
  keyBindings: '++id, action',
  settings: '++id',
  planets: '++id, data._planetName',
})

export type { IDBKeyBinding, IDBSettings, IDBPlanet }
export { idb, KeyBindingAction }
