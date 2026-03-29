import type { AtmosphereUniforms } from '@core/tsl/materials/atmosphere.tslmat';
import type { CloudsUniforms } from '@core/tsl/materials/clouds.tslmat';
import type { PlanetUniforms } from '@core/tsl/materials/planet.tslmat';
import type { RingUniforms } from '@core/tsl/materials/ring.tslmat';
import type {
  AmbientLight,
  DataTexture,
  DirectionalLight,
  Group,
  Mesh,
  PerspectiveCamera,
  Scene,
  Texture,
  Timer,
} from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { WebGPURenderer } from 'three/webgpu';
import type { LensFlareEffect } from './effects/lens-flare.effect';
import type { BiomeParameters } from './models/biome-parameters.model';
import type { LayeredDataTexture } from './utils/texture/layered-data-texture';

// ---------------------------------- Editor types ----------------------------------
export type EditorMessageLevel = 'success' | 'info' | 'warn' | 'wip';
export enum EditorSceneCreationMode {
  EDITOR,
  PREVIEW,
}

// ----------------------------------- Model subtypes ---------------------------------
export enum PlanetType {
  PLANET,
  MOON,
  GASGIANT,
}
export enum PlanetClass {
  PLANET_TELLURIC,
  PLANET_ICE,
  PLANET_OCEAN,
  PLANET_TROPICAL,
  PLANET_ARID,
  PLANET_CHTHONIAN,
  PLANET_MAGMATIC,
  MOON_ROCKY,
  MOON_ICE,
  MOON_CHTHONIAN,
  GASGIANT_COLD,
  GASGIANT_HOT,
  INDETERMINATE,
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

// ------------------------------------ Main data -----------------------------------
export type EditorSceneData = {
  // Scene, renderer, camera
  scene: Scene;
  renderer: WebGPURenderer;
  camera: PerspectiveCamera;
  orbitControls?: OrbitControls;

  // Groups
  planetGroup: Group;
  ringAnchor: Group;

  // Main objects
  planet: PlanetMeshData;
  clouds: CloudsMeshData;
  atmosphere: AtmosphereMeshData;
  rings: RingMeshData[];
  sunLight: DirectionalLight;
  ambLight: AmbientLight;
  lensFlare?: LensFlareEffect;

  // Misc
  timer?: Timer;
};

// ------------------------------------ Mesh data -----------------------------------
export type PlanetMeshData = {
  mesh?: Mesh;
  uniforms?: PlanetUniforms;

  surfaceBuffer: Uint8Array;
  surfaceTexture?: DataTexture;

  biomeLayersTexture?: LayeredDataTexture<BiomeParameters>;
  biomeEmissiveLayersTexture?: LayeredDataTexture<BiomeParameters>;
};
export type CloudsMeshData = {
  mesh?: Mesh;
  uniforms?: CloudsUniforms;

  buffer: Uint8Array;
  texture?: DataTexture;
};
export type AtmosphereMeshData = {
  mesh?: Mesh;
  uniforms?: AtmosphereUniforms;
};
export type RingMeshData = {
  mesh?: Mesh;
  uniforms?: RingUniforms;

  buffer: Uint8Array | null;
  texture?: DataTexture;
};

// ----------------------------------- Baking types ---------------------------------
export type BakingTarget = {
  mesh: Mesh;
  textures: Texture[];
};
