import type { SerializedPlanetData } from '@core/editor/workers/worker-serializer.types.ts';
import * as BakingHelper from '@core/helpers/baking.helper.ts';
import { type BakingSceneObjects, type EditorBackendType } from '@core/types.ts';
import { flipBufferY } from '@core/utils/render-utils.ts';
import { NearestFilter, NodeMaterial, DataTexture, WebGPURenderer, Mesh } from 'three/webgpu';

export type BakingWorkerInput = {
  type: 'baking';
  planetData: SerializedPlanetData;
  bakingResolution: number;
  bakingPixelize: boolean;
  renderingBackend: EditorBackendType;
};
export type BakingWorkerOutput =
  | { type: 'progress'; progress: number; texture?: string }
  | { type: 'error'; error: Error }
  | { type: 'done'; data: BakingWorkerOutputData };

export type BakingWorkerTextureRequest = {
  type: 'texture-request';
  width: number;
  height: number;
  operation: 'raw' | 'color-ramp' | 'biomes' | 'biomes-emissive';
  data: unknown;
};
export type BakingWorkerTextureResponse = {
  type: 'texture-response';
  textures: Uint8ClampedArray[];
};

type BakingWorkerInitTextures = {
  surface?: DataTexture;
  biomes?: DataTexture;
  biomesEmissive?: DataTexture;
  cracks?: DataTexture;
  craters?: DataTexture;
  clouds?: DataTexture;
  rings?: DataTexture[];
};
export type BakingWorkerOutputData = {
  planetMap?: Uint8Array;
  planetMetallicRoughnessMap?: Uint8Array;
  planetEmissiveMap?: Uint8Array;
  planetNormalMap?: Uint8Array;
  clouds?: Uint8Array;
  rings?: Uint8Array[];
};

// --------------------------------------------------------------------------------------------------------------------
const bakingObjects: BakingSceneObjects = initBakingObjects(2048, 'webgl');
const initTextures: BakingWorkerInitTextures = {};
const outputData: BakingWorkerOutputData = {};
let currentBakingInput: BakingWorkerInput;
// --------------------------------------------------------------------------------------------------------------------

const stepHandlers: Map<number, () => Promise<void>> = new Map();
stepHandlers
  .set(1, async () => {
    self.postMessage({ type: 'progress', progress: 1 });
    adjustBakingObjects(currentBakingInput.bakingResolution, currentBakingInput.renderingBackend);
  })
  .set(2, async () => {
    self.postMessage({ type: 'progress', progress: 2 });
    outputData.planetMap = await bakePlanetSurface();
  })
  .set(3, async () => {
    self.postMessage({ type: 'progress', progress: 3 });
    outputData.planetMetallicRoughnessMap = await bakePlanetMetallicRoughnessMap();
  })
  .set(4, async () => {
    self.postMessage({ type: 'progress', progress: 4 });
    outputData.planetEmissiveMap = await bakePlanetEmissivityMap();
  })
  .set(5, async () => {
    self.postMessage({ type: 'progress', progress: 5 });
    outputData.planetNormalMap = await bakePlanetNormalMap();
  })
  .set(6, async () => {
    self.postMessage({ type: 'progress', progress: 6 });
    if (currentBakingInput.planetData.cloudsEnabled) {
      outputData.clouds = await bakeClouds();
    }
  })
  .set(7, async () => {
    self.postMessage({ type: 'progress', progress: 7 });
    if (currentBakingInput.planetData.ringsEnabled && currentBakingInput.planetData.ringsParams.length > 0) {
      outputData.rings = await bakeRings();
    }
  })
  .set(8, async () => {
    self.postMessage({ type: 'progress', progress: 8 });
    await sendOutputAndDisposeTextures();
  });

// --------------------------------------------------------------------------------------------------------------------

// when receiving the initial message, request ALL textures for the current planet (for simplicity, overhead is negligible at this point)
// after receiving the textures, start baking every map one by one
self.onmessage = async (event: MessageEvent<BakingWorkerInput | BakingWorkerTextureResponse>) => {
  if (event.data.type === 'baking') {
    currentBakingInput = event!.data;
    requestTextures();
  } else if (event.data.type === 'texture-response') {
    const dataTextures = event.data.textures?.map((buffer) => {
      const dt = new DataTexture(buffer, currentBakingInput.bakingResolution, currentBakingInput.bakingResolution);
      dt.needsUpdate = true;
      return dt;
    });
    initTextures.surface = dataTextures[0];
    initTextures.biomes = dataTextures[1];
    initTextures.biomesEmissive = dataTextures[2];
    initTextures.cracks = dataTextures[3];
    initTextures.craters = dataTextures[4];
    initTextures.clouds = dataTextures[5];
    initTextures.rings = dataTextures.slice(6);

    for (let i = 1; i <= 8; i++) {
      await stepHandlers.get(i)!();
    }
  }
};

