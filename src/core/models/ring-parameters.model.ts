import { nanoid } from "nanoid"
import { ChangeTracker, type ChangedProp } from "./change-tracker.model"
import { ColorRamp, ColorRampStep } from "./color-ramp.model"

export class RingParameters extends ChangeTracker {
  private _id: string
  private _innerRadius: number
  private _outerRadius: number
  private _colorRamp: ColorRamp

  constructor(
    changedPropsRef: ChangedProp[],
    changePrefix: string,
    innerRadius: number,
    outerRadius: number
  ) {
    super(changedPropsRef, changePrefix)
    this._id = nanoid()
    this._innerRadius = innerRadius
    this._outerRadius = outerRadius
    this._colorRamp = new ColorRamp(this._changedProps, '_colorRamp', [
      new ColorRampStep(0x856f4e, 0.0, true),
      new ColorRampStep(0x000000, 0.5),
      new ColorRampStep(0xbf9a5e, 1.0, true),
    ])
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
    this.markForChange(`${this._changePrefix}._innerRadius`)
  }

  public get outerRadius(): number {
    return this._outerRadius
  }
  public set outerRadius(value: number) {
    this._outerRadius = value
    this.markForChange(`${this._changePrefix}._outerRadius`)
  }

  public get colorRamp(): ColorRamp {
    return this._colorRamp
  }

  public loadColorRampSteps(steps: ColorRampStep[]) {
    this._colorRamp.loadFromSteps(steps)
  }
}