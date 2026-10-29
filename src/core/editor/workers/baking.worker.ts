import type { SerializedPlanetData } from '@core/editor/workers/worker-serializer.types.ts';
import type { BakingSceneObjects } from '@core/helpers/baking.helper.ts';
import * as BakingHelper from '@core/helpers/baking.helper.ts';
import { type EditorBackendType } from '@core/types.ts';
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

type BakingResolution = 'square' | 'equirectangular';
type BakingWorkerMeshes = {
  planet?: Mesh;
};
type BakingWorkerTextures = {
  surface?: DataTexture;
  biomes?: DataTexture;
  biomesEmissive?: DataTexture;
  cracksSurface?: DataTexture;
  cracksUnderwater?: DataTexture;
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
const bakingObjects: BakingSceneObjects = {};
const bakingTextures: BakingWorkerTextures = {};
const bakingMeshes: BakingWorkerMeshes = {};
const outputData: BakingWorkerOutputData = {};
let currentBakingInput: BakingWorkerInput;

const stepHandlers: (() => Promise<void>)[] = [];
// --------------------------------------------------------------------------------------------------------------------

init()
  .then(() => {
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
        bakingTextures.surface = dataTextures[0];
        bakingTextures.biomes = dataTextures[1];
        bakingTextures.biomesEmissive = dataTextures[2];
        bakingTextures.cracksSurface = dataTextures[3];
        bakingTextures.cracksUnderwater = dataTextures[4];
        bakingTextures.craters = dataTextures[5];
        bakingTextures.clouds = dataTextures[6];
        bakingTextures.rings = dataTextures.slice(7);

        for (const handler of stepHandlers) {
          await handler();
        }
      }
    };
  })
  .catch((error) => {
    console.error('<Lagrange> Baking worker failed to initialize!', error);
    self.postMessage({ type: 'error', error });
  });

// --------------------------------------------------------------------------------------------------------------------

/**
 * Initialise this worker
 */
