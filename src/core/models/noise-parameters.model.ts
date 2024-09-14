import { clamp } from 'three/src/math/MathUtils.js'
import { ChangeTracker, type ChangedProp } from './change-tracker.model'
import type { NoiseType } from '@core/types'

export class NoiseParameters extends ChangeTracker {
  private _noiseType: NoiseType
  private _frequency: number = 3
  private _amplitude: number = 0.5
  private _lacunarity: number = 2
  private _octaves: number = 2

  constructor(
    changedPropsRef: ChangedProp[],
    changePrefix: string,
    noiseType: NoiseType,
    freq?: number,
    amp?: number,
    lac?: number,
    oct?: number,
  ) {
    super(changedPropsRef, changePrefix)
    this._noiseType = noiseType
    this._frequency = clamp(freq ?? this._frequency, 0, 255)
    this._amplitude = clamp(amp ?? this._amplitude, 0, 255)
    this._lacunarity = clamp(lac ?? this._lacunarity, 0, 255)
    this._octaves = clamp(oct ?? this._octaves, 0, 8)
  }

  public get noiseType(): NoiseType {
    return this._noiseType
  }
  public set noiseType(value: NoiseType) {
    this._noiseType = value
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
}
