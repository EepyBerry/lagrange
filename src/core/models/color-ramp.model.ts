import * as THREE from 'three'

export class ColorRamp {
  steps: ColorRampStep[] = []
  size: number

  constructor(steps: ColorRampStep[]) {
    this.steps = steps
    this.size = steps.length
  }
}

export class ColorRampStep {
  static EMPTY = new ColorRampStep(0x0, 1)

  color: THREE.Color
  factor: number

  constructor(color: number | string, factor: number) {
    this.color = new THREE.Color(color)
    this.factor = factor
  }
}