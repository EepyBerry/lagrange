import type { RawBufferTexture } from '@core/editor/workers/utils.ts';
import type { SerializedPlanetData } from '@core/editor/workers/worker-serializer.types.ts';
import type { BakingSceneObjects } from '@core/helpers/baking.helper.ts';
import { getGraphicsCapabilities, initGraphicsCapabilities } from '@core/capabilities/capabilities.ts';
import * as BakingHelper from '@core/helpers/baking.helper.ts';
import { type EditorBackendType } from '@core/types.ts';
import { flipBufferY } from '@core/utils/render-utils.ts';
import { DataTexture, Mesh, NearestFilter, NodeMaterial, WebGPURenderer } from 'three/webgpu';

interface BakingWorkerInputPayloadMap {
  run: {
    type: 'run';
    planetData: SerializedPlanetData;
    bakingResolution: number;
    bakingPixelize: boolean;
    renderingBackend: EditorBackendType;
  };
  'texture-part': {
    type: 'texture-part';
    target: BakingWorkerTextureTarget;
    targetIndex?: number;
    texture: RawBufferTexture;
  };
  'texture-done': { type: 'texture-done' };
}
export type BakingWorkerInputType = keyof BakingWorkerInputPayloadMap;
export type BakingWorkerInput<T extends BakingWorkerInputType = BakingWorkerInputType> = {
  [K in T]: { type: T } & BakingWorkerInputPayloadMap[K];
}[T];

interface BakingWorkerOutputPayloadMap {
  'texture-request': {
    type: 'texture-request';
    items: {
      width: number;
      height: number;
      target: BakingWorkerTextureTarget;
      targetIndex?: number;
      operation: 'color-ramp' | 'biomes' | 'biomes-emissive';
      data: unknown;
    }[];
  };
  progress: { type: 'progress'; progress: number; texture?: string };
  error: { type: 'error'; error: Error };
  part: { type: 'part'; target: BakingWorkerOutputPartTarget; targetIndex?: number; buffer: Uint8Array };
  done: { type: 'done' };
}
export type BakingWorkerOutputType = keyof BakingWorkerOutputPayloadMap;
export type BakingWorkerOutput<T extends BakingWorkerOutputType = BakingWorkerOutputType> = {
  [K in T]: { type: T } & BakingWorkerOutputPayloadMap[K];
}[T];

export type BakingWorkerTextureTarget =
  | 'surface'
  | 'biomes'
  | 'biomes-emissive'
  | 'cracks-surface'
  | 'cracks-underwater'
  | 'craters'
  | 'clouds'
  | 'rings';
export type BakingWorkerOutputPartTarget =
  | 'map'
  | 'metallic-roughness-map'
  | 'emissive-map'
  | 'normal-map'
  | 'clouds'
  | 'rings';

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
  rings: DataTexture[];
};

// --------------------------------------------------------------------------------------------------------------------
const bakingObjects: BakingSceneObjects = {};
const bakingTextures: BakingWorkerTextures = { rings: [] };
const bakingMeshes: BakingWorkerMeshes = {};
let currentBakingInput: BakingWorkerInput<'run'>;

const stepHandlers: (() => Promise<void>)[] = [];
// --------------------------------------------------------------------------------------------------------------------

init()
  .then(() => {
    // when receiving the initial message, request ALL textures for the current planet
    // after receiving the textures, start baking every map one by one
    self.onmessage = async (event: MessageEvent<BakingWorkerInput>) => {
      console.debug('(bak:wrk) got message', event.data);
      switch (event.data.type) {
        case 'run':
          currentBakingInput = event!.data;
          bakingTextures.rings.push(...Array(currentBakingInput.planetData.ringsParams.length).fill(null));
          requestTextures();
          break;
        case 'texture-part':
          processTextureResponse(event.data);
          break;
        case 'texture-done': {
          let hasHandlerFailure = false;
          for (const handler of stepHandlers) {
            await handler().catch((error) => {
              hasHandlerFailure = true;
              self.postMessage(<BakingWorkerOutput<'error'>>{ type: 'error', error });
            });
            if (hasHandlerFailure) break;
          }
          break;
        }
      }
    };
  })
  .catch((error) => {
    console.error('<Lagrange> Baking worker failed to initialize!', error);
    self.postMessage(<BakingWorkerOutput<'error'>>{ type: 'error', error });
  });

