import type { DataEventPayloadTypeMap } from '@core/editor/event/data-event.types.ts';
import { DataEventEndpoint } from '@core/editor/event/data-event-endpoint.ts';
import {
  type BaseRenderPipelineIdentifier,
  BaseRenderPipelineNone,
  BaseRenderPipelinePixelation,
  BaseRenderPipelineRetro,
} from '@core/models/renderpipeline/base-render-pipeline.model.ts';
import { clamp } from 'three/src/math/MathUtils.js';

export enum AntiAliasingMode {
  FXAA,
  SMAA,
}
export default class RenderPipelineData {
  public readonly dataEventEndpoint = new DataEventEndpoint<keyof DataEventPayloadTypeMap>();

  // --------------------------------------------------
  // |              Base render pipeline              |
  // --------------------------------------------------

  /**
   * Base render pipeline upon which to stack additional effects
   */
  private _basePipelineIdentifier: BaseRenderPipelineIdentifier;

  private readonly _basePipelineNone: BaseRenderPipelineNone;
  private readonly _basePipelinePixelation: BaseRenderPipelinePixelation;
  private readonly _basePipelineRetro: BaseRenderPipelineRetro;

  public get basePipelineIdentifier(): BaseRenderPipelineIdentifier {
    return this._basePipelineIdentifier;
  }
  public set basePipelineIdentifier(pipelineId: BaseRenderPipelineIdentifier) {
    this._basePipelineIdentifier = pipelineId;
    this.dataEventEndpoint.emit('renderBasePipeline', { value: pipelineId });
  }

  get basePipelineRetro(): BaseRenderPipelineRetro {
    return this._basePipelineRetro;
  }
  get basePipelinePixelation(): BaseRenderPipelinePixelation {
    return this._basePipelinePixelation;
  }
  get basePipelineNone(): BaseRenderPipelineNone {
    return this._basePipelineNone;
  }

  // --------------------------------------------------
  // |                   RGB Shift                    |
  // --------------------------------------------------

  private _rgbShiftEnabled: boolean;
  private _rgbShiftAngle: number;
  private _rgbShiftAmount: number;

  get rgbShiftEnabled(): boolean {
    return this._rgbShiftEnabled;
  }
  set rgbShiftEnabled(value: boolean) {
    this._rgbShiftEnabled = value;
    this.dataEventEndpoint.emit('renderEffectRgbShift', {
      value: {
        enabled: value,
        angle: this.rgbShiftAngle,
        amount: this.rgbShiftAmount,
      },
    });
  }

  get rgbShiftAngle(): number {
    return this._rgbShiftAngle;
  }
  set rgbShiftAngle(value: number) {
    this._rgbShiftAngle = clamp(value, 0, 360);
    this.dataEventEndpoint.emit('renderEffectRgbShift', {
      value: {
        enabled: this.rgbShiftEnabled,
        angle: value,
        amount: this.rgbShiftAmount,
      },
    });
  }

  get rgbShiftAmount(): number {
    return this._rgbShiftAmount;
  }
  set rgbShiftAmount(value: number) {
    this._rgbShiftAmount = clamp(value, 0, 0.01);
    this.dataEventEndpoint.emit('renderEffectRgbShift', {
      value: {
        enabled: this.rgbShiftEnabled,
        angle: this.rgbShiftAngle,
        amount: value,
      },
    });
  }

  // --------------------------------------------------
  // |              Chromatic Aberration              |
  // --------------------------------------------------

  private _chromaticAberrationEnabled: boolean;
  private _chromaticAberrationStrength: number;
  private _chromaticAberrationScale: number;

  get chromaticAberrationEnabled(): boolean {
    return this._chromaticAberrationEnabled;
  }
  set chromaticAberrationEnabled(value: boolean) {
    this._chromaticAberrationEnabled = value;
    this.dataEventEndpoint.emit('renderEffectChromaticAberration', {
      value: {
        enabled: value,
        strength: this.chromaticAberrationStrength,
        scale: this.chromaticAberrationScale,
      },
    });
  }

  get chromaticAberrationStrength(): number {
    return this._chromaticAberrationStrength;
  }
  set chromaticAberrationStrength(value: number) {
    this._chromaticAberrationStrength = clamp(value, 0.01, 1);
    this.dataEventEndpoint.emit('renderEffectChromaticAberration', {
      value: {
        enabled: this.chromaticAberrationEnabled,
        strength: value,
        scale: this.chromaticAberrationScale,
      },
    });
  }

  get chromaticAberrationScale(): number {
    return this._chromaticAberrationScale;
  }
  set chromaticAberrationScale(value: number) {
    this._chromaticAberrationScale = clamp(value, 0.01, 2);
    this.dataEventEndpoint.emit('renderEffectChromaticAberration', {
      value: {
        enabled: this.chromaticAberrationEnabled,
        strength: this.chromaticAberrationStrength,
        scale: value,
      },
    });
  }

  // --------------------------------------------------
  // |                     Bloom                      |
  // --------------------------------------------------

  private _bloomEnabled: boolean;
  private _bloomStrength: number;
  private _bloomThreshold: number;
  private _bloomRadius: number;

