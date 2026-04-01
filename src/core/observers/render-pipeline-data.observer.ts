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
    this.registerPixelationDataUpdates(renderPipelineData, sceneData.renderPipeline!);
  }

  private registerBloomDataUpdates(data: RenderPipelineData, renderPipeline: TSLRenderPipeline): void {
    this.registerEventHandler(
      'RP_bloomEnabled',
      handler(() => {
        renderPipeline.uniforms!.bloom.enabled.value = +data.bloomEnabled;
      }),
    );
    this.registerEventHandler(
      'RP_bloomThreshold',
      handler(() => {
        renderPipeline.bloomNode.threshold.value = data.bloomThreshold;
      }),
    );
    this.registerEventHandler(
      'RP_bloomStrength',
      handler(() => (renderPipeline.bloomNode.strength.value = data.bloomStrength)),
    );
    this.registerEventHandler(
      'RP_bloomRadius',
      handler(() => (renderPipeline.bloomNode.radius.value = data.bloomRadius)),
    );
  }

  private registerPixelationDataUpdates(data: RenderPipelineData, renderPipeline: TSLRenderPipeline): void {
    this.registerEventHandler(
      'RP_pixelationEnabled',
      handler(() => (renderPipeline.uniforms!.pixelation.enabled.value = +data.pixelationEnabled)),
    );
    this.registerEventHandler(
      'RP_pixelationPixelSize',
      handler(() => (renderPipeline.uniforms!.pixelation.pixelSize.value = data.pixelationPixelSize)),
    );
    this.registerEventHandler(
      'RP_pixelationNormalEdgeIntensity',
      handler(
        () => (renderPipeline.uniforms!.pixelation.normalEdgeIntensity.value = data.pixelationNormalEdgeIntensity),
      ),
    );
    this.registerEventHandler(
      'RP_pixelationDepthEdgeIntensity',
      handler(() => (renderPipeline.uniforms!.pixelation.depthEdgeIntensity.value = data.pixelationDepthEdgeIntensity)),
    );
  }
}
