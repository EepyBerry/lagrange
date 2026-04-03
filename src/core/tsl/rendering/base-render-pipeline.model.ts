import { type ObservableNotifyFunction, ObservableRelay } from '@core/utils/observable-utils.ts';

export type BaseRenderPipelineIdentifier = 'none' | 'pixelation' | 'retro';
export abstract class BaseRenderPipeline extends ObservableRelay {
  protected readonly _id!: BaseRenderPipelineIdentifier;
  public get id(): BaseRenderPipelineIdentifier {
    return this._id;
  }

  protected constructor(keyPrefix: string, notifyFunc: ObservableNotifyFunction) {
    super(keyPrefix, notifyFunc);
  }
}

export class BaseRenderPipelineNone extends BaseRenderPipeline {
  protected readonly _id: BaseRenderPipelineIdentifier = 'none';
  constructor(notifyFunc: ObservableNotifyFunction) {
    super('RP_BASE_none', notifyFunc);
  }
}

export class BaseRenderPipelinePixelation extends BaseRenderPipeline {
  protected readonly _id: BaseRenderPipelineIdentifier = 'pixelation';

  private _pixelSize: number;
  private _normalEdgeIntensity: number;
  private _depthEdgeIntensity: number;

  public get pixelSize(): number {
    return this._pixelSize;
  }
  public set pixelSize(value: number) {
    this._pixelSize = value;
    this.relayNotify({ key: this.keyPrefix });
  }

  public get normalEdgeIntensity(): number {
    return this._normalEdgeIntensity;
  }
  public set normalEdgeIntensity(value: number) {
    this._normalEdgeIntensity = value;
    this.relayNotify({ key: this.keyPrefix });
  }

  public get depthEdgeIntensity(): number {
    return this._depthEdgeIntensity;
  }
  public set depthEdgeIntensity(value: number) {
    this._depthEdgeIntensity = value;
    this.relayNotify({ key: this.keyPrefix });
  }

  constructor(notifyFunc: ObservableNotifyFunction) {
    super('RP_BASE_pixelation', notifyFunc);
    this._pixelSize = 4;
    this._normalEdgeIntensity = 1;
    this._depthEdgeIntensity = 1;
  }
}

export class BaseRenderPipelineRetro extends BaseRenderPipeline {
  protected readonly _id: BaseRenderPipelineIdentifier = 'retro';

  private _colorDepthSteps: number;
  private _colorBleeding: number;

  private _scanlineIntensity: number;
  private _scanlineDensity: number;
  private _scanlineSpeed: number;

  private _curvature: number;
  private _affineDistortion: number;
  private _vignetteIntensity: number;

  public get colorDepthSteps(): number {
    return this._colorDepthSteps;
  }
  public set colorDepthSteps(value: number) {
    this._colorDepthSteps = value;
    this.relayNotify({ key: this.keyPrefix });
  }

  public get colorBleeding(): number {
    return this._colorBleeding;
  }
  public set colorBleeding(value: number) {
    this._colorBleeding = value;
    this.relayNotify({ key: this.keyPrefix });
  }

  public get scanlineIntensity(): number {
    return this._scanlineIntensity;
  }
  public set scanlineIntensity(value: number) {
    this._scanlineIntensity = value;
    this.relayNotify({ key: this.keyPrefix });
  }

  public get scanlineDensity(): number {
    return this._scanlineDensity;
  }
  public set scanlineDensity(value: number) {
    this._scanlineDensity = value;
    this.relayNotify({ key: this.keyPrefix });
  }

  public get scanlineSpeed(): number {
    return this._scanlineSpeed;
  }
  public set scanlineSpeed(value: number) {
    this._scanlineSpeed = value;
    this.relayNotify({ key: this.keyPrefix });
  }

  public get curvature(): number {
    return this._curvature;
  }
  public set curvature(value: number) {
    this._curvature = value;
    this.relayNotify({ key: this.keyPrefix });
  }

  public get affineDistortion(): number {
    return this._affineDistortion;
  }
  public set affineDistortion(value: number) {
    this._affineDistortion = value;
    this.relayNotify({ key: this.keyPrefix });
  }

  public get vignetteIntensity(): number {
    return this._vignetteIntensity;
  }
  public set vignetteIntensity(value: number) {
    this._vignetteIntensity = value;
    this.relayNotify({ key: this.keyPrefix });
  }

  constructor(notifyFunc: ObservableNotifyFunction) {
    super('RP_BASE_retro', notifyFunc);
    this._colorDepthSteps = 32;
    this._colorBleeding = 0.001;

    this._scanlineIntensity = 0.3;
    this._scanlineDensity = 1;
    this._scanlineSpeed = 0;

    this._curvature = 0.02;
    this._affineDistortion = 1;
    this._vignetteIntensity = 0.35;
  }
}
