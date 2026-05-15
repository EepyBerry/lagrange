import { clampedPRNG } from '@core/utils/math-utils.ts';
import { type ObservableNotifyFunction, ObservableRelay } from '@core/utils/observable-utils.ts';
import { clamp } from 'three/src/math/MathUtils.js';

export class CellularNoiseParameters extends ObservableRelay {
  private _scale: number = 3;
  private _jitter: number = 1;
  private _strength: number = 1;
  private _lacunarity: number = 2;

  constructor(
    keyPrefix: string,
    notifyFunc: ObservableNotifyFunction,
    scale?: number,
    jitter?: number,
    strength?: number,
    lacunarity?: number,
  ) {
    super(keyPrefix, notifyFunc);
    this._scale = clamp(scale ?? this._scale, 0, 10);
    this._jitter = clamp(jitter ?? this._jitter, 0, 1);
    this._strength = clamp(strength ?? this._strength, 0, 2);
    this._lacunarity = clamp(lacunarity ?? this._lacunarity, 0, 3);
  }

  get scale(): number {
    return this._scale;
  }
  set scale(value: number) {
    this._scale = value;
    this.relayNotify({ key: `${this.keyPrefix}.scale` });
  }

  get jitter(): number {
    return this._jitter;
  }
  set jitter(value: number) {
    this._jitter = value;
    this.relayNotify({ key: `${this.keyPrefix}.jitter` });
  }

  get strength(): number {
    return this._strength;
  }
  set strength(value: number) {
    this._strength = value;
    this.relayNotify({ key: `${this.keyPrefix}.strength` });
  }

  get lacunarity(): number {
    return this._lacunarity;
  }
  set lacunarity(value: number) {
    this._lacunarity = value;
    this.relayNotify({ key: `${this.keyPrefix}.lacunarity` });
  }

  public loadData(data?: CellularNoiseParameters) {
    this.scale = clamp(data?._scale ?? this._scale, 0, 10);
    this.jitter = clamp(data?._jitter ?? this._jitter, 0, 1);
    this.strength = clamp(data?._strength ?? this._strength, 0, 5);
    this.lacunarity = clamp(data?._lacunarity ?? this._lacunarity, 0, 3);
  }

  public reset(scale: number, jitter: number, strength: number, lacunarity: number): void {
    this._scale = clamp(scale, 0, 10);
    this._jitter = clamp(jitter, 0, 1);
    this._strength = clamp(strength, 0, 2);
    this._lacunarity = clamp(lacunarity, 0, 10);
  }

  // Note: adjusted ranges to get more coherent data
  public randomize() {
    this._scale = clampedPRNG(2, 8);
    this._jitter = clampedPRNG(0.16, 1);
    this._strength = clampedPRNG(0, 2);
    this._lacunarity = clampedPRNG(1, 3);
  }
}
