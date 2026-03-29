import { clampedPRNG } from '@core/utils/math-utils';
import { sha1 } from 'crypto-hash';
import { nanoid } from 'nanoid';
import { Color, type ColorRepresentation } from 'three';
import { ObservableRelay, type ObservableNotifyFunction } from '../utils/observable-utils';

export class ColorRampStep {
  private readonly _id: string; // internal ID for tracking changes
  private readonly _color: Color;
  private readonly _isBound: boolean;
  private _alpha: number;
  private _factor: number;

  constructor(color: ColorRepresentation, factor: number, isBound: boolean = false) {
    this._id = nanoid();
    this._color = new Color(color);
    this._isBound = isBound;
    this._alpha = 1;
    this._factor = factor;
  }

  static newWithAlpha(
    color: ColorRepresentation,
    alpha: number,
    factor: number,
    isBound: boolean = false,
  ): ColorRampStep {
    const step = new ColorRampStep(color, factor, isBound);
    step.alpha = alpha ?? 1;
    return step;
  }

  clone(): ColorRampStep {
    return ColorRampStep.newWithAlpha(this._color, this._alpha, this._factor, this._isBound);
  }

  public get id() {
    return this._id;
  }

  public get color() {
    return this._color;
  }
  public set color(color: Color) {
    this._color.setRGB(color.r, color.g, color.b);
  }

  public get alpha(): number {
    return this._alpha;
  }
  public set alpha(value: number) {
    this._alpha = value;
  }
  public get factor() {
    return this._factor;
  }
  public set factor(factor: number) {
    this._factor = factor;
  }
  public get isBound(): boolean {
    return this._isBound;
  }
}

export class ColorRamp extends ObservableRelay {
  private _hash: string = ''; // internal hash for tracking changes
  private _maxSize: number = 16;
  private _lockedSize: boolean = true;
  readonly _steps: ColorRampStep[] = [];

  constructor(
    keyPrefix: string,
    notifyFunc: ObservableNotifyFunction,
    steps: ColorRampStep[],
    maxSize: number = 16,
    lockedSize = false,
  ) {
    super(keyPrefix, notifyFunc);
    this._maxSize = maxSize;
    this._steps = steps;
    this._lockedSize = lockedSize;
  }

  public get hash(): string {
    return this._hash;
  }

  public get steps(): ColorRampStep[] {
    return this._steps;
  }

  public get maxSize() {
    return this._maxSize;
  }
  public get lockedSize(): boolean {
    return this._lockedSize;
  }
  public set lockedSize(value: boolean) {
    this._lockedSize = value;
  }

  // Utility functions

  private async generateHash() {
    this._hash = await sha1(JSON.stringify(this, (k, v) => (k === '_changedProps' ? undefined : v)));
  }

  public sortSteps(markChange: boolean = true) {
    this._steps.sort((a, b) => a.factor - b.factor);
    if (markChange) this.relayNotify({ key: this.keyPrefix, data: { ramp: this } });
    this.generateHash();
  }

  public addStep() {
    if (this._steps.length >= this._maxSize - 1) {
      throw new Error('(ColorRamp) Maximum size reached');
    }
    this._steps.push(new ColorRampStep('black', this._steps.at(-2)!.factor));
    this.sortSteps();
    this.relayNotify({ key: this.keyPrefix, data: { ramp: this } });
    this.generateHash();
  }

  public getStep(stepId: string) {
    const index = this._steps.findIndex((s) => s.id === stepId);
    if (index === -1) {
      throw new Error('Cannot find step with ID ' + stepId);
    }
    return this._steps[index];
  }

  public updateStep(id: string, options: { color?: string; factor?: number; alpha?: number }) {
    const index = this._steps.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error('Cannot find step with ID ' + id);
    }

    this._steps[index].color.set(options.color ? options.color : this._steps[index].color);
    this._steps[index].alpha = options.alpha ?? this._steps[index].alpha;
    this._steps[index].factor = options.factor ?? this._steps[index].factor;
    this.relayNotify({ key: this.keyPrefix, data: { ramp: this } });
    this.generateHash();
  }

  public removeStep(stepId: string) {
    if (this.isBoundStep(stepId)) {
      console.warn('<Lagrange> (ColorRamp) Cannot delete ramp bounds! (factor=0|1)');
      return;
    }
    const index = this._steps.findIndex((s) => s.id === stepId);
    if (index === -1) {
      throw new Error('Cannot find step with ID ' + stepId);
    }
    this._steps.splice(index, 1);
    this.relayNotify({ key: this.keyPrefix });
    this.generateHash();
  }

  public isBoundStep(stepId: string) {
    return this._steps.find((s) => s.id === stepId)?.isBound;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public loadFromSteps(data: any[]) {
    if (!data) {
      return;
    }
    this._steps.splice(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this._steps.push(...data.map((s: any) => ColorRampStep.newWithAlpha(s._color, s._alpha, s._factor, s._isBound)));
    this.generateHash();
  }

  public randomize(maxSteps: number = 10) {
    this._steps.splice(0);
    const max = Math.round(clampedPRNG(2, maxSteps));
    for (let i = 0; i < max; i++) {
      const factor = i === 0 ? 0 : i === max - 1 ? 1 : clampedPRNG(0, 1);
      this._steps.push(
        ColorRampStep.newWithAlpha(clampedPRNG(0, 1) * 0xffffff, clampedPRNG(0, 1), factor, i === 0 || i === max - 1),
      );
    }
    this.sortSteps(false);
    this.generateHash();
  }
}
