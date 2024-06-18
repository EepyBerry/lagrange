import * as THREE from 'three'
import { ChangeTracker } from './change-tracker.model'
import { generateUUID } from 'three/src/math/MathUtils.js'

export class ColorRampStep {
  static EMPTY = new ColorRampStep(0x0, 1)

  private _id: string // internal ID for tracking changes
  private _color: THREE.Color
  private _factor: number

  constructor(color: number | string, factor: number) {
    this._id = generateUUID()
    this._color = new THREE.Color(color)
    this._factor = factor
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
  }

  public sortSteps() {
    this._steps.sort((a, b) => a.factor - b.factor)
  }

  public setStep(index: number, color?: string, factor?: number) {
    if (index < 0 || index > this._maxSize) {
      throw new Error('(ColorRamp) Invalid index given: '+index)
    }
    this._steps[index].color = color ? new THREE.Color(color) : this._steps[index].color
    this._steps[index].factor = factor ?? this._steps[index].factor
    //this.sortSteps()
    this.markForChange(this._changePrefix)
  }

  public removeStep(index: number) {
    if (index < 0 || index > this._maxSize) {
      throw new Error('(ColorRamp) Invalid index given: '+index)
    }
    if (this.isBoundStep(index)) {
      console.warn('(ColorRamp) Cannot delete ramp bounds! (factor=0|1)')
      return
    }
    this._steps.splice(index, 1)
    this.markForChange(this._changePrefix)
  }
  
  public isBoundStep(stepIdx: number) {
    return [0,1].includes(this._steps[stepIdx].factor)
  }
}