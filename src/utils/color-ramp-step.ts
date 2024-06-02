import * as THREE from 'three'

export default class ColorRampStep {
  static EMPTY = new ColorRampStep("black", 0) 

  color: THREE.Color
  factor: number

  constructor(color: number | string, factor: number) {
    this.color = new THREE.Color(color)
    this.factor = factor
  }
}