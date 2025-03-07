import { Color } from 'three'
import { ChangeTracker, type ChangedProp, type ChangedPropPair } from './change-tracker.model'
import { nanoid } from 'nanoid'
import { clamp } from 'three/src/math/MathUtils.js'
import { clampedPRNG } from '@/utils/math-utils'

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
  private _smoothness: number = 0.2
  private _color: Color

  constructor(
    changedPropsRef: ChangedProp[],
    changePrefix: string,
    dims: BiomeDimensions,
    color: Color,
    smoothness: number,
  ) {
    super(changedPropsRef, changePrefix)
    this._id = nanoid()
    this._tempMin = dims.temperatureMin
    this._tempMax = dims.temperatureMax
    this._humiMin = dims.humidityMin
    this._humiMax = dims.humidityMax
    this._color = new Color(color)
    this._smoothness = smoothness
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
    const oldValue: ChangedPropPair = { key: 'tempMin', value: this._tempMin.valueOf() }
    const newValue: ChangedPropPair = { key: 'tempMin', value: value.valueOf() }
    this._tempMin = clamp(value, 0.0, 1.0)
    this._tempMax = clamp(this._tempMax, this._tempMin, 1)
    this.markForChange(`${this._changePrefix}|${this._id}`, oldValue, newValue)
  }
  public get tempMax(): number {
    return this._tempMax
  }
  public set tempMax(value: number) {
    const oldValue: ChangedPropPair = { key: 'tempMax', value: this._tempMax.valueOf() }
    const newValue: ChangedPropPair = { key: 'tempMax', value: value.valueOf() }
    this._tempMax = clamp(value, 0.0, 1.0)
    this._tempMin = clamp(this._tempMin, 0, this._tempMax)
    this.markForChange(`${this._changePrefix}|${this._id}`, oldValue, newValue)
  }

  public get humiMin(): number {
    return this._humiMin
  }
  public set humiMin(value: number) {
    const oldValue: ChangedPropPair = { key: 'humiMin', value: this._humiMin.valueOf() }
    const newValue: ChangedPropPair = { key: 'humiMin', value: value.valueOf() }
    this._humiMin = clamp(value, 0.0, 1.0)
    this._humiMax = clamp(this._humiMax, this._humiMin, 1)
    this.markForChange(`${this._changePrefix}|${this._id}`, oldValue, newValue)
  }
  public get humiMax(): number {
    return this._humiMax
  }
  public set humiMax(value: number) {
    const oldValue: ChangedPropPair = { key: 'humiMax', value: this._humiMax.valueOf() }
    const newValue: ChangedPropPair = { key: 'humiMax', value: value.valueOf() }
    this._humiMax = clamp(value, 0.0, 1.0)
    this._humiMin = clamp(this._humiMin, 0, this._humiMax)
    this.markForChange(`${this._changePrefix}|${this._id}`, oldValue, newValue)
  }

  public get color(): Color {
    return this._color
  }
  public set color(value: Color) {
    const oldValue: ChangedPropPair = { key: 'color', value: this._color.clone() }
    const newValue: ChangedPropPair = { key: 'color', value: value.clone() }
    this._color.set(value)
    this.markForChange(`${this._changePrefix}|${this._id}`, oldValue, newValue)
  }

  public get smoothness(): number {
    return this._smoothness
  }
  public set smoothness(value: number) {
    const oldValue: ChangedPropPair = { key: 'smoothness', value: this._smoothness.valueOf() }
    const newValue: ChangedPropPair = { key: 'smoothness', value: value.valueOf() }
    this._smoothness = clamp(value, 0.0, 1.0)
    this.markForChange(`${this._changePrefix}|${this._id}`, oldValue, newValue)
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
    )
  }
}
