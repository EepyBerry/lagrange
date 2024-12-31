import * as THREE from 'three'
import { ChangeTracker, type ChangedProp } from './change-tracker.model'
import { nanoid } from 'nanoid'
import { getColorLuminance } from '@/utils/utils'

export type StepLuminance = { factor: number; lumi: number }
export class ColorRampStep {
  static EMPTY = new ColorRampStep(0x0, 1)

  private _id: string // internal ID for tracking changes
  private _color: THREE.Color
  private _alpha: number
  private _factor: number
  private _isBound: boolean

  constructor(color: THREE.ColorRepresentation, factor: number, isBound: boolean = false) {
    this._id = nanoid()
    this._color = new THREE.Color(color)
    this._alpha = 1.0
    this._factor = factor
    this._isBound = isBound
  }

  static newWithAlpha(
    color: THREE.ColorRepresentation,
    alpha: number,
    factor: number,
    isBound: boolean = false,
  ): ColorRampStep {
    const step = new ColorRampStep(color, factor, isBound)
    step.alpha = alpha ?? 1.0
    return step
  }

  clone(): ColorRampStep {
    return ColorRampStep.newWithAlpha(this._color, this._alpha, this._factor, this._isBound)
  }

  public get id() {
    return this._id
  }

  public get color() {
    return this._color
  }
  public set color(color: THREE.Color) {
    this._color = color
  }

  public get alpha(): number {
    return this._alpha
  }
  public set alpha(value: number) {
    this._alpha = value
  }
  public get factor() {
    return this._factor
  }
  public set factor(factor: number) {
    this._factor = factor
  }
  public get isBound(): boolean {
    return this._isBound
  }
}

export class ColorRamp extends ChangeTracker {
  static EMPTY = new ColorRamp([], '', [])

  private _steps: ColorRampStep[] = []
  private _maxSize: number = 16
  private _lockedSize: boolean = true

  constructor(
    changedPropsRef: ChangedProp[],
    changePrefix: string,
    steps: ColorRampStep[],
    maxSize: number = 16,
    lockedSize = false,
  ) {
    super(changedPropsRef, changePrefix)
    this._maxSize = maxSize
    this._steps = steps
    this._lockedSize = lockedSize
    this.markForChange(this._changePrefix)
  }

  clone(): ColorRamp {
    const clonedSteps: ColorRampStep[] = []
    this.steps.forEach((s) => clonedSteps.push(s.clone()))
    return new ColorRamp([], this._changePrefix, clonedSteps, this._maxSize, this._lockedSize)
  }

  public get steps(): ColorRampStep[] {
    return this._steps
  }

  public get maxSize() {
    return this._maxSize
  }
  public get lockedSize(): boolean {
    return this._lockedSize
  }
  public set lockedSize(value: boolean) {
    this._lockedSize = value
  }

  // Utility functions

  public sortSteps() {
    this._steps.sort((a, b) => a.factor - b.factor)
    this.markForChange(this._changePrefix)
  }

  public addStep() {
    if (this._steps.length >= this._maxSize - 1) {
      throw new Error('(ColorRamp) Maximum size reached')
    }
    this._steps.push(new ColorRampStep('black', this._steps[this._steps.length - 2].factor))
    this.sortSteps()
    this.markForChange(this._changePrefix)
  }

  public getStep(stepId: string) {
    const index = this._steps.findIndex((s) => s.id === stepId)
    if (index === -1) {
      throw new Error('Cannot find step with ID ' + stepId)
    }
    return this._steps[index]
  }

  public updateStep(id: string, options: { color?: string; factor?: number; alpha?: number }) {
    const index = this._steps.findIndex((s) => s.id === id)
    if (index === -1) {
      throw new Error('Cannot find step with ID ' + id)
    }

    this._steps[index].color.set(options.color ? options.color : this._steps[index].color)
    this._steps[index].alpha = options.alpha ?? this._steps[index].alpha
    this._steps[index].factor = options.factor ?? this._steps[index].factor
    this.markForChange(this._changePrefix)
  }

  public removeStep(stepId: string) {
    if (this.isBoundStep(stepId)) {
      console.warn('(ColorRamp) Cannot delete ramp bounds! (factor=0|1)')
      return
    }
    const index = this._steps.findIndex((s) => s.id === stepId)
    if (index === -1) {
      throw new Error('Cannot find step with ID ' + stepId)
    }
    this._steps.splice(index, 1)
    this.markForChange(this._changePrefix)
  }

  public isBoundStep(stepId: string) {
    return this._steps.find((s) => s.id === stepId)?.isBound
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public loadFromSteps(data: any[]) {
    if (!data) {
      return
    }
    this._steps.splice(0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this._steps.push(...data.map((s: any) => ColorRampStep.newWithAlpha(s._color, s._alpha, s._factor, s._isBound)))
  }

  /**
   * Gets a lookup table for luminance values
   * @remarks only used for opacity-based ramps
   * @param luminance
   */
  public getLuminanceLookup(): StepLuminance[] {
    return this._steps.map((s) => ({ factor: s.factor, lumi: getColorLuminance(s.color) }))
  }

  public getRelativeLuminance(startStep: number, endStep: number, relativePct: number): number {
    return getColorLuminance(this._steps[startStep].color.lerp(this._steps[endStep].color, relativePct))
  }
}
