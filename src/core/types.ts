import type { DataTexture, Mesh, Texture } from 'three'

export type InfoLevel = 'success' | 'info' | 'warn' | 'wip'

// ---------------------------------- Shader loader ---------------------------------
export enum ShaderFileType {
  CORE,
  BAKING,
  FUNCTION
}

// ----------------------------------- Editor types ---------------------------------
export enum PlanetType {
  TELLURIC,
  GASEOUS,
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

// ----------------------------------- Baking types ---------------------------------
export type BakingTarget = {
  mesh: Mesh
  textures: Texture[]
}