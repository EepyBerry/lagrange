import { clampedPRNG } from '@core/utils/math-utils.ts';
import { ObservableRelay, type ObservableNotifyFunction } from '@core/utils/observable-utils.ts';
import { clamp } from 'three/src/math/MathUtils.js';

export class DisplacementParameters extends ObservableRelay {
  private _epsilon: number = 0.001;
  private _multiplier: number = 2;
  private _factor: number = 0.05;
  private _frequency: number = 2;
  private _amplitude: number = 0.2;
  private _lacunarity: number = 2;
  private _octaves: number = 8;

  constructor(
    keyPrefix: string,
    notifyFunc: ObservableNotifyFunction,
    freq?: number,
    amp?: number,
    lac?: number,
    oct?: number,
    epsilon?: number,
    multiplier?: number,
    factor?: number,
  ) {
    super(keyPrefix, notifyFunc);
    this._frequency = clamp(freq ?? this._frequency, 0, 10);
    this._amplitude = clamp(amp ?? this._amplitude, 0, 1.25);
    this._lacunarity = clamp(lac ?? this._lacunarity, 0, 3);
    this._octaves = clamp(oct ?? this._octaves, 0, 8);
    this._epsilon = clamp(epsilon ?? 0.001, 0, 0.25);
    this._multiplier = clamp(multiplier ?? 2, 0, 3);
    this._factor = clamp(factor ?? 0.05, 0, 1);
  }

  public get epsilon(): number {
    return this._epsilon;
  }
  public set epsilon(value: number) {
    this._epsilon = clamp(value, 0, 0.25);
    this.relayNotify({ key: `${this.keyPrefix}._epsilon` });
  }
  public get multiplier(): number {
    return this._multiplier;
  }
  public set multiplier(value: number) {
    this._multiplier = clamp(value, 0.25, 3);
    this.relayNotify({ key: `${this.keyPrefix}._multiplier` });
  }
  public get factor(): number {
    return this._factor;
  }
  public set factor(value: number) {
    this._factor = clamp(value, 0, 1);
    this.relayNotify({ key: `${this.keyPrefix}._factor` });
  }

  public get frequency(): number {
    return this._frequency;
  }
  public set frequency(value: number) {
    this._frequency = clamp(value, 0, 10);
    this.relayNotify({ key: `${this.keyPrefix}._frequency` });
  }

  public get amplitude(): number {
    return this._amplitude;
  }
  public set amplitude(value: number) {
    this._amplitude = clamp(value, 0, 1.25);
    this.relayNotify({ key: `${this.keyPrefix}._amplitude` });
  }

  public get lacunarity(): number {
    return this._lacunarity;
  }
  public set lacunarity(value: number) {
    this._lacunarity = clamp(value, 0, 3);
    this.relayNotify({ key: `${this.keyPrefix}._lacunarity` });
  }

  public get octaves(): number {
    return this._octaves;
  }
  public set octaves(value: number) {
    this._octaves = clamp(value, 1, 8);
    this.relayNotify({ key: `${this.keyPrefix}._octaves` });
  }

  public loadData(data?: DisplacementParameters) {
    this.frequency = clamp(data?._frequency ?? this._frequency, 0, 10);
    this.amplitude = clamp(data?._amplitude ?? this._amplitude, 0, 1.25);
    this.lacunarity = clamp(data?._lacunarity ?? this._lacunarity, 0, 3);
    this.octaves = clamp(data?._octaves ?? this._octaves, 0, 8);
    this.factor = clamp(data?._factor ?? this._factor, 0, 1);
    this.epsilon = clamp(data?._epsilon ?? this._epsilon, 0, 0.25);
    this.multiplier = clamp(data?._multiplier ?? this._multiplier, 0, 3);
  }

  public reset(freq: number, amp: number, lac: number, oct: number, eps?: number, mul?: number, fac?: number): void {
    this.frequency = clamp(freq, 0, 10);
    this.amplitude = clamp(amp, 0, 1.25);
    this.lacunarity = clamp(lac, 0, 3);
    this.octaves = clamp(oct, 0, 8);
    this.epsilon = clamp(eps ?? 0.001, 0, 2);
    this.multiplier = clamp(mul ?? 2, 0, 5);
    this.factor = clamp(fac ?? 0.05, 0, 1);
  }

  // Note: adjusted ranges to get more coherent data
  public randomize() {
    this._factor = clampedPRNG(0, 0.25);
    this._epsilon = clampedPRNG(0.0005, 0.25);
    this._multiplier = clampedPRNG(0.25, 3);
    this._frequency = clampedPRNG(0.25, 3);
    this._amplitude = clampedPRNG(0.25, 1.25);
    this._lacunarity = clampedPRNG(1.5, 2.5);
    this._octaves = Math.round(clampedPRNG(4, 8));
  }
}
