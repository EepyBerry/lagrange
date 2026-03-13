import { ref, type Ref } from 'vue';
import PlanetData from '../models/planet-data.model';

export enum EditorStatusCode {
  INITIALIZATION = 'INITIALIZATION',
  EDITION = 'EDITION',
  RANDOMIZATION = 'RANDOMIZATION',
  RESET = 'RESET',
  PREVIEW_GENERATION = 'PREVIEW_GENERATION',
  SCENE_DISPOSAL = 'SCENE_DISPOSAL',
  EXPORT = 'EXPORT',
  ERROR = 'ERROR',
  UNLOADED = 'UNLOADED',
}
export type EditorState = {
  planetData: PlanetData;
  status: EditorStatusCode;
  planetEditedFlag: boolean;
};

// ----------------------------------------------------------------------------

export const EDITOR_STATE: Ref<EditorState> = ref({
  planetData: new PlanetData(),
  status: EditorStatusCode.UNLOADED,
  planetEditedFlag: false,
});
