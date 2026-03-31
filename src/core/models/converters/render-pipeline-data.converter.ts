import type { RenderPipelineUniformData } from '@core/tsl/rendering/render-pipeline.ts';
import { ModelConverter } from '@core/models/converters/model-converter.ts';
import RenderPipelineData from '@core/models/renderpipeline/render-pipeline-data.model.ts';

export class RenderPipelineDataConverter extends ModelConverter<RenderPipelineData, RenderPipelineUniformData> {
  convert(): RenderPipelineUniformData {
    return {
      pixelation: {
        enabled: this._data.pixelationEnabled,
        pixelSize: this._data.pixelationPixelSize,
        normalEdgeIntensity: this._data.pixelationNormalEdgeIntensity,
        depthEdgeIntensity: this._data.pixelationDepthEdgeIntensity,
      },
      bloom: {
        enabled: this._data.bloomEnabled,
        threshold: this._data.bloomThreshold,
        intensity: this._data.bloomIntensity,
        radius: this._data.bloomRadius,
      },
    };
  }
}