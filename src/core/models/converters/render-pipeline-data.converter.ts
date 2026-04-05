import type { BaseRenderPipelineIdentifier } from '@core/tsl/rendering/base-render-pipeline.model.ts';
import type { RenderPipelineUniformData } from '@core/tsl/rendering/render-pipeline.ts';
import { ModelConverter } from '@core/models/converters/model-converter.ts';
import RenderPipelineData from '@core/models/renderpipeline/render-pipeline-data.model.ts';

export class RenderPipelineDataConverter extends ModelConverter<RenderPipelineData, RenderPipelineUniformData> {
  convert(): RenderPipelineUniformData {
    return {
      baseRenderPipelineStr: this._data.basePipelineIdentifier,
      baseRenderPipeline: this.convertBaseRenderPipelineIdentifier(this._data.basePipelineIdentifier),
      basePixelation: {
        pixelSize: this._data.basePipelinePixelation.pixelSize,
        normalEdgeIntensity: this._data.basePipelinePixelation.normalEdgeIntensity,
        depthEdgeIntensity: this._data.basePipelinePixelation.depthEdgeIntensity,
      },
      baseRetro: {
        colorDepthSteps: this._data.basePipelineRetro.colorDepthSteps,
        colorBleeding: this._data.basePipelineRetro.colorBleeding,
        scanlineIntensity: this._data.basePipelineRetro.scanlineIntensity,
        scanlineDensity: this._data.basePipelineRetro.scanlineDensity,
        scanlineSpeed: this._data.basePipelineRetro.scanlineSpeed,
        curvature: this._data.basePipelineRetro.curvature,
      },
      effectRgbShift: {
        enabled: this._data.rgbShiftEnabled,
        angle: this._data.rgbShiftAngle,
        amount: this._data.rgbShiftAmount,
      },
      effectChromaticAberration: {
        enabled: this._data.chromaticAberrationEnabled,
        strength: this._data.chromaticAberrationStrength,
        scale: this._data.chromaticAberrationScale,
      },
      effectBloom: {
        enabled: this._data.bloomEnabled,
        threshold: this._data.bloomThreshold,
        strength: this._data.bloomStrength,
        radius: this._data.bloomRadius,
      },
      effectVignette: {
        enabled: this._data.vignetteEnabled,
        intensity: this._data.vignetteIntensity,
        smoothness: this._data.vignetteSmoothness,
      },
      effectAntiAliasing: {
        enabled: this._data.antiAliasingEnabled,
        mode: this._data.antiAliasingMode,
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
