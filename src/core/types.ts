import type { PerspectiveCamera, Scene, WebGLRenderer } from "three"

export type SceneElements = {
  scene: Scene,
  renderer: WebGLRenderer,
  camera: PerspectiveCamera
}

export enum GeometryType {
  ICOSPHERE, TORUS, BOX
}
export enum NoiseType {
  FBM, PERLIN
}