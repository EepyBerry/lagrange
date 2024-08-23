import { ChangeTracker } from "./change-tracker.model";
import type { ColorRamp, ColorRampStep } from "./color-ramp.model";
import { nanoid } from "nanoid";

export class BiomeParameters extends ChangeTracker {
  private _id: string;
  private _tempMin: number = 0.0
  private _tempMax: number = 1.0
  private _humiMin: number = 0.0;
  private _humiMax: number = 1.0;
  private _rgbaRamp: ColorRamp;

  constructor(
    changedPropsRef: string[],
    changePrefix: string,
    tempMin: number,
    tempMax: number,
    humiMin: number,
    humiMax: number,
    rgbaRamp: ColorRamp
  ) {
    super(changedPropsRef, changePrefix)
    this._id = nanoid()
    this._tempMin = tempMin
    this._tempMax = tempMax
    this._humiMin = humiMin
    this._humiMax = humiMax
    this._rgbaRamp = rgbaRamp
  }
  
  clone(): BiomeParameters {
    return new BiomeParameters(
      this._changedProps,
      this._changePrefix,
      this._tempMin,
      this._tempMax,
      this._humiMin,
      this._humiMax,
      this._rgbaRamp.clone()
    )
  }

  public get id(): string {
    return this._id;
  }

  public get tempMin(): number {
    return this._tempMin
  }
  public set tempMin(value: number) {
    this._tempMin = value
    this.markForChange(this._changePrefix)
  }
  public get tempMax(): number {
    return this._tempMax
  }
  public set tempMax(value: number) {
    this._tempMax = value
    this.markForChange(this._changePrefix)
  }

  public get humiMin(): number {
    return this._humiMin;
  }
  public set humiMin(value: number) {
    this._humiMin = value;
    this.markForChange(this._changePrefix)
  }
  public get humiMax(): number {
    return this._humiMax;
  }
  public set humiMax(value: number) {
    this._humiMax = value;
    this.markForChange(this._changePrefix)
  }

  public get rgbaRamp(): ColorRamp {
    return this._rgbaRamp
  }
  public set rgbaRamp(value: ColorRampStep[]) {
    this._rgbaRamp.loadFromSteps(value);
    this.markForChange(`${this._changePrefix}#${this.id}`)
  }
}