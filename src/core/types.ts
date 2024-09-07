import type { DataTexture } from 'three'

export enum GeometryType {
  SPHERE,
  TORUS,
  BOX,
}
export enum NoiseType {
  FBM,
  PERLIN,
}
export enum ColorMode {
  REALISTIC,
  DIRECT,
  MIXED,
}
export enum GradientMode {
  REALISTIC = 0,
  POLE_TO_POLE = 1,
  FULLNOISE = 2,
}

export type InfoLevel = 'success' | 'info' | 'warn' | 'wip'

export type Rect = {
  x: number
  y: number
  w: number
  h: number
}
export type Point = {
  x: number
  y: number
}

export type DataTextureWrapper = {
  texture: DataTexture
  data: Uint8Array
}
