import { Color } from 'three'
import { ChangeTracker, type ChangedProp } from './change-tracker.model'
import { nanoid } from 'nanoid'
import { clamp } from 'three/src/math/MathUtils.js'
import { clampedPRNG } from '@/core/utils/math-utils'

export class BiomeDimensions {
  temperatureMin: number = 0.0
  temperatureMax: number = 1.0
  humidityMin: number = 0.0
  humidityMax: number = 1.0
}
export class BiomeParameters extends ChangeTracker {
  private _id: string

  private _tempMin: number = 0.0
  private _tempMax: number = 1.0
  private _humiMin: number = 0.0
  private _humiMax: number = 1.0

  private _color: Color
  private _smoothness: number = 0.2

  private _emissiveOverride: boolean = false
  private _emissiveIntensity: number = 0.0

  // Parent values
  private _parentEmissiveIntensity: number = 0.0

  constructor(
    changedPropsRef: ChangedProp[],
    changePrefix: string,
    dims: BiomeDimensions,
    color: Color,
    smoothness: number,
    emissiveOverride?: boolean,
    emissiveIntensity?: number,
    oldId?: string,
  ) {
    super(changedPropsRef, changePrefix)
    this._id = oldId ?? nanoid()
    this._tempMin = dims.temperatureMin
    this._tempMax = dims.temperatureMax
    this._humiMin = dims.humidityMin
    this._humiMax = dims.humidityMax
    this._color = new Color(color)
    this._smoothness = smoothness
    this._emissiveOverride = emissiveOverride ?? false
    this._emissiveIntensity = emissiveIntensity ?? 0.0
  }

  clone(): BiomeParameters {
    return new BiomeParameters(
      this._changedProps,
      this._changePrefix,
      {
        temperatureMin: this._tempMin,
        temperatureMax: this._tempMax,
        humidityMin: this._humiMin,
        humidityMax: this._humiMax,
      },
      this._color.clone(),
      this._smoothness,
      this._emissiveOverride,
      this._emissiveIntensity,
    )
  }

  public get id(): string {
    return this._id
  }
  public set id(id: string) {
    this._id = id
  }

  public get tempMin(): number {
    return this._tempMin
  }
  public set tempMin(value: number) {
    this._tempMin = clamp(value, 0.0, 1.0)
    this._tempMax = clamp(this._tempMax, this._tempMin, 1)
    this.markForChange(this._changePrefix, { data: this })
  }
  public get tempMax(): number {
    return this._tempMax
  }
  public set tempMax(value: number) {
    this._tempMax = clamp(value, 0.0, 1.0)
    this._tempMin = clamp(this._tempMin, 0, this._tempMax)
    this.markForChange(this._changePrefix, { data: this })
  }

  public get humiMin(): number {
    return this._humiMin
  }
  public set humiMin(value: number) {
    this._humiMin = clamp(value, 0.0, 1.0)
    this._humiMax = clamp(this._humiMax, this._humiMin, 1)
    this.markForChange(this._changePrefix, { data: this })
  }
  public get humiMax(): number {
    return this._humiMax
  }
  public set humiMax(value: number) {
    this._humiMax = clamp(value, 0.0, 1.0)
    this._humiMin = clamp(this._humiMin, 0, this._humiMax)
    this.markForChange(this._changePrefix, { data: this })
  }

  public get color(): Color {
    return this._color
  }
  public set color(value: Color) {
    this._color.set(value)
    this.markForChange(this._changePrefix, { data: this })
  }
  public get smoothness(): number {
    return this._smoothness
  }
  public set smoothness(value: number) {
    this._smoothness = clamp(value, 0.0, 1.0)
    this.markForChange(this._changePrefix, { data: this })
  }

  public get emissiveOverride(): boolean {
    return this._emissiveOverride
  }
  public set emissiveOverride(value: boolean) {
    this._emissiveOverride = value
    this.markForChange(this._changePrefix, { data: this })
  }
  public get emissiveIntensity(): number {
    return this._emissiveIntensity
  }
  public set emissiveIntensity(value: number) {
    this._emissiveIntensity = clamp(value, 0, 10)
    this.markForChange(this._changePrefix, { data: this })
  }

  public get parentEmissiveIntensity(): number {
    return this._parentEmissiveIntensity
  }
  public set parentEmissiveIntensity(value: number) {
    this._parentEmissiveIntensity = value
  }

  public static createRandom(changedProps: ChangedProp[], changePrefix: string) {
    const minTemp = clampedPRNG(0, 1),
      minHumi = clampedPRNG(0, 1)
    return new BiomeParameters(
      changedProps,
      changePrefix,
      {
        temperatureMin: minTemp,
        temperatureMax: clampedPRNG(minTemp, 1),
        humidityMin: minHumi,
        humidityMax: clampedPRNG(minHumi, 1),
      },
      new Color(clampedPRNG(0, 1) * 0xffffff),
      clampedPRNG(0, 1),
      clampedPRNG(0, 1) >= 0.5,
      clampedPRNG(0, 10),
    )
  }
}
