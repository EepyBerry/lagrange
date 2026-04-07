import PlanetData from '@core/models/planet/planet-data.model.ts';
import RenderPipelineData from '@core/models/renderpipeline/render-pipeline-data.model.ts';
import { ref, type Ref } from 'vue';

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
  renderPipelineData: RenderPipelineData;
  status: TEditorStatusCode;
  planetEditedFlag: boolean;
};

// ----------------------------------------------------------------------------

export const EDITOR_STATE: Ref<EditorState> = ref({
  planetData: new PlanetData(),
  renderPipelineData: new RenderPipelineData(),
  status: EditorStatusCode.Unloaded,
  planetEditedFlag: false,
});
