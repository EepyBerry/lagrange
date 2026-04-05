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
import { degToRad } from 'three/src/math/MathUtils.js';

const handler: ObservableEventHandlerCtor = (operation: ObservableEventOperation) => ({
  handle: operation,
});

export class RenderPipelineDataObserver extends Observer {
  public hookRenderPipelineData(sceneData: EditorSceneData): void {
    const renderPipelineData = EDITOR_STATE.value.renderPipelineData;
    // Base pipeline handlers
    this.registerBasePipelineDataUpdates(renderPipelineData, sceneData, sceneData.renderPipeline!);
    // Extra effects handlers
    this.registerEffectDataUpdates(renderPipelineData, sceneData.renderPipeline!);
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
        renderPipeline.uniforms.basePixelation.pixelSize.value = data.basePipelinePixelation.pixelSize;
        renderPipeline.uniforms.basePixelation.normalEdgeIntensity.value =
          data.basePipelinePixelation.normalEdgeIntensity;
        renderPipeline.uniforms.basePixelation.depthEdgeIntensity.value =
          data.basePipelinePixelation.depthEdgeIntensity;
      }),
    );
    this.registerEventHandler(
      'RP_BASE_retro',
      handler(() => {
        renderPipeline.uniforms.baseRetro.colorDepthSteps.value = data.basePipelineRetro.colorDepthSteps;
        renderPipeline.uniforms.baseRetro.colorBleeding.value = data.basePipelineRetro.colorBleeding;
        renderPipeline.uniforms.baseRetro.scanlineIntensity.value = data.basePipelineRetro.scanlineIntensity;
        renderPipeline.uniforms.baseRetro.scanlineDensity.value = data.basePipelineRetro.scanlineDensity;
        renderPipeline.uniforms.baseRetro.scanlineSpeed.value = data.basePipelineRetro.scanlineSpeed;
        renderPipeline.uniforms.baseRetro.curvature.value = data.basePipelineRetro.curvature;
      }),
    );
  }

  private registerEffectDataUpdates(data: RenderPipelineData, renderPipeline: TSLRenderPipeline): void {
    this.registerEventHandler(
      'RP_EFFECT_rgbshift',
      handler(() => {
        renderPipeline.uniforms!.effectRgbShift.enabled.value = +data.rgbShiftEnabled;
        renderPipeline.uniforms!.effectRgbShift.angle.value = degToRad(data.rgbShiftAngle);
        renderPipeline.uniforms!.effectRgbShift.amount.value = data.rgbShiftAmount;
      }),
    );
    this.registerEventHandler(
      'RP_EFFECT_chromaticaberration',
      handler(() => {
        renderPipeline.uniforms!.effectChromaticAberration.enabled.value = +data.chromaticAberrationEnabled;
        renderPipeline.uniforms!.effectChromaticAberration.strength.value = data.chromaticAberrationStrength;
        renderPipeline.uniforms!.effectChromaticAberration.scale.value = data.chromaticAberrationScale;
      }),
    );
    this.registerEventHandler(
      'RP_EFFECT_bloom',
      handler(() => {
        renderPipeline.uniforms!.effectBloom.enabled.value = +data.bloomEnabled;
        renderPipeline.uniforms!.effectBloom.threshold.value = data.bloomThreshold;
        renderPipeline.uniforms!.effectBloom.strength.value = data.bloomStrength;
        renderPipeline.uniforms!.effectBloom.radius.value = data.bloomRadius;
      }),
    );
    this.registerEventHandler(
      'RP_EFFECT_vignette',
      handler(() => {
        renderPipeline.uniforms!.effectVignette.enabled.value = +data.vignetteEnabled;
        renderPipeline.uniforms!.effectVignette.intensity.value = data.vignetteIntensity;
        renderPipeline.uniforms!.effectVignette.smoothness.value = data.vignetteSmoothness;
      }),
    );
    this.registerEventHandler(
      'RP_EFFECT_antialiasing',
      handler(() => {
        renderPipeline.uniforms!.effectAntiAliasing.enabled.value = +data.antiAliasingEnabled;
        renderPipeline.uniforms!.effectAntiAliasing.mode.value = data.antiAliasingMode;
      }),
    );
  }
}
