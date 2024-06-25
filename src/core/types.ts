import type { PerspectiveCamera, Scene, WebGLRenderer } from "three"

export enum GeometryType {
  SPHERE, TORUS, BOX
}
export enum NoiseType {
  FBM, PERLIN
}