async function init(): Promise<void> {
  const { renderer, camera, renderTarget } = BakingHelper.createBakingSceneObjects('webgl', 2048, 2048, 1);
  bakingObjects.renderer = renderer;
  bakingObjects.camera = camera;
  bakingObjects.renderTarget = renderTarget;

  bakingMeshes.planet = await BakingHelper.loadPlaneSphereMesh();
  //bakingMeshes.planet = new Mesh(new SphereGeometry(1, 48, 48));

  stepHandlers.push(async () => {
    self.postMessage({ type: 'progress', progress: 1 });
    updateBakingObjects('equirectangular');
  });
  stepHandlers.push(async () => {
    self.postMessage({ type: 'progress', progress: 2 });
    outputData.planetMap = await bakePlanetSurface();
  });
  stepHandlers.push(async () => {
    self.postMessage({ type: 'progress', progress: 3 });
    outputData.planetMetallicRoughnessMap = await bakePlanetMetallicRoughnessMap();
  });
  stepHandlers.push(async () => {
    self.postMessage({ type: 'progress', progress: 4 });
    outputData.planetEmissiveMap = await bakePlanetEmissivityMap();
  });
  stepHandlers.push(async () => {
    self.postMessage({ type: 'progress', progress: 5 });
    outputData.planetNormalMap = await bakePlanetNormalMap();
  });
  stepHandlers.push(async () => {
    self.postMessage({ type: 'progress', progress: 6 });
    if (currentBakingInput.planetData.cloudsEnabled) {
      outputData.clouds = await bakeClouds();
    }
  });
  stepHandlers.push(async () => {
    self.postMessage({ type: 'progress', progress: 7 });
    updateBakingObjects('square');
    if (currentBakingInput.planetData.ringsEnabled && currentBakingInput.planetData.ringsParams.length > 0) {
      outputData.rings = await bakeRings();
    }
  });
  stepHandlers.push(async () => {
    self.postMessage({ type: 'progress', progress: 8 });
    await sendOutputAndDispose();
  });
  console.info('<Lagrange> Baking worker initialized successfully');
}

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
      data: currentBakingInput.planetData.cracksSurfaceColorRamp.steps,
    },
    {
      type: 'texture-request',
      width: currentBakingInput.bakingResolution,
      height: currentBakingInput.bakingResolution,
      operation: 'color-ramp',
      data: currentBakingInput.planetData.cracksUnderwaterColorRamp.steps,
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
 * Adjust and reload the baking objects according to the given parameters
 * @param resolutionMode square or equirectangular
 */
function updateBakingObjects(resolutionMode: BakingResolution): void {
  if (
    !currentBakingInput.bakingResolution ||
    currentBakingInput.bakingResolution <= 0 ||
    !Number.isFinite(currentBakingInput.bakingResolution) ||
    currentBakingInput.bakingResolution % 2 !== 0
  ) {
    self.postMessage({
      type: 'error',
      error: new Error(`Invalid baking resolution: ${currentBakingInput.bakingResolution}`),
    });
    return;
  }
  if (!bakingObjects) {
    self.postMessage({ type: 'error', error: new Error('Baking objects not initialized before updating') });
    return;
  }

  // convert resolution to the correct aspect ratio
  // note: equirectangular projection has the constraint [width = 2 * height]
  const bakingWidth =
    resolutionMode === 'equirectangular'
      ? currentBakingInput.bakingResolution * 2
      : currentBakingInput.bakingResolution;
  const bakingHeight = currentBakingInput.bakingResolution;

  bakingObjects.renderer!.dispose();
  bakingObjects.renderer = new WebGPURenderer({
    antialias: true,
    alpha: true,
    forceWebGL: currentBakingInput.renderingBackend == 'webgl',
    canvas: new OffscreenCanvas(bakingWidth, bakingHeight),
  });

  bakingObjects.camera!.left = -bakingWidth / 2;
  bakingObjects.camera!.right = bakingWidth / 2;
  bakingObjects.camera!.top = bakingHeight / 2;
  bakingObjects.camera!.bottom = -bakingHeight / 2;
  bakingObjects.camera!.updateProjectionMatrix();

  bakingObjects.renderTarget!.setSize(bakingWidth, bakingHeight);
}

// --------------------------------------------------------------------------------------------------------------------

/**
 * Baking step 2: bake planet surface with features
 */
async function bakePlanetSurface(): Promise<Uint8Array> {
  return await bakeMeshIntoBuffer(
    BakingHelper.createBakingPlanet(bakingMeshes.planet!, currentBakingInput.planetData, [
      bakingTextures.surface!,
      bakingTextures.biomes!,
      bakingTextures.cracksSurface!,
      bakingTextures.cracksUnderwater!,
      bakingTextures.craters!,
    ]),
    currentBakingInput.renderingBackend === 'webgpu',
  );
}

/**
 * Baking step 3: bake planet metallic-roughness map (PBR)
 */
async function bakePlanetMetallicRoughnessMap(): Promise<Uint8Array> {
  return await bakeMeshIntoBuffer(
    BakingHelper.createBakingMetallicRoughnessMap(bakingMeshes.planet!, currentBakingInput.planetData, [
      bakingTextures.craters!,
    ]),
    currentBakingInput.renderingBackend === 'webgpu',
  );
}

/**
 * Baking step 4: bake planet emissivity map
 */
async function bakePlanetEmissivityMap(): Promise<Uint8Array> {
  return await bakeMeshIntoBuffer(
    BakingHelper.createBakingEmissivityMap(bakingMeshes.planet!, currentBakingInput.planetData, [
      bakingTextures.surface!,
      bakingTextures.biomes!,
      bakingTextures.biomesEmissive!,
      bakingTextures.cracksSurface!,
      bakingTextures.cracksUnderwater!,
    ]),
    currentBakingInput.renderingBackend === 'webgpu',
  );
}

/**
 * Baking step 5: bake planet height map and derive its normal map from that
 */
async function bakePlanetNormalMap(): Promise<Uint8Array> {
  const heightMapMesh = BakingHelper.createBakingHeightMap(bakingMeshes.planet!, currentBakingInput.planetData, [
    bakingTextures.craters!,
  ]);
  const heightMapTex = await BakingHelper.bakeMesh(
    bakingObjects.renderer!,
    bakingObjects.camera!,
    bakingObjects.renderTarget!,
    heightMapMesh,
  );
  heightMapTex.flipY = true;
  heightMapTex.needsUpdate = true;

  const mesh = BakingHelper.createBakingNormalMap(bakingMeshes.planet!, currentBakingInput.planetData, [heightMapTex]);
  const buffer = await bakeMeshIntoBuffer(mesh, currentBakingInput.renderingBackend === 'webgpu');
  heightMapMesh.geometry.dispose();
  (<NodeMaterial>heightMapMesh.material).dispose();
  heightMapTex.dispose();
  return buffer;
}

/**
 * Baking step 6: bake clouds
 */
async function bakeClouds(): Promise<Uint8Array> {
  return await bakeMeshIntoBuffer(
    BakingHelper.createBakingClouds(bakingMeshes.planet!, currentBakingInput.planetData, [bakingTextures.clouds!]),
    currentBakingInput.renderingBackend === 'webgpu',
  );
}

/**
 * Baking step 7: bake every ring
 */
async function bakeRings(): Promise<Uint8Array[]> {
  const ringTargets: Uint8Array[] = [];
  for (let idx = 0; idx < currentBakingInput.planetData.ringsParams.length; idx++) {
    const mesh = BakingHelper.createBakingRing(currentBakingInput.planetData, [bakingTextures.rings![idx]], idx);
    const buffer = await bakeMeshIntoBuffer(mesh, false);
    ringTargets.push(buffer);
  }
  return ringTargets;
}

// --------------------------------------------------------------------------------------------------------------------

/**
 * Common texture baking process for meshes
 * @param mesh the mesh to bake
 * @param shouldFlip condition to flip the buffer (mostly relevant for WebGPU and normals)
 */
async function bakeMeshIntoBuffer(mesh: Mesh, shouldFlip: boolean): Promise<Uint8Array> {
  const texture = await BakingHelper.bakeMesh(
    bakingObjects.renderer!,
    bakingObjects.camera!,
    bakingObjects.renderTarget!,
    mesh,
  );
  if (currentBakingInput.bakingPixelize) {
    texture.minFilter = NearestFilter;
    texture.magFilter = NearestFilter;
  }

  const buffer = new Uint8Array(<Uint8Array>texture.image.data);
  // Note: a quirk of WebGPU texture rendering forces the Y-axis to be flipped compared to WebGL2
  if (shouldFlip) {
    buffer.set(flipBufferY(buffer, texture.width, texture.height));
  }

  (<NodeMaterial>mesh.material).dispose();
  texture.dispose();
  return buffer;
}

async function sendOutputAndDispose(): Promise<void> {
  bakingMeshes.planet!.geometry.dispose();
  bakingTextures.surface?.dispose();
  bakingTextures.biomes?.dispose();
  bakingTextures.biomesEmissive?.dispose();
  bakingTextures.cracksSurface?.dispose();
  bakingTextures.cracksUnderwater?.dispose();
  bakingTextures.craters?.dispose();
  bakingTextures.clouds?.dispose();
  bakingTextures.rings?.forEach((tex) => tex.dispose());
  self.postMessage(<BakingWorkerOutput>{
    type: 'done',
    data: outputData,
  });
}
