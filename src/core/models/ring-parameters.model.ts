import { nanoid } from 'nanoid'
import { ChangeTracker, type ChangedProp } from './change-tracker.model'
import { ColorRamp, ColorRampStep } from './color-ramp.model'
import { clampedPRNG } from '@/utils/math-utils'

export class RingParameters extends ChangeTracker {
  private _id: string
  private _innerRadius: number
  private _outerRadius: number
  private _colorRamp: ColorRamp

  constructor(
    changedPropsRef: ChangedProp[],
    changePrefix: string,
    innerRadius: number,
    outerRadius: number,
    colorRampSteps?: ColorRampStep[],
    oldId?: string,
  ) {
    super(changedPropsRef, changePrefix)
    this._id = oldId ?? nanoid()
    this._innerRadius = innerRadius
    this._outerRadius = outerRadius
    this._colorRamp = new ColorRamp(this._changedProps, `${this._changePrefix}.${this._id}._colorRamp`, [
      new ColorRampStep(0x856f4e, 0.0, true),
      new ColorRampStep(0x000000, 0.5),
      new ColorRampStep(0xbf9a5e, 1.0, true),
    ])
    if (colorRampSteps) {
      this._colorRamp.loadFromSteps(colorRampSteps)
    }
  }

  public get id(): string {
    return this._id
  }
  public set id(value: string) {
    this._id = value
  }

  public get innerRadius(): number {
    return this._innerRadius
  }
  public set innerRadius(value: number) {
    this._innerRadius = value
    if (this.outerRadius < this._innerRadius) {
      this.outerRadius = value // Call setter to trigger change
    }
    this.markForChange(`${this._changePrefix}.${this._id}._innerRadius`)
  }

  public get outerRadius(): number {
    return this._outerRadius
  }
  public set outerRadius(value: number) {
    this._outerRadius = value
    if (this.innerRadius > this._outerRadius) {
      this.innerRadius = value // Call setter to trigger change
    }
    this.markForChange(`${this._changePrefix}.${this._id}._outerRadius`)
  }

  public get colorRamp(): ColorRamp {
    return this._colorRamp
  }

  public loadColorRampSteps(steps: ColorRampStep[]) {
    this._colorRamp.loadFromSteps(steps)
  }

  public static createRandom(changedProps: ChangedProp[], changePrefix: string) {
    const innerRadius = clampedPRNG(1.25, 4.75)
    const params = new RingParameters(changedProps, changePrefix, innerRadius, clampedPRNG(innerRadius, 5))
    params.colorRamp.randomize(3)
    return params
  }
}
