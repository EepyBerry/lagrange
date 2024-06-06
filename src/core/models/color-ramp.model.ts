import * as THREE from 'three'

export class ColorRampStep {
  static EMPTY = new ColorRampStep(0x0, 1)

  color: THREE.Color
  factor: number

  constructor(color: number | string, factor: number) {
    this.color = new THREE.Color(color)
    this.factor = factor
  }
}

export class ColorRamp {
  static EMPTY = new ColorRamp([])

  _steps: ColorRampStep[] = []
  _size: number
  _maxSize: number = 16

  constructor(steps: ColorRampStep[], maxSize: number = 16) {
    this._maxSize = maxSize
    this._steps = this.computeSteps(steps)
    this._size = steps.length
  }

  public get steps() {
    return this._steps
  }
  public set steps(steps: ColorRampStep[]) {
    this._steps = this.computeSteps(steps)
  }

  public get definedSize() {
    return this._size
  }

  public get maxSize() {
    return this._maxSize
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
}