// --------------------------------------------------------------------------------------------------------------------

/**
 * Baking pre-step: request the necessary textures
 */
function requestTextures() {
  self.postMessage(<BakingWorkerTextureRequest[]>[
    {
      type: 'texture-request',
      width: currentBakingInput.bakingResolution,
      height: currentBakingInput.bakingResolution,
      operation: 'color-ramp',
      data: currentBakingInput.planetData.planetSurfaceColorRamp.steps,
    },
    {
      type: 'texture-request',
      width: currentBakingInput.bakingResolution,
      height: currentBakingInput.bakingResolution,
      operation: 'biomes',
      data: currentBakingInput.planetData.biomesParams,
    },
    {
      type: 'texture-request',
      width: currentBakingInput.bakingResolution,
      height: currentBakingInput.bakingResolution,
      operation: 'biomes-emissive',
      data: currentBakingInput.planetData.biomesParams,
    },
    {
      type: 'texture-request',
      width: currentBakingInput.bakingResolution,
      height: currentBakingInput.bakingResolution,
      operation: 'color-ramp',
      data: currentBakingInput.planetData.cracksColorRamp.steps,
    },
    {
      type: 'texture-request',
      width: currentBakingInput.bakingResolution,
      height: currentBakingInput.bakingResolution,
      operation: 'color-ramp',
      data: currentBakingInput.planetData.cratersColorRamp.steps,
    },
    {
      type: 'texture-request',
      width: currentBakingInput.bakingResolution,
      height: currentBakingInput.bakingResolution,
      operation: 'color-ramp',
      data: currentBakingInput.planetData.cloudsColorRamp.steps,
    },
    ...(<BakingWorkerTextureRequest[]>currentBakingInput.planetData.ringsParams.map((ringParams) => ({
      type: 'texture-request',
      width: currentBakingInput.bakingResolution,
      height: currentBakingInput.bakingResolution,
      operation: 'color-ramp',
      data: ringParams.colorRamp.steps,
    }))),
  ]);
}

/**
 * Baking step 1: prepare the baking objects
 * @param bakingResolution camera resolution for baking; powers of two only
 * @param renderingBackend backend to render meshes on (WebGL or WebGPU)
 */
function initBakingObjects(bakingResolution: number, renderingBackend: EditorBackendType): BakingSceneObjects {
  return BakingHelper.createBakingObjects(renderingBackend, bakingResolution, bakingResolution, 1);
}

/**
 * Baking step 1 (alt): reset the baking objects
 * @param bakingResolution camera resolution for baking; powers of two only
 * @param renderingBackend backend to render meshes on (WebGL or WebGPU)
 */
function adjustBakingObjects(bakingResolution: number, renderingBackend: EditorBackendType): void {
  if (!bakingResolution || bakingResolution <= 0 || !Number.isFinite(bakingResolution)) {
    self.postMessage({ type: 'error', error: new Error(`Invalid baking resolution: ${bakingResolution}`) });
    return;
  }
  if (!bakingObjects) {
    self.postMessage({ type: 'error', error: new Error('Baking objects not initialized before updating') });
    return;
  }

  bakingObjects.renderer.dispose();
  bakingObjects.renderer = new WebGPURenderer({
    antialias: true,
    alpha: true,
    forceWebGL: renderingBackend == 'webgl',
    canvas: new OffscreenCanvas(bakingResolution, bakingResolution),
  });

  bakingObjects.camera.left = -bakingResolution / 2;
  bakingObjects.camera.right = bakingResolution / 2;
  bakingObjects.camera.top = bakingResolution / 2;
  bakingObjects.camera.bottom = -bakingResolution / 2;
  bakingObjects.camera.updateProjectionMatrix();

  bakingObjects.renderTarget.setSize(bakingResolution, bakingResolution);
}

// --------------------------------------------------------------------------------------------------------------------

/**
 * Baking step 2: bake planet surface with features
 */
async function bakePlanetSurface(): Promise<Uint8Array> {
  const mesh = BakingHelper.createBakingPlanet(currentBakingInput.planetData, [
    initTextures.surface!,
    initTextures.biomes!,
    initTextures.cracks!,
    initTextures.craters!,
  ]);
  return await bakeMeshIntoBuffer(mesh, currentBakingInput.renderingBackend === 'webgpu');
}

/**
 * Baking step 3: bake planet metallic-roughness map (PBR)
 */
async function bakePlanetMetallicRoughnessMap(): Promise<Uint8Array> {
  const mesh = BakingHelper.createBakingMetallicRoughnessMap(currentBakingInput.planetData, [initTextures.craters!]);
  return await bakeMeshIntoBuffer(mesh, currentBakingInput.renderingBackend === 'webgpu');
}

/**
 * Baking step 4: bake planet emissivity map
 */
async function bakePlanetEmissivityMap(): Promise<Uint8Array> {
  const mesh = BakingHelper.createBakingEmissivityMap(currentBakingInput.planetData, [
    initTextures.surface!,
    initTextures.biomes!,
    initTextures.biomesEmissive!,
    initTextures.cracks!,
  ]);
  return await bakeMeshIntoBuffer(mesh, currentBakingInput.renderingBackend === 'webgpu');
}

/**
 * Baking step 5: bake planet height map and derive its normal map from that
 */
async function bakePlanetNormalMap(): Promise<Uint8Array> {
  const heightMapMesh = BakingHelper.createBakingHeightMap(currentBakingInput.planetData, [initTextures.craters!]);
  const heightMapTex = await BakingHelper.bakeMesh(
    bakingObjects.renderer,
    bakingObjects.camera,
    bakingObjects.renderTarget,
    heightMapMesh,
  );

  const mesh = await BakingHelper.createBakingNormalMap(currentBakingInput.planetData, [heightMapTex]);
  const buffer = await bakeMeshIntoBuffer(mesh);
  heightMapMesh.geometry.dispose();
  (<NodeMaterial>heightMapMesh.material).dispose();
  heightMapTex.dispose();
  return buffer;
}

/**
 * Baking step 6: bake clouds
 */
async function bakeClouds(): Promise<Uint8Array> {
  const mesh = BakingHelper.createBakingClouds(currentBakingInput.planetData, [initTextures.clouds!]);
  return await bakeMeshIntoBuffer(mesh, currentBakingInput.renderingBackend === 'webgpu');
}

/**
 * Baking step 7: bake every ring
 */
async function bakeRings(): Promise<Uint8Array[]> {
  const ringTargets: Uint8Array[] = [];
  for (let idx = 0; idx < currentBakingInput.planetData.ringsParams.length; idx++) {
    const mesh = BakingHelper.createBakingRing(currentBakingInput.planetData, [initTextures.rings![idx]], idx);
    const buffer = await bakeMeshIntoBuffer(mesh);
    ringTargets.push(buffer);
  }
  return ringTargets;
}

/**
 * Common texture baking process for meshes
 * @param mesh the mesh to bake
 * @param flipY if the resulting image data buffer should be flipped vertically
 */
async function bakeMeshIntoBuffer(mesh: Mesh, flipY: boolean = false): Promise<Uint8Array> {
  const texture = await BakingHelper.bakeMesh(
    bakingObjects.renderer,
    bakingObjects.camera,
    bakingObjects.renderTarget,
    mesh,
  );
  if (currentBakingInput.bakingPixelize) {
    texture.minFilter = NearestFilter;
    texture.magFilter = NearestFilter;
  }

  const buffer = new Uint8Array(<Uint8Array>texture.image.data);
  if (flipY) {
    buffer.set(flipBufferY(buffer, currentBakingInput.bakingResolution, currentBakingInput.bakingResolution));
  }

  mesh.geometry.dispose();
  (<NodeMaterial>mesh.material).dispose();
  texture.dispose();
  return buffer;
}

async function sendOutputAndDisposeTextures(): Promise<void> {
  initTextures.surface?.dispose();
  initTextures.biomes?.dispose();
  initTextures.biomesEmissive?.dispose();
  initTextures.cracks?.dispose();
  initTextures.craters?.dispose();
  initTextures.clouds?.dispose();
  initTextures.rings?.forEach((tex) => tex.dispose());
  self.postMessage(<BakingWorkerOutput>{
    type: 'done',
    data: outputData,
  });
}
