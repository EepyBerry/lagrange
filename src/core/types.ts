import type { DataTexture } from 'three'
import type { ColorRamp } from './models/color-ramp.model'

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

export type BiomeRect = {
  colors: ColorRamp
  x: number
  y: number
  w: number
  h: number
}

export type DataTextureWrapper = {
  texture: DataTexture
  data: Uint8Array
}
