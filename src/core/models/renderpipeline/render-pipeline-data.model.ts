import { Observable } from '@core/utils/observable-utils.ts';

export default class RenderPipelineData extends Observable {
  private _bloomEnabled: boolean;
  private _bloomStrength: number;
  private _bloomThreshold: number;
  private _bloomRadius: number;

  private _pixelationEnabled: boolean;
  private _pixelationPixelSize: number;
  private _pixelationNormalEdgeIntensity: number;
  private _pixelationDepthEdgeIntensity: number;

  constructor() {
    super();
    this._bloomEnabled = false;
    this._bloomThreshold = 0;
    this._bloomStrength = 0.1;
    this._bloomRadius = 0;
    this._pixelationEnabled = false;
    this._pixelationPixelSize = 1;
    this._pixelationNormalEdgeIntensity = 1;
    this._pixelationDepthEdgeIntensity = 1;
  }

  public get bloomEnabled(): boolean {
    return this._bloomEnabled;
  }
  public set bloomEnabled(value: boolean) {
    this._bloomEnabled = value;
    this.notify({ key: 'RP_bloomEnabled' });
  }

  public get bloomStrength(): number {
    return this._bloomStrength;
  }
  public set bloomStrength(value: number) {
    this._bloomStrength = value;
    this.notify({ key: 'RP_bloomStrength' });
  }

  public get bloomThreshold(): number {
    return this._bloomThreshold;
  }
  public set bloomThreshold(value: number) {
    this._bloomThreshold = value;
    this.notify({ key: 'RP_bloomThreshold' });
  }

  public get bloomRadius(): number {
    return this._bloomRadius;
  }
  public set bloomRadius(value: number) {
    this._bloomRadius = value;
    this.notify({ key: 'RP_bloomRadius' });
  }

  public get pixelationEnabled(): boolean {
    return this._pixelationEnabled;
  }
  public set pixelationEnabled(value: boolean) {
    this._pixelationEnabled = value;
    this.notify({ key: 'RP_pixelationEnabled' });
  }

  public get pixelationPixelSize(): number {
    return this._pixelationPixelSize;
  }
  public set pixelationPixelSize(value: number) {
    this._pixelationPixelSize = value;
    this.notify({ key: 'RP_pixelationPixelSize' });
  }

  public get pixelationNormalEdgeIntensity(): number {
    return this._pixelationNormalEdgeIntensity;
  }
  public set pixelationNormalEdgeIntensity(value: number) {
    this._pixelationNormalEdgeIntensity = value;
    this.notify({ key: 'RP_pixelationNormalEdgeIntensity' });
  }

  public get pixelationDepthEdgeIntensity(): number {
    return this._pixelationDepthEdgeIntensity;
  }
  public set pixelationDepthEdgeIntensity(value: number) {
    this._pixelationDepthEdgeIntensity = value;
    this.notify({ key: 'RP_pixelationDepthEdgeIntensity' });
  }
}
