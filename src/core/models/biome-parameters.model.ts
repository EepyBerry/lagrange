import type { Color } from "three";
import { ChangeTracker } from "./change-tracker.model";
import type { ColorRamp, ColorRampStep } from "./color-ramp.model";
import { nanoid } from "nanoid";

export class BiomeParameters extends ChangeTracker {
  private _id: string;
  private _tempMin: number = 0
  private _tempMax: number = 0.5
  private _rgbaRamp: ColorRamp;
  private _color: Color

  constructor(
    changedPropsRef: string[],
    changePrefix: string,
    tempMin: number,
    tempMax: number,
    rgbaRamp: ColorRamp,
    color: Color
  ) {
    super(changedPropsRef, changePrefix)
    this._id = nanoid()
    this._tempMin = tempMin
    this._tempMax = tempMax
    this._rgbaRamp = rgbaRamp
    this._color = color
  }
  
  public get id(): string {
    return this._id;
  }

  public get tempMin(): number {
    return this._tempMin
  }
  public set tempMin(value: number) {
    this._tempMin = value
    this.markForChange(`${this._changePrefix}._tempMin`)
  }
  public get tempMax(): number {
    return this._tempMax
  }
  public set tempMax(value: number) {
    this._tempMax = value
    this.markForChange(`${this._changePrefix}._tempMax`)
  }

  public get opacityRamp(): ColorRamp {
    return this._rgbaRamp
  }
  public set opacityRamp(value: ColorRampStep[]) {
    this._rgbaRamp.loadFromSteps(value);
    this.markForChange(`${this._changePrefix}._rgbaRamp`)
  }
  public get color(): Color {
    return this._color
  }
  public set color(value: Color) {
    this._color.set(value)
    this.markForChange(`${this._changePrefix}._color`)
  }
}