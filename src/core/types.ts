import type { AtmosphereTSLMaterial } from '@tsl/materials/atmosphere.tslmat';
import type { CloudsTSLMaterial } from '@tsl/materials/clouds.tslmat';
import type { PlanetTSLMaterial } from '@tsl/materials/planet.tslmat';
import type { RingTSLMaterial } from '@tsl/materials/ring.tslmat';
import type TSLRenderPipeline from '@tsl/rendering/render-pipeline.ts';
import type {
  AmbientLight,
  DirectionalLight,
  Group,
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  RenderTarget,
  Scene,
  Timer,
} from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { WebGPURenderer } from 'three/webgpu';
import type { LensFlareEffect } from './effects/lens-flare.effect';

// ---------------------------------- Editor types ----------------------------------
export type EditorMessageLevel = 'success' | 'info' | 'warn' | 'wip';

export type EditorSceneCreationMode = (typeof EditorSceneCreationMode)[keyof typeof EditorSceneCreationMode];
export const EditorSceneCreationMode: Record<string, string> = {
  Editor: 'editor',
  Preview: 'preview',
  Baking: 'baking',
} as const;
export type EditorSceneObjects = {
  scene: Scene;
  renderer: WebGPURenderer;
  camera: PerspectiveCamera;
};
export type BakingSceneObjects = {
  renderer: WebGPURenderer;
  camera: OrthographicCamera;
  renderTarget: RenderTarget;
};
export type EditorBackendType = 'webgl' | 'webgpu';

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

  // Special components
  renderPipeline?: TSLRenderPipeline;

  // Groups
  planetGroup: Group;
  ringAnchor: Group;

  // Main objects
  planet: MeshData<PlanetTSLMaterial>;
  clouds: MeshData<CloudsTSLMaterial>;
  atmosphere: MeshData<AtmosphereTSLMaterial>;
  rings: MeshData<RingTSLMaterial>[];
  sunLight: DirectionalLight;
  ambLight: AmbientLight;
  lensFlare?: LensFlareEffect;

  // Misc
  timer?: Timer;
};

// ------------------------------------ Mesh data -----------------------------------
export type MeshData<TTSLMaterial> = {
  mesh: Mesh;
  tslMaterial: TTSLMaterial;
};