// --------------------------------------------------------------------------------------------------------------------

/**
 * Initialise this worker
 */
async function init(): Promise<void> {
  // note: has to be called in the worker to work properly
  await initGraphicsCapabilities();

  const { renderer, camera, renderTarget } = BakingHelper.createBakingSceneObjects('webgl', 2048, 2048, 1);
  bakingObjects.renderer = renderer;
  bakingObjects.camera = camera;
  bakingObjects.renderTarget = renderTarget;

  bakingMeshes.planet = await BakingHelper.loadPlaneSphereMesh();

  stepHandlers.push(async () => {
    self.postMessage(<BakingWorkerOutput<'progress'>>{ type: 'progress', progress: 1 });
    updateBakingObjects('equirectangular');
  });
  stepHandlers.push(async () => {
    self.postMessage(<BakingWorkerOutput<'progress'>>{ type: 'progress', progress: 2 });
    const buffer = await bakePlanetSurface();
    self.postMessage(<BakingWorkerOutput<'part'>>{ type: 'part', target: 'map', buffer });
  });
  stepHandlers.push(async () => {
    self.postMessage(<BakingWorkerOutput<'progress'>>{ type: 'progress', progress: 3 });
    const buffer = await bakePlanetMetallicRoughnessMap();
    self.postMessage(<BakingWorkerOutput<'part'>>{ type: 'part', target: 'metallic-roughness-map', buffer });
  });
  stepHandlers.push(async () => {
    self.postMessage(<BakingWorkerOutput<'progress'>>{ type: 'progress', progress: 4 });
    const buffer = await bakePlanetEmissivityMap();
    self.postMessage(<BakingWorkerOutput<'part'>>{ type: 'part', target: 'emissive-map', buffer });
  });
  stepHandlers.push(async () => {
    self.postMessage(<BakingWorkerOutput<'progress'>>{ type: 'progress', progress: 5 });
    const buffer = await bakePlanetNormalMap();
    self.postMessage(<BakingWorkerOutput<'part'>>{ type: 'part', target: 'normal-map', buffer });
  });
  stepHandlers.push(async () => {
    self.postMessage(<BakingWorkerOutput<'progress'>>{ type: 'progress', progress: 6 });
    if (currentBakingInput.planetData.cloudsEnabled) {
      const buffer = await bakeClouds();
      self.postMessage(<BakingWorkerOutput<'part'>>{ type: 'part', target: 'clouds', buffer });
    }
  });
  stepHandlers.push(async () => {
    self.postMessage(<BakingWorkerOutput<'progress'>>{ type: 'progress', progress: 7 });
    updateBakingObjects('square');
    if (currentBakingInput.planetData.ringsEnabled && currentBakingInput.planetData.ringsParams.length > 0) {
      const buffers = await bakeRings();
      buffers.forEach((buffer, index) =>
        self.postMessage(<BakingWorkerOutput<'part'>>{ type: 'part', target: 'rings', targetIndex: index, buffer }),
      );
    }
  });
  stepHandlers.push(async () => {
    self.postMessage(<BakingWorkerOutput<'progress'>>{ type: 'progress', progress: 8 });
    await disposeResourcesAndFinishTask();
  });
  console.info('<Lagrange> Baking worker initialized successfully');
}

// --------------------------------------------------------------------------------------------------------------------

/**
 * Baking pre-step: request the necessary textures
 */
