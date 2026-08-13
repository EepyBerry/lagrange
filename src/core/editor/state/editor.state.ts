import type { EditorSceneData } from '@core/types.ts';
import { BakingWorkerInterface } from '@core/editor/workers/baking.worker-interface.ts';
import { TextureWorkerInterface } from '@core/editor/workers/texture.worker-interface.ts';
import PlanetData from '@core/models/planet/planet-data.model.ts';
import RenderPipelineData from '@core/models/renderpipeline/render-pipeline-data.model.ts';
import { Group } from 'three';
import { ref, type Ref } from 'vue';

type EditorStatusCode = (typeof EditorStatusCode)[keyof typeof EditorStatusCode];
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
  status: EditorStatusCode;
  planetEditedFlag: boolean;
};
export type EditorWorkers = {
  texture?: TextureWorkerInterface;
  baking?: BakingWorkerInterface;
};

// ----------------------------------------------------------------------------
export const EDITOR_WORKERS: EditorWorkers = {};
export const EDITOR_SCENE_DATA: Partial<EditorSceneData> = {
  rings: [],
  planetGroup: new Group(),
  ringAnchor: new Group(),
};
// @ts-expect-error bad unwrapping of Ref type
export const EDITOR_STATE: Ref<EditorState> = ref({
  planetData: new PlanetData(),
  renderPipelineData: new RenderPipelineData(),
  status: EditorStatusCode.Unloaded,
  planetEditedFlag: false,
});
