import { clamp } from 'three/src/math/MathUtils.js';
import { Vector3 } from 'three';
import { clampedPRNG } from '@core/utils/math-utils';
import { ObservableRelay, type ObservableNotifyFunction } from '../utils/observable-utils';

export class NoiseParameters extends ObservableRelay {
  private _frequency: number = 3;
  private _amplitude: number = 0.5;
  private _lacunarity: number = 2;
  private _octaves: number = 2;

  private _layers: number = 1;
  private _warpFactor: Vector3 = new Vector3(1.0);

  constructor(
    keyPrefix: string,
    notifyFunc: ObservableNotifyFunction,
    freq?: number,
    amp?: number,
    lac?: number,
    oct?: number,
  ) {
    super(keyPrefix, notifyFunc);
    this._frequency = clamp(freq ?? this._frequency, 0, 10);
    this._amplitude = clamp(amp ?? this._amplitude, 0, 10);
    this._lacunarity = clamp(lac ?? this._lacunarity, 0, 10);
    this._octaves = clamp(oct ?? this._octaves, 0, 8);
    this._layers = 1.0;
    this._warpFactor.setScalar(1.0);
  }

  public get frequency(): number {
    return this._frequency;
  }
  public set frequency(value: number) {
    this._frequency = value;
    this.relayNotify({ key: `${this.keyPrefix}._frequency` });
  }

  public get amplitude(): number {
    return this._amplitude;
  }
  public set amplitude(value: number) {
    this._amplitude = value;
    this.relayNotify({ key: `${this.keyPrefix}._amplitude` });
  }

  public get lacunarity(): number {
    return this._lacunarity;
  }
  public set lacunarity(value: number) {
    this._lacunarity = value;
    this.relayNotify({ key: `${this.keyPrefix}._lacunarity` });
  }

  public get octaves(): number {
    return this._octaves;
  }
  public set octaves(value: number) {
    this._octaves = value;
    this.relayNotify({ key: `${this.keyPrefix}._octaves` });
  }

  public get layers(): number {
    return this._layers;
  }
  public set layers(value: number) {
    this._layers = Math.round(clamp(value, 1, 3));
    this.relayNotify({ key: `${this.keyPrefix}._layers` });
  }

  public get warpFactor(): Vector3 {
    return this._warpFactor;
  }

  public get xWarpFactor(): number {
    return this._warpFactor.x;
  }
  public set xWarpFactor(value: number) {
    this._warpFactor.x = value;
    this.relayNotify({ key: `${this.keyPrefix}._warpFactor` });
  }
  public get yWarpFactor(): number {
    return this._warpFactor.y;
  }
  public set yWarpFactor(value: number) {
    this._warpFactor.y = value;
    this.relayNotify({ key: `${this.keyPrefix}._warpFactor` });
  }
  public get zWarpFactor(): number {
    return this._warpFactor.z;
  }
  public set zWarpFactor(value: number) {
    this._warpFactor.z = value;
    this.relayNotify({ key: `${this.keyPrefix}._warpFactor` });
  }

  public loadData(data?: NoiseParameters) {
    this.frequency = clamp(data?._frequency ?? this._frequency, 0, 10);
    this.amplitude = clamp(data?._amplitude ?? this._amplitude, 0, 10);
    this.lacunarity = clamp(data?._lacunarity ?? this._lacunarity, 0, 10);
    this.octaves = clamp(data?._octaves ?? this._octaves, 0, 8);
    this.layers = clamp(data?._layers ?? 1, 1, 3);
    this.xWarpFactor = data?._warpFactor ? data._warpFactor.x : 1.0;
    this.yWarpFactor = data?._warpFactor ? data._warpFactor.y : 1.0;
    this.zWarpFactor = data?._warpFactor ? data._warpFactor.z : 1.0;
  }

  public reset(freq: number, amp: number, lac: number, oct: number, layers?: number, warpScalar?: number): void {
    this.frequency = clamp(freq, 0, 10);
    this.amplitude = clamp(amp, 0, 10);
    this.lacunarity = clamp(lac, 0, 10);
    this.octaves = clamp(oct, 0, 8);
    this.layers = clamp(layers ?? 1, 1, 3);
    this.xWarpFactor = warpScalar ?? 1.0;
    this.yWarpFactor = warpScalar ?? 1.0;
    this.zWarpFactor = warpScalar ?? 1.0;
  }

  // Note: adjusted ranges to get more coherent data
  public randomize() {
    this._layers = Math.round(clampedPRNG(1, 3));
    this._frequency = clampedPRNG(1, 5);
    this._amplitude = clampedPRNG(0.25, 1.25);
    this._lacunarity = clampedPRNG(1.5, 2.5);
    this._octaves = Math.round(clampedPRNG(4, 8));
    this._warpFactor.x = clampedPRNG(0, 8);
    this._warpFactor.y = clampedPRNG(0, 8);
    this._warpFactor.z = clampedPRNG(0, 8);
  }
}
