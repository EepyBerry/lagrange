import { ref, type Ref } from 'vue';
import PlanetData from '../models/planet-data.model';

type TEditorStatusCode = (typeof EditorStatusCode)[keyof typeof EditorStatusCode];
export const EditorStatusCode = {
  Initialization: 'INITIALIZATION',
  Edition: 'EDITION',
  Randomization: 'RANDOMIZATION',
  Reset: 'RESET',
  PreviewGeneration: 'PREVIEW_GENERATION',
  SceneDisposal: 'SCENE_DISPOSAL',
  Export: 'EXPORT',
  Error: 'ERROR',
  Unloaded: 'UNLOADED',
} as const;

export type EditorState = {
  planetData: PlanetData;
  status: TEditorStatusCode;
  planetEditedFlag: boolean;
};

// ----------------------------------------------------------------------------

export const EDITOR_STATE: Ref<EditorState> = ref({
  planetData: new PlanetData(),
  status: EditorStatusCode.Unloaded,
  planetEditedFlag: false,
});
