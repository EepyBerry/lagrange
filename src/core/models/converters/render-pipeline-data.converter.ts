import type { BaseRenderPipelineIdentifier } from '@core/tsl/rendering/base-render-pipeline.model.ts';
import type { RenderPipelineUniformData } from '@core/tsl/rendering/render-pipeline.ts';
import { ModelConverter } from '@core/models/converters/model-converter.ts';
import RenderPipelineData from '@core/models/renderpipeline/render-pipeline-data.model.ts';

export class RenderPipelineDataConverter extends ModelConverter<RenderPipelineData, RenderPipelineUniformData> {
  convert(): RenderPipelineUniformData {
    return {
      baseRenderPipelineStr: this._data.basePipelineIdentifier,
      baseRenderPipeline: this.convertBaseRenderPipelineIdentifier(this._data.basePipelineIdentifier),
      pixelation: {
        pixelSize: this._data.basePipelinePixelation.pixelSize,
        normalEdgeIntensity: this._data.basePipelinePixelation.normalEdgeIntensity,
        depthEdgeIntensity: this._data.basePipelinePixelation.depthEdgeIntensity,
      },
      bloom: {
        enabled: this._data.bloomEnabled,
        threshold: this._data.bloomThreshold,
        strength: this._data.bloomStrength,
        radius: this._data.bloomRadius,
      },
    };
  }

  /**
   * Converts a BaseRenderPipelineIdentifier to a number (required as GLSL/WGSL don't have either chars or strings)
   * @param id the base pipeline identifier to convert
   */
  private convertBaseRenderPipelineIdentifier(id: BaseRenderPipelineIdentifier): number {
    switch (id) {
      case 'none':
        return 0;
      case 'pixelation':
        return 1;
      case 'retro':
        return 2;
    }
  }
}