function requestTextures() {
  self.postMessage(<BakingWorkerOutput<'texture-request'>>{
    type: 'texture-request',
    items: [
      {
        width: currentBakingInput.bakingResolution,
        height: currentBakingInput.bakingResolution,
        target: 'surface',
        operation: 'color-ramp',
        data: currentBakingInput.planetData.planetSurfaceColorRamp.steps,
      },
      {
        width: currentBakingInput.bakingResolution,
        height: currentBakingInput.bakingResolution,
        target: 'biomes',
        operation: 'biomes',
        data: currentBakingInput.planetData.biomesParams,
      },
      {
        width: currentBakingInput.bakingResolution,
        height: currentBakingInput.bakingResolution,
        target: 'biomes-emissive',
        operation: 'biomes-emissive',
        data: currentBakingInput.planetData.biomesParams,
      },
      {
        width: currentBakingInput.bakingResolution,
        height: currentBakingInput.bakingResolution,
        target: 'cracks-surface',
        operation: 'color-ramp',
        data: currentBakingInput.planetData.cracksSurfaceColorRamp.steps,
      },
      {
        width: currentBakingInput.bakingResolution,
        height: currentBakingInput.bakingResolution,
        target: 'cracks-underwater',
        operation: 'color-ramp',
        data: currentBakingInput.planetData.cracksUnderwaterColorRamp.steps,
      },
      {
        width: currentBakingInput.bakingResolution,
        height: currentBakingInput.bakingResolution,
        target: 'craters',
        operation: 'color-ramp',
        data: currentBakingInput.planetData.cratersColorRamp.steps,
      },
      {
        width: currentBakingInput.bakingResolution,
        height: currentBakingInput.bakingResolution,
        target: 'clouds',
        operation: 'color-ramp',
        data: currentBakingInput.planetData.cloudsColorRamp.steps,
      },
      ...currentBakingInput.planetData.ringsParams.map((ringParams, index) => ({
        width: currentBakingInput.bakingResolution,
        height: currentBakingInput.bakingResolution,
        target: 'rings',
        targetIndex: index,
        operation: 'color-ramp',
        data: ringParams.colorRamp.steps,
      })),
    ],
  });
}

function processTextureResponse(response: BakingWorkerInput<'texture-part'>) {
  switch (response.target) {
    case 'surface': {
      const dt = new DataTexture(response.texture.buffer, response.texture.width, response.texture.height);
      dt.needsUpdate = true;
      bakingTextures.surface = dt;
      break;
    }
    case 'biomes': {
      const dt = new DataTexture(response.texture.buffer, response.texture.width, response.texture.height);
      dt.needsUpdate = true;
      bakingTextures.biomes = dt;
      break;
    }
    case 'biomes-emissive': {
      const dt = new DataTexture(response.texture.buffer, response.texture.width, response.texture.height);
      dt.needsUpdate = true;
      bakingTextures.biomesEmissive = dt;
      break;
    }
    case 'cracks-surface': {
      const dt = new DataTexture(response.texture.buffer, response.texture.width, response.texture.height);
      dt.needsUpdate = true;
      bakingTextures.cracksSurface = dt;
      break;
    }
    case 'cracks-underwater': {
      const dt = new DataTexture(response.texture.buffer, response.texture.width, response.texture.height);
      dt.needsUpdate = true;
      bakingTextures.cracksUnderwater = dt;
      break;
    }
    case 'craters': {
      const dt = new DataTexture(response.texture.buffer, response.texture.width, response.texture.height);
      dt.needsUpdate = true;
      bakingTextures.craters = dt;
      break;
    }
    case 'clouds': {
      const dt = new DataTexture(response.texture.buffer, response.texture.width, response.texture.height);
      dt.needsUpdate = true;
      bakingTextures.clouds = dt;
      break;
    }
    case 'rings': {
      console.log(response.targetIndex);
      const dt = new DataTexture(response.texture.buffer, response.texture.width, response.texture.height);
      dt.needsUpdate = true;
      bakingTextures.rings[response.targetIndex!] = dt;
      break;
    }
  }
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

  const capabilities = getGraphicsCapabilities(currentBakingInput.renderingBackend);
  bakingObjects.renderer!.dispose();
  bakingObjects.renderer = new WebGPURenderer({
    antialias: true,
    alpha: true,
    forceWebGL: currentBakingInput.renderingBackend == 'webgl',
    canvas: new OffscreenCanvas(bakingWidth, bakingHeight),
    requiredLimits: {
      maxTextureDimension2D: capabilities.maxTextureSize,
      maxBufferSize: capabilities.maxBufferSize,
    },
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
    const mesh = BakingHelper.createBakingRing(currentBakingInput.planetData, [bakingTextures.rings[idx]], idx);
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

async function disposeResourcesAndFinishTask(): Promise<void> {
  bakingMeshes.planet!.geometry.dispose();
  bakingTextures.surface?.dispose();
  bakingTextures.biomes?.dispose();
  bakingTextures.biomesEmissive?.dispose();
  bakingTextures.cracksSurface?.dispose();
  bakingTextures.cracksUnderwater?.dispose();
  bakingTextures.craters?.dispose();
  bakingTextures.clouds?.dispose();
  bakingTextures.rings.forEach((tex) => tex.dispose());
  bakingTextures.rings.splice(0);
  self.postMessage(<BakingWorkerOutput<'done'>>{ type: 'done' });
}
