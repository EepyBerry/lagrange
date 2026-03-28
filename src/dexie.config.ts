// db.ts
import Dexie, { type EntityTable } from 'dexie';
import type PlanetData from './core/models/planet-data.model';

type TKeyBindingAction = (typeof KeyBindingAction)[keyof typeof KeyBindingAction];
export const KeyBindingAction = {
  ToggleLensFlare: 'toggle-lens-flare',
  ToggleClouds: 'toggle-clouds',
  ToggleAtmosphere: 'toggle-atmosphere',
  ToggleBiomes: 'toggle-biomes',
  TakeScreenshot: 'take-screenshot',
  CameraRotate: 'camera-rotate',
  CameraDolly: 'camera-dolly',
  CameraPan: 'camera-pan',
  StepDollyIn: 'step-dolly-in',
  StepDollyOut: 'step-dolly-out',
} as const;

export interface IDBKeyBinding {
  id: number;
  action: TKeyBindingAction;
  key: string;
}
export interface IDBSettings {
  id: number;
  locale: string;
  theme: string;
  font: string;
  showInitDialog?: boolean;
  renderingBackend: 'webgl' | 'webgpu';
  skybox:
    | 'deepspace'
    | 'crimsonquadrant'
    | 'embergreenexpanse'
    | 'shiningstars'
    | 'jadenebula'
    | 'edgeoftheuniverse'
    | 'chromakey';
  bakingResolution?: number;
  bakingPixelize?: boolean;
  enableEffects?: boolean;
  enableAnimations?: boolean;
  extrasCRTEffect?: boolean;
  extrasHologramEffect?: boolean;
  extrasMetalSlugMode?: boolean;
  extrasShowSpecialDays?: boolean;
}
export interface IDBPlanet {
  id: string;
  timestamp?: number;
  version?: string;
  preview?: string;
  data: PlanetData;
}

export const idb = new Dexie('LagrangeIDB', { autoOpen: true }) as Dexie & {
  keyBindings: EntityTable<IDBKeyBinding, 'id'>;
  settings: EntityTable<IDBSettings, 'id'>;
  planets: EntityTable<IDBPlanet, 'id'>;
};

// Schema declaration:
idb.version(1).stores({
  keyBindings: '++id, action',
  settings: '++id',
  planets: '++id, data._planetName',
});
