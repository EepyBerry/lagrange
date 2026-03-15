import { nanoid } from 'nanoid';
import { ColorRamp, ColorRampStep } from './color-ramp.model';
import { clampedPRNG } from '@core/utils/math-utils';
import { ObservableRelay, type ObservableNotifyFunction } from '../utils/observable-utils';

export class RingParameters extends ObservableRelay {
  private _id: string;
  private _innerRadius: number;
  private _outerRadius: number;
  private _colorRamp: ColorRamp;

  constructor(
    keyPrefix: string,
    notifyFunc: ObservableNotifyFunction,
    innerRadius: number,
    outerRadius: number,
    colorRampSteps?: ColorRampStep[],
    oldId?: string,
  ) {
    super(keyPrefix, notifyFunc);
    this._id = oldId ?? nanoid();
    this._innerRadius = innerRadius;
    this._outerRadius = outerRadius;
    this._colorRamp = new ColorRamp(`${keyPrefix}._colorRamp`, notifyFunc, [
      new ColorRampStep(0x856f4e, 0.0, true),
      new ColorRampStep(0x000000, 0.5),
      new ColorRampStep(0xbf9a5e, 1.0, true),
    ]);
    if (colorRampSteps) {
      this._colorRamp.loadFromSteps(colorRampSteps);
    }
  }

  public get id(): string {
    return this._id;
  }
  public set id(value: string) {
    this._id = value;
  }

  public get innerRadius(): number {
    return this._innerRadius;
  }
  public set innerRadius(value: number) {
    this._innerRadius = value;
    if (this.outerRadius < this._innerRadius) {
      this.outerRadius = value; // Call setter to trigger change
    }
    this.relayNotify({ key: `${this.keyPrefix}._innerRadius`, data: { ring: this }});
  }

  public get outerRadius(): number {
    return this._outerRadius;
  }
  public set outerRadius(value: number) {
    this._outerRadius = value;
    if (this.innerRadius > this._outerRadius) {
      this.innerRadius = value; // Call setter to trigger change
    }
    this.relayNotify({ key: `${this.keyPrefix}._outerRadius`, data: { ring: this }});
  }

  public get colorRamp(): ColorRamp {
    return this._colorRamp;
  }

  public loadColorRampSteps(steps: ColorRampStep[]) {
    this._colorRamp.loadFromSteps(steps);
  }

  public static createRandom(keyPrefix: string, notifyFunc: ObservableNotifyFunction) {
    const innerRadius = clampedPRNG(1.25, 4.75);
    const params = new RingParameters(keyPrefix, notifyFunc, innerRadius, clampedPRNG(innerRadius, 5));
    params._colorRamp.randomize(3);
    return params;
  }
}
