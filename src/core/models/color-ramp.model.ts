import * as THREE from 'three'
import { ChangeTracker } from './change-tracker.model'
import { numberEquals } from '@/utils/utils'
import { nanoid } from 'nanoid'

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

  static newWithAlpha(color: THREE.ColorRepresentation, alpha: number, factor: number, isBound: boolean = false): ColorRampStep {
    const step = new ColorRampStep(color, factor)
    step.alpha = alpha
    return step
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

  constructor(changedPropsRef: string[], changePrefix: string, steps: ColorRampStep[], maxSize: number = 16, lockedSize = false) {
    super(changedPropsRef, changePrefix)
    this._maxSize = maxSize
    this._steps = steps
    this._lockedSize = lockedSize
    this.markForChange(this._changePrefix)
  }

  public get steps() {
    return this.computeSteps()
  }
  public set steps(steps: ColorRampStep[]) {
    this._steps.splice(0)
    this._steps.push(...steps)
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

  public get colors() {
    return this.computeSteps().map((s) => s.color)
  }

  public get factors() {
    return this.computeSteps().map((s) => s.factor)
  }

  public get definedSteps() {
    return this._steps
  }

  public get definedColors() {
    return this._steps.map((s) => s.color)
  }

  public get definedFactors() {
    return this._steps.map((s) => s.factor)
  }

  // Utility functions

  private computeSteps() {
    const maxStep = this._steps.find((s) => numberEquals(s.factor, 1))
    const computed = Array.from(this._steps).sort((a, b) => a.factor - b.factor)
    computed.push(...Array(this._maxSize - this._steps.length).fill(maxStep))
    return computed
  }

  public sortSteps() {
    this._steps.sort((a, b) => a.factor - b.factor)
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

  public setStep(stepId: string, color?: string, factor?: number) {
    const index = this._steps.findIndex((s) => s.id === stepId)
    if (index === -1) {
      throw new Error('Cannot find step with ID ' + stepId)
    }

    this._steps[index].color = color ? new THREE.Color(color) : this._steps[index].color
    this._steps[index].factor = factor ?? this._steps[index].factor
    this.markForChange(this._changePrefix)
  }

  public updateStep(id: string, options: { color?: string, factor?: number, alpha?: number }) {
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

  public load(data: any) {
    this._steps.splice(0)
    this._steps.push(...data._steps.map((s: any) => new ColorRampStep(s._color, s._factor, s._isBound)))
  }

  public loadFromSteps(data: ColorRampStep[]) {
    this._steps.splice(0)
    this._steps.push(...data.map((s: any) => new ColorRampStep(s._color, s._factor, s._isBound)))
  }
}
