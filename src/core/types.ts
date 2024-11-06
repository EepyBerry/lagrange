import type { DataTexture } from 'three'

export type InfoLevel = 'success' | 'info' | 'warn' | 'wip'

export enum PlanetType {
  TELLURIC,
  GASEOUS
}
export enum GeometryType {
  SPHERE,
  RING
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

export type Rect = {
  x: number
  y: number
  w: number
  h: number
  r?: number
  b?: number
}
export type Coordinates2D = {
  x: number
  y: number
}
export type RawRGBA = {
  r: number
  g: number
  b: number
  a: number
}

export type DataTextureWrapper = {
  texture: DataTexture
  data: Uint8Array
}
