import {
  BaseRenderPipeline,
  type BaseRenderPipelineIdentifier,
  BaseRenderPipelineNone,
  BaseRenderPipelinePixelation,
  BaseRenderPipelineRetro,
} from '@core/tsl/rendering/base-render-pipeline.model.ts';
import { Observable } from '@core/utils/observable-utils.ts';

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

  public get basePipeline(): BaseRenderPipeline {
    switch (this._basePipelineIdentifier) {
      case 'none':
        return this._basePipelineNone;
      case 'pixelation':
        return this._basePipelinePixelation;
      case 'retro':
        return this._basePipelineRetro;
      default:
        return this._basePipelineNone;
    }
  }
  public set basePipeline(pipelineId: BaseRenderPipelineIdentifier) {
    this._basePipelineIdentifier = pipelineId;
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
  // |                 Extra effects                  |
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
    this._bloomStrength = value;
    this.notify({ key: 'RP_EFFECT_bloom' });
  }

  public get bloomThreshold(): number {
    return this._bloomThreshold;
  }
  public set bloomThreshold(value: number) {
    this._bloomThreshold = value;
    this.notify({ key: 'RP_EFFECT_bloom' });
  }

  public get bloomRadius(): number {
    return this._bloomRadius;
  }
  public set bloomRadius(value: number) {
    this._bloomRadius = value;
    this.notify({ key: 'RP_EFFECT_bloom' });
  }

  constructor() {
    super();
    this._basePipelineIdentifier = 'none';
    this._basePipelineNone = new BaseRenderPipelineNone(this.notifyRelayCallback);
    this._basePipelinePixelation = new BaseRenderPipelinePixelation(this.notifyRelayCallback);
    this._basePipelineRetro = new BaseRenderPipelineRetro(this.notifyRelayCallback);
    this._bloomEnabled = false;
    this._bloomThreshold = 0;
    this._bloomStrength = 0.1;
    this._bloomRadius = 0;
  }
}
