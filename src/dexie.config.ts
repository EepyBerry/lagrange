import PlanetData from '@core/models/planet/planet-data.model.ts';
import { mutateDBCoreRequestOn, type RequestMutatorFn } from '@core/utils/dexie-utils.ts';
import Dexie, { type DBCoreAddRequest, type DBCoreMutateRequest, type EntityTable } from 'dexie';

export type SkyboxName =
  | 'deepspace'
  | 'crimsonquadrant'
  | 'embergreenexpanse'
  | 'shiningstars'
  | 'jadenebula'
  | 'edgeoftheuniverse'
  | 'chromakey';
export type CameraMouseControlsScheme = 'standard' | 'inverted';

type TKeyBindingAction = (typeof KeyBindingAction)[keyof typeof KeyBindingAction];
export const KeyBindingAction = {
  ToggleLensFlare: 'toggle-lens-flare',
  ToggleClouds: 'toggle-clouds',
  ToggleAtmosphere: 'toggle-atmosphere',
  ToggleBiomes: 'toggle-biomes',
  TakeScreenshot: 'take-screenshot',
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
  cameraMouseControlsScheme: CameraMouseControlsScheme;
  cameraFOV: number;
  skybox: SkyboxName;
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

// Hooks
// PlanetDataMutator
const addMutator: RequestMutatorFn<DBCoreAddRequest> = (req: DBCoreAddRequest) => {
  req.values = req.values.map((planetData: IDBPlanet) =>
    JSON.parse(
      JSON.stringify({
        ...planetData,
        data: { ...planetData.data, observers: [] },
      }),
    ),
  );
};
idb.use({
  stack: 'dbcore',
  name: 'PlanetDataMutator',
  create(downlevelDatabase) {
    return {
      ...downlevelDatabase,
      table(tableName) {
        const downlevelTable = downlevelDatabase.table(tableName);
        return {
          ...downlevelTable,
          mutate: async (req: DBCoreMutateRequest) => {
            const request = { ...req };
            // Mutate request data as needed
            mutateDBCoreRequestOn(
              request as DBCoreAddRequest,
              addMutator,
              request.type === 'add' && tableName === 'planets',
            );
            // Pass mutated request to DBCore
            return await downlevelTable.mutate(request);
          },
        };
      },
    };
  },
});
