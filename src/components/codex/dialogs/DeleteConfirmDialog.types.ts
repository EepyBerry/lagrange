import type { IDBPlanet } from '@/dexie.config.ts';

export type DeleteConfirmDialogExposes = {
  open: (planet: IDBPlanet) => void;
};
