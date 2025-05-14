import type {
  AmbientLight,
  Clock,
  DataTexture,
  DirectionalLight,
  Group,
  Mesh,
  PerspectiveCamera,
  Scene,
  Texture,
  WebGLRenderer,
} from 'three'
import type { LensFlareEffect } from './three/lens-flare.effect'
import type { WebGPURenderer } from 'three/webgpu'

export type InfoLevel = 'success' | 'info' | 'warn' | 'wip'

// ---------------------------------- Shader loader ---------------------------------
export enum ShaderFileType {
  CORE,
  BAKING,
  FUNCTION,
}

// ----------------------------------- Editor types ---------------------------------
export type SceneRenderObjects = {
  scene: Scene
  renderer: WebGPURenderer
  camera: PerspectiveCamera
}

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
  renderer?: WebGPURenderer
  camera?: PerspectiveCamera

  // Groups
  planetGroup?: Group
  ringAnchor?: Group

  // Main objects
  planet?: Mesh
  clouds?: Mesh
  atmosphere?: Mesh
  rings?: GenericMeshData[]
  sunLight?: DirectionalLight
  ambLight?: AmbientLight
  lensFlare?: LensFlareEffect

  // DataTextures
  surfaceDataTex?: DataTexture
  cloudsDataTex?: DataTexture
  biomeDataTex?: DataTexture

  // Misc
  clock?: Clock
}
export type PlanetMeshData = {
  mesh: Mesh
  surfaceBuffer: Uint8Array
  surfaceTexture: DataTexture
  biomesBuffer: Uint8Array
  biomesTexture: DataTexture
}
export type GenericMeshData = {
  mesh: Mesh
  texture: DataTexture
  buffer: Uint8Array | null
}

// ----------------------------------- Baking types ---------------------------------
export type BakingTarget = {
  mesh: Mesh
  textures: Texture[]
}
