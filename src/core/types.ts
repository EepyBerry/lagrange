import type { AmbientLight, Clock, DataTexture, DirectionalLight, Group, Mesh, PerspectiveCamera, Scene, Texture, WebGLRenderer } from 'three'
import type { SceneElements } from './models/scene-elements.model'
import type { LensFlareEffect } from './three/lens-flare.effect'

export type InfoLevel = 'success' | 'info' | 'warn' | 'wip'

// ---------------------------------- Shader loader ---------------------------------
export enum ShaderFileType {
  CORE,
  BAKING,
  FUNCTION,
}

// ----------------------------------- Editor types ---------------------------------
export enum PlanetType {
  PLANET,
  STAR,
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

export type PlanetPreviewData = {
  sun: DirectionalLight
  ambientLight: AmbientLight
  planet: Mesh
  clouds: Mesh
  atmosphere: Mesh
  ring: Mesh
}
export type PlanetSceneData = {
  // Scene, renderer, camera
  scene?: Scene
  renderer?: WebGLRenderer
  camera?: PerspectiveCamera

  // Groups
  planetGroup?: Group
  ringAnchor?: Group

  // Main objects
  planet?: Mesh
  clouds?: Mesh
  atmosphere?: Mesh
  ring?: Mesh
  sunLight?: DirectionalLight
  ambLight?: AmbientLight
  lensFlare?: LensFlareEffect

  // DataTextures
  surfaceDataTex?: DataTexture
  cloudsDataTex?: DataTexture
  biomeDataTex?: DataTexture
  ringDataTex?: DataTexture

  // Misc
  clock?: Clock
}

// ----------------------------------- Baking types ---------------------------------
export type BakingTarget = {
  mesh: Mesh
  textures: Texture[]
}
