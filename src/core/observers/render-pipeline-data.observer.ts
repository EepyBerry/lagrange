import type RenderPipelineData from '@core/models/renderpipeline/render-pipeline-data.model.ts';
import type TSLRenderPipeline from '@core/tsl/rendering/render-pipeline.ts';
import type { EditorSceneData } from '@core/types.ts';
import type { NodeMaterial } from 'three/webgpu';
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
    // Base pipeline handlers
    this.registerBasePipelineDataUpdates(renderPipelineData, sceneData, sceneData.renderPipeline!);
    // Extra effects handlers
    this.registerBloomDataUpdates(renderPipelineData, sceneData.renderPipeline!);
  }

  private registerBasePipelineDataUpdates(
    data: RenderPipelineData,
    sceneData: EditorSceneData,
    renderPipeline: TSLRenderPipeline,
  ): void {
    this.registerEventHandler(
      'RP_basePipelineIdentifier',
      handler(async () => {
        renderPipeline.updatePipelinePasses(data.basePipelineIdentifier, sceneData.scene, sceneData.camera);
        (sceneData.planet.mesh!.material! as NodeMaterial).needsUpdate = true;
        (sceneData.clouds.mesh!.material! as NodeMaterial).needsUpdate = true;
        (sceneData.atmosphere.mesh!.material! as NodeMaterial).needsUpdate = true;
      }),
    );
    this.registerEventHandler(
      'RP_BASE_pixelation',
      handler(() => {
        renderPipeline.uniforms.pixelation.pixelSize.value = data.basePipelinePixelation.pixelSize;
        renderPipeline.uniforms.pixelation.normalEdgeIntensity.value = data.basePipelinePixelation.normalEdgeIntensity;
        renderPipeline.uniforms.pixelation.depthEdgeIntensity.value = data.basePipelinePixelation.depthEdgeIntensity;
      }),
    );
  }

  private registerBloomDataUpdates(data: RenderPipelineData, renderPipeline: TSLRenderPipeline): void {
    this.registerEventHandler(
      'RP_EFFECT_bloom',
      handler(() => {
        renderPipeline.uniforms!.bloom.enabled.value = +data.bloomEnabled;
        renderPipeline.uniforms!.bloom.threshold.value = data.bloomThreshold;
        renderPipeline.uniforms!.bloom.strength.value = data.bloomStrength;
        renderPipeline.uniforms!.bloom.radius.value = data.bloomRadius;
      }),
    );
  }
}