  public get bloomEnabled(): boolean {
    return this._bloomEnabled;
  }
  public set bloomEnabled(value: boolean) {
    this._bloomEnabled = value;
    this.dataEventEndpoint.emit('renderEffectBloom', {
      value: {
        enabled: value,
        strength: this.bloomStrength,
        threshold: this.bloomThreshold,
        radius: this.bloomRadius,
      },
    });
  }

  public get bloomStrength(): number {
    return this._bloomStrength;
  }
  public set bloomStrength(value: number) {
    this._bloomStrength = clamp(value, 0, 3);
    this.dataEventEndpoint.emit('renderEffectBloom', {
      value: {
        enabled: this.bloomEnabled,
        strength: value,
        threshold: this.bloomThreshold,
        radius: this.bloomRadius,
      },
    });
  }

  public get bloomThreshold(): number {
    return this._bloomThreshold;
  }
  public set bloomThreshold(value: number) {
    this._bloomThreshold = clamp(value, 0, 1);
    this.dataEventEndpoint.emit('renderEffectBloom', {
      value: {
        enabled: this.bloomEnabled,
        strength: this.bloomStrength,
        threshold: value,
        radius: this.bloomRadius,
      },
    });
  }

  public get bloomRadius(): number {
    return this._bloomRadius;
  }
  public set bloomRadius(value: number) {
    this._bloomRadius = clamp(value, 0, 1);
    this.dataEventEndpoint.emit('renderEffectBloom', {
      value: {
        enabled: this.bloomEnabled,
        strength: this.bloomStrength,
        threshold: this.bloomThreshold,
        radius: value,
      },
    });
  }

  // --------------------------------------------------
  // |                   Vignette                     |
  // --------------------------------------------------

  private _vignetteEnabled: boolean;
  private _vignetteIntensity: number;
  private _vignetteSmoothness: number;

  get vignetteEnabled(): boolean {
    return this._vignetteEnabled;
  }
  set vignetteEnabled(value: boolean) {
    this._vignetteEnabled = value;
    this.dataEventEndpoint.emit('renderEffectVignette', {
      value: {
        enabled: value,
        intensity: this.vignetteIntensity,
        smoothness: this.vignetteSmoothness,
      },
    });
  }

  get vignetteIntensity(): number {
    return this._vignetteIntensity;
  }
  set vignetteIntensity(value: number) {
    this._vignetteIntensity = clamp(value, 0, 2);
    this.dataEventEndpoint.emit('renderEffectVignette', {
      value: {
        enabled: this.vignetteEnabled,
        intensity: value,
        smoothness: this.vignetteSmoothness,
      },
    });
  }

  get vignetteSmoothness(): number {
    return this._vignetteSmoothness;
  }
  set vignetteSmoothness(value: number) {
    this._vignetteSmoothness = clamp(value, 0.05, 1);
    this.dataEventEndpoint.emit('renderEffectVignette', {
      value: {
        enabled: this.vignetteEnabled,
        intensity: this.vignetteIntensity,
        smoothness: value,
      },
    });
  }
  // --------------------------------------------------
  // |                 Anti-Aliasing                  |
  // --------------------------------------------------

  private _antiAliasingEnabled: boolean;
  private _antiAliasingMode: AntiAliasingMode;

  public get antiAliasingEnabled(): boolean {
    return this._antiAliasingEnabled;
  }
  public set antiAliasingEnabled(value: boolean) {
    this._antiAliasingEnabled = value;
    this.dataEventEndpoint.emit('renderEffectAntiAliasing', {
      value: {
        enabled: value,
        mode: this.antiAliasingMode,
      },
    });
  }

  public get antiAliasingMode(): AntiAliasingMode {
    return this._antiAliasingMode;
  }
  public set antiAliasingMode(value: AntiAliasingMode) {
    this._antiAliasingMode = value;
    this.dataEventEndpoint.emit('renderEffectAntiAliasing', {
      value: {
        enabled: this.antiAliasingEnabled,
        mode: value,
      },
    });
  }

  constructor() {
    this._basePipelineIdentifier = 'none';
    this._basePipelineNone = new BaseRenderPipelineNone(this.dataEventEndpoint);
    this._basePipelinePixelation = new BaseRenderPipelinePixelation(this.dataEventEndpoint);
    this._basePipelineRetro = new BaseRenderPipelineRetro(this.dataEventEndpoint);

    this._rgbShiftEnabled = false;
    this._rgbShiftAngle = 0;
    this._rgbShiftAmount = 0.003;

    this._chromaticAberrationEnabled = false;
    this._chromaticAberrationStrength = 0.4;
    this._chromaticAberrationScale = 1;

    this._bloomEnabled = false;
    this._bloomThreshold = 0;
    this._bloomStrength = 0.1;
    this._bloomRadius = 0;

    this._vignetteEnabled = false;
    this._vignetteIntensity = 1;
    this._vignetteSmoothness = 0.5;

    this._antiAliasingEnabled = false;
    this._antiAliasingMode = AntiAliasingMode.FXAA;
  }
}
