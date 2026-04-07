import type { IDBPlanet } from '@/dexie.config.ts';

export type PlanetInfoDialogExposes = {
  open: (p: IDBPlanet) => void;
};
