import {
  type BaseRenderPipelineIdentifier,
  BaseRenderPipelineNone,
  BaseRenderPipelinePixelation,
  BaseRenderPipelineRetro,
} from '@core/tsl/rendering/base-render-pipeline.model.ts';
import { Observable } from '@core/utils/observable-utils.ts';
import { clamp } from 'three/src/math/MathUtils.js';

export enum AntiAliasingMode {
  FXAA,
  SMAA,
}
export default class RenderPipelineData extends Observable {
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
    this.notify({ key: 'RP_basePipelineIdentifier' });
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
    this.notify({ key: 'RP_EFFECT_rgbshift' });
  }

  get rgbShiftAngle(): number {
    return this._rgbShiftAngle;
  }
  set rgbShiftAngle(value: number) {
    this._rgbShiftAngle = clamp(value, 0, 360);
    this.notify({ key: 'RP_EFFECT_rgbshift' });
  }

  get rgbShiftAmount(): number {
    return this._rgbShiftAmount;
  }
  set rgbShiftAmount(value: number) {
    this._rgbShiftAmount = clamp(value, 0, 0.01);
    this.notify({ key: 'RP_EFFECT_rgbshift' });
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
    this.notify({ key: 'RP_EFFECT_chromaticaberration' });
  }

  get chromaticAberrationStrength(): number {
    return this._chromaticAberrationStrength;
  }
  set chromaticAberrationStrength(value: number) {
    this._chromaticAberrationStrength = clamp(value, 0.01, 1);
    this.notify({ key: 'RP_EFFECT_chromaticaberration' });
  }

  get chromaticAberrationScale(): number {
    return this._chromaticAberrationScale;
  }
  set chromaticAberrationScale(value: number) {
    this._chromaticAberrationScale = clamp(value, 0.01, 2);
    this.notify({ key: 'RP_EFFECT_chromaticaberration' });
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
    this.notify({ key: 'RP_EFFECT_bloom' });
  }

  public get bloomStrength(): number {
    return this._bloomStrength;
  }
  public set bloomStrength(value: number) {
    this._bloomStrength = clamp(value, 0, 3);
    this.notify({ key: 'RP_EFFECT_bloom' });
  }

  public get bloomThreshold(): number {
    return this._bloomThreshold;
  }
  public set bloomThreshold(value: number) {
    this._bloomThreshold = clamp(value, 0, 1);
    this.notify({ key: 'RP_EFFECT_bloom' });
  }

  public get bloomRadius(): number {
    return this._bloomRadius;
  }
  public set bloomRadius(value: number) {
    this._bloomRadius = clamp(value, 0, 1);
    this.notify({ key: 'RP_EFFECT_bloom' });
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
    this.notify({ key: 'RP_EFFECT_vignette' });
  }

  get vignetteIntensity(): number {
    return this._vignetteIntensity;
  }
  set vignetteIntensity(value: number) {
    this._vignetteIntensity = clamp(value, 0, 2);
    this.notify({ key: 'RP_EFFECT_vignette' });
  }

  get vignetteSmoothness(): number {
    return this._vignetteSmoothness;
  }
  set vignetteSmoothness(value: number) {
    this._vignetteSmoothness = clamp(value, 0.05, 1);
    this.notify({ key: 'RP_EFFECT_vignette' });
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
    this.notify({ key: 'RP_EFFECT_antialiasing' });
  }

  public get antiAliasingMode(): AntiAliasingMode {
    return this._antiAliasingMode;
  }
  public set antiAliasingMode(value: AntiAliasingMode) {
    this._antiAliasingMode = value;
    this.notify({ key: 'RP_EFFECT_antialiasing' });
  }

  constructor() {
    super();
    this._basePipelineIdentifier = 'none';
    this._basePipelineNone = new BaseRenderPipelineNone(this.notifyRelayCallback);
    this._basePipelinePixelation = new BaseRenderPipelinePixelation(this.notifyRelayCallback);
    this._basePipelineRetro = new BaseRenderPipelineRetro(this.notifyRelayCallback);

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
