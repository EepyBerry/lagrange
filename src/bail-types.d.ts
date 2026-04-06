import type PlanetData from '@core/models/planet/planet-data.model.ts';
import type RenderPipelineData from '@core/models/renderpipeline/render-pipeline-data.model.ts';

declare module '@vue/reactivity' {
  export interface RefUnwrapBailTypes {
    classes: Node | Window | PlanetData | RenderPipelineData;
  }
}
