import type RenderPipelineData from '@core/models/renderpipeline/render-pipeline-data.model.ts';
import type TSLRenderPipeline from '@core/tsl/rendering/render-pipeline.ts';
import type { EditorSceneData } from '@core/types.ts';
import { EDITOR_STATE } from '@core/state/editor.state.ts';
import {
  type ObservableEventHandlerCtor,
  type ObservableEventOperation,
  Observer,
} from '@core/utils/observable-utils.ts';

const handler: ObservableEventHandlerCtor = (operation: ObservableEventOperation) => ({
  handle: operation,
});

export class RenderPipelineDataObserver extends Observer {
  public hookRenderPipelineData(sceneData: EditorSceneData): void {
    const renderPipelineData = EDITOR_STATE.value.renderPipelineData;
    this.registerBloomDataUpdates(renderPipelineData, sceneData.renderPipeline!);
  }

  private registerBloomDataUpdates(data: RenderPipelineData, renderPipeline: TSLRenderPipeline): void {
    this.registerEventHandler(
      'RP_bloomEnabled',
      handler(() => (renderPipeline.uniforms!.bloom.enabled.value = +data.bloomEnabled)),
    );
  }
}
