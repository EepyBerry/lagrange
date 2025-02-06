import { clamp, MathUtils } from 'three/src/math/MathUtils.js'
import { ChangeTracker, type ChangedProp } from './change-tracker.model'

export class DisplacementParameters extends ChangeTracker {
  private _epsilon: number = 0.001
  private _multiplier: number = 2.0
  private _factor: number = 0.05
  private _frequency: number = 2.0
  private _amplitude: number = 0.2
  private _lacunarity: number = 2.0
  private _octaves: number = 8

  constructor(
    changedPropsRef: ChangedProp[],
    changePrefix: string,
    freq?: number,
    amp?: number,
    lac?: number,
    oct?: number,
    epsilon?: number,
    multiplier?: number,
    factor?: number,
  ) {
    super(changedPropsRef, changePrefix)
    this._frequency = clamp(freq ?? this._frequency, 0, 255)
    this._amplitude = clamp(amp ?? this._amplitude, 0, 255)
    this._lacunarity = clamp(lac ?? this._lacunarity, 0, 255)
    this._octaves = clamp(oct ?? this._octaves, 0, 8)
    this._epsilon = clamp(epsilon ?? 0.001, 0.0, 1.0)
    this._multiplier = clamp(multiplier ?? 2.0, 0.0, 3.0)
    this._factor = clamp(factor ?? 0.05, 0.0, 1.0)
  }

  public get epsilon(): number {
    return this._epsilon
  }
  public set epsilon(value: number) {
    this._epsilon = value
    this.markForChange(`${this._changePrefix}._epsilon`)
  }
  public get multiplier(): number {
    return this._multiplier
  }
  public set multiplier(value: number) {
    this._multiplier = value
    this.markForChange(`${this._changePrefix}._multiplier`)
  }
  public get factor(): number {
    return this._factor
  }
  public set factor(value: number) {
    this._factor = value
    this.markForChange(`${this._changePrefix}._factor`)
  }

  public get frequency(): number {
    return this._frequency
  }
  public set frequency(value: number) {
    this._frequency = value
    this.markForChange(`${this._changePrefix}._frequency`)
  }

  public get amplitude(): number {
    return this._amplitude
  }
  public set amplitude(value: number) {
    this._amplitude = value
    this.markForChange(`${this._changePrefix}._amplitude`)
  }

  public get lacunarity(): number {
    return this._lacunarity
  }
  public set lacunarity(value: number) {
    this._lacunarity = value
    this.markForChange(`${this._changePrefix}._lacunarity`)
  }

  public get octaves(): number {
    return this._octaves
  }
  public set octaves(value: number) {
    this._octaves = value
    this.markForChange(`${this._changePrefix}._octaves`)
  }

  public loadData(data?: DisplacementParameters) {
    this.frequency = clamp(data?._frequency ?? this._frequency, 0, 10)
    this.amplitude = clamp(data?._amplitude ?? this._amplitude, 0, 10)
    this.lacunarity = clamp(data?._lacunarity ?? this._lacunarity, 0, 10)
    this.octaves = clamp(data?._octaves ?? this._octaves, 0, 8)
    this.factor = clamp(data?._factor ?? this._factor, 0.0, 1.0)
    this.epsilon = clamp(data?._epsilon ?? this._epsilon, 0.0, 0.25)
    this.multiplier = clamp(data?._multiplier ?? this._multiplier, 0.0, 3.0)
  }

  public reset(freq: number, amp: number, lac: number, oct: number, eps?: number, mul?: number, fac?: number): void {
    this.frequency = clamp(freq, 0, 10)
    this.amplitude = clamp(amp, 0, 10)
    this.lacunarity = clamp(lac, 0, 10)
    this.octaves = clamp(oct, 0, 8)
    this.epsilon = clamp(eps ?? 0.001, 0.0, 2.0)
    this.multiplier = clamp(mul ?? 2.0, 0.0, 5.0)
    this.factor = clamp(fac ?? 0.05, 0.0, 1.0)
  }

  public randomize() {
    this.factor = MathUtils.randFloat(0, 0.25)
    this.epsilon = MathUtils.randFloat(0.0005, 0.25)
    this.multiplier = MathUtils.randFloat(0, 3)
    this.frequency = MathUtils.randFloat(0, 3)
    this.amplitude = MathUtils.randFloat(0, 1.25)
    this.lacunarity = MathUtils.randFloat(0, 3)
    this.octaves = MathUtils.randInt(0, 8)
  }
}
