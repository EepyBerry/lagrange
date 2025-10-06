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
} from 'three'
import type { LensFlareEffect } from './effects/lens-flare.effect'
import type { WebGPURenderer } from 'three/webgpu'
import type { PlanetUniforms } from '@core/tsl/materials/planet.tslmat'
import type { AtmosphereUniforms } from '@core/tsl/materials/atmosphere.tslmat'
import type { CloudsUniforms } from '@core/tsl/materials/clouds.tslmat'
import type { RingUniforms } from '@core/tsl/materials/ring.tslmat'
import type { LensFlareUniforms } from '@core/tsl/materials/lens-flare.tslmat'

// ---------------------------------- Editor types ----------------------------------
export type EditorMessageLevel = 'success' | 'info' | 'warn' | 'wip'
export enum EditorSceneCreationMode {
  EDITOR,
  PREVIEW,
}
export enum EditorBackendType {
  WEBGL,
  WEBGPU,
}

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

export type RawRGBA = {
  r: number
  g: number
  b: number
  a: number
}

// ------------------------------------ Main data -----------------------------------
export type EditorSceneData = {
  // Scene, renderer, camera
  scene: Scene
  renderer: WebGPURenderer
  camera: PerspectiveCamera

  // Groups
  planetGroup: Group
  ringAnchor: Group

  // Main objects
  planet: PlanetMeshData
  clouds: CloudsMeshData
  atmosphere: AtmosphereMeshData
  rings: RingMeshData[]
  sunLight: DirectionalLight
  ambLight: AmbientLight
  lensFlare?: LensFlareEffect

  // Misc
  clock?: Clock
}

// ------------------------------------ Mesh data -----------------------------------
export type PlanetMeshData = {
  mesh?: Mesh
  uniforms?: PlanetUniforms

  surfaceBuffer: Uint8Array
  surfaceTexture?: DataTexture

  biomesBuffer: Uint8Array
  biomesTexture?: DataTexture
}
export type CloudsMeshData = {
  mesh?: Mesh
  uniforms?: CloudsUniforms

  buffer: Uint8Array
  texture?: DataTexture
}
export type AtmosphereMeshData = {
  mesh?: Mesh
  uniforms?: AtmosphereUniforms
}
export type RingMeshData = {
  mesh?: Mesh
  uniforms?: RingUniforms

  buffer: Uint8Array | null
  texture?: DataTexture
}
export type LensFlareMeshdata = {
  mesh?: Mesh
  uniforms?: LensFlareUniforms
}

// ----------------------------------- Baking types ---------------------------------
export type BakingTarget = {
  mesh: Mesh
  textures: Texture[]
}
