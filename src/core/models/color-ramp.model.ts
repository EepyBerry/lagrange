import * as THREE from 'three'
import { ChangeTracker } from './change-tracker.model'
import { generateUUID } from 'three/src/math/MathUtils.js'

export class ColorRampStep {
  static EMPTY = new ColorRampStep(0x0, 1)

  private _id: string // internal ID for tracking changes
  private _color: THREE.Color
  private _factor: number
  private _isBound: boolean

  constructor(color: number | string, factor: number, isBound: boolean = false) {
    this._id = generateUUID()
    this._color = new THREE.Color(color)
    this._factor = factor
    this._isBound = isBound
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
  private _size: number
  private  _maxSize: number = 16

  constructor(changedPropsRef: string[], changePrefix: string, steps: ColorRampStep[], maxSize: number = 16) {
    super(changedPropsRef, changePrefix)
    this._maxSize = maxSize
    this._steps = steps
    this._size = steps.length
    this.markForChange(this._changePrefix)
  }

  public get steps() {
    return this.computeSteps(this._steps)
  }
  public set steps(steps: ColorRampStep[]) {
    this._steps = steps
  }

  public get definedSize() {
    return this._size
  }

  public get maxSize() {
    return this._maxSize
  }

  public get colors() {
    return this.computeSteps(this._steps).map(s => s.color)
  }
  
  public get factors() {
    return this.computeSteps(this._steps).map(s => s.factor)
  }

  public get definedSteps() {
    return this._steps
  }

  public get definedColors() {
    return this._steps.map(s => s.color)
  }
  
  public get definedFactors() {
    return this._steps.map(s => s.factor)
  }

  // Utility functions

  private computeSteps(steps: ColorRampStep[]) {
    return Array(this._maxSize)
      .fill(ColorRampStep.EMPTY)
      .map((step, i) => i < steps.length ? ({color: steps[i].color, factor: steps[i].factor}) : step)
      .sort((a, b) => a.factor - b.factor)
  }

  public sortSteps() {
    this._steps.sort((a, b) => a.factor - b.factor)
  }

  public addStep() {
    if (this._steps.length >= this._maxSize - 1) {
      throw new Error('(ColorRamp) Maximum size reached')
    }
    this._steps.push(new ColorRampStep('black', this._steps[this._size-2].factor + 0.01))
    this.sortSteps()
    this._size++
    this.markForChange(this._changePrefix)
  }

  public setStep(stepId: string, color?: string, factor?: number) {
    const index = this._steps.findIndex(s => s.id === stepId)
    if (index === -1) {
      throw new Error('Cannot find step with ID '+stepId)
    }

    this._steps[index].color = color ? new THREE.Color(color) : this._steps[index].color
    this._steps[index].factor = factor ?? this._steps[index].factor
    this.markForChange(this._changePrefix)
  }

  public removeStep(stepId: string) {
    if (this.isBoundStep(stepId)) {
      console.warn('(ColorRamp) Cannot delete ramp bounds! (factor=0|1)')
      return
    }
    const index = this._steps.findIndex(s => s.id === stepId)
    if (index === -1) {
      throw new Error('Cannot find step with ID '+stepId)
    }
    this._steps.splice(index, 1)
    this._size--
    this.markForChange(this._changePrefix)
  }
  
  public isBoundStep(stepId: string) {
    return this._steps.find(s => s.id === stepId)?.isBound
  }
}