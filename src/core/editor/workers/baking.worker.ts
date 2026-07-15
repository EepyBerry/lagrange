import type { SerializedPlanetData } from '@core/editor/workers/worker-serializer.types.ts';
import * as BakingHelper from '@core/helpers/baking.helper.ts';
import { type BakingSceneObjects, type EditorBackendType } from '@core/types.ts';
import { DataTexture, Mesh, NearestFilter, NodeMaterial, Texture, WebGPURenderer } from 'three/webgpu';

type BakedObject = {
  mesh: Mesh;
  texture: DataTexture;
};
type BakedObjects = {
  planetSurface?: BakedObject;
  planetMetallicRoughness?: BakedObject;
  planetEmissivity?: BakedObject;
  planetHeightNormalMap?: BakedObject;
  clouds?: BakedObject;
  rings?: BakedObject[];
};

export type BakingWorkerInput = {
  type: 'baking';
  planetData: SerializedPlanetData;
  bakingResolution: number;
  bakingPixelize: boolean;
  renderingBackend: EditorBackendType;
};
export type BakingWorkerTextureRequest = {
  type: 'texture-request';
  step: number;
  width: number;
  height: number;
  operation: 'raw' | 'color-ramp' | 'biomes' | 'biomes-emissive';
  data: unknown;
};
export type BakingWorkerTextureResponse = {
  type: 'texture-response';
  step: number;
  textures: Uint8ClampedArray[];
};
export type BakingWorkerOutput =
  | { type: 'progress'; progress: number; texture?: string }
  | { type: 'error'; error: Error }
  | { type: 'done'; data: BakingWorkerOutputData };
export type BakingWorkerOutputData = {
  planetMap?: Uint8ClampedArray;
  planetMetallicRoughnessMap?: Uint8ClampedArray;
  planetEmissiveMap?: Uint8ClampedArray;
  planetNormalMap?: Uint8ClampedArray;
  clouds?: Uint8ClampedArray;
  rings?: Uint8ClampedArray[];
};

// --------------------------------------------------------------------------------------------------------------------
const bakingObjects: BakingSceneObjects = initBakingObjects(2048, 'webgl');
const bakedObjects: BakedObjects = {};
let currentBakingInput: BakingWorkerInput;
// --------------------------------------------------------------------------------------------------------------------

type StepHandlerOptions = { event?: MessageEvent<BakingWorkerInput>; textures?: Texture[] };
const stepHandlers: Map<number, (handlerOptions: StepHandlerOptions) => Promise<void>> = new Map();
stepHandlers
  .set(1, async ({ event }: StepHandlerOptions) => {
    self.postMessage({ type: 'progress', progress: 1 });
    currentBakingInput = event!.data;
    adjustBakingObjects(event!.data.bakingResolution, event!.data.renderingBackend);
    self.postMessage(<BakingWorkerTextureRequest[]>[
      {
        type: 'texture-request',
        step: 2,
        width: currentBakingInput.bakingResolution,
        height: currentBakingInput.bakingResolution,
        operation: 'color-ramp',
        data: event!.data.planetData.planetSurfaceColorRamp.steps,
      },
      {
        type: 'texture-request',
        step: 2,
        width: currentBakingInput.bakingResolution,
        height: currentBakingInput.bakingResolution,
        operation: 'biomes',
        data: event!.data.planetData.biomesParams,
      },
      {
        type: 'texture-request',
        step: 2,
        width: currentBakingInput.bakingResolution,
        height: currentBakingInput.bakingResolution,
        operation: 'color-ramp',
        data: event!.data.planetData.cracksColorRamp.steps,
      },
    ]);
  })
  .set(2, async ({ textures }) => {
    self.postMessage({ type: 'progress', progress: 2 });
    bakedObjects.planetSurface = await bakePlanetSurface(currentBakingInput, textures!);
    await stepHandlers.get(3)?.({});
  })
  .set(3, async () => {
    self.postMessage({ type: 'progress', progress: 3 });
    bakedObjects.planetMetallicRoughness = await bakePlanetMetallicRoughnessMap(currentBakingInput);
    self.postMessage(<BakingWorkerTextureRequest[]>[
      {
        type: 'texture-request',
        step: 4,
        width: currentBakingInput.bakingResolution,
        height: currentBakingInput.bakingResolution,
        operation: 'color-ramp',
        data: currentBakingInput.planetData.planetSurfaceColorRamp.steps,
      },
      {
        type: 'texture-request',
        step: 4,
        width: currentBakingInput.bakingResolution,
        height: currentBakingInput.bakingResolution,
        operation: 'biomes',
        data: currentBakingInput.planetData.biomesParams,
      },
      {
        type: 'texture-request',
        step: 4,
        width: currentBakingInput.bakingResolution,
        height: currentBakingInput.bakingResolution,
        operation: 'biomes-emissive',
        data: currentBakingInput.planetData.biomesParams,
      },
    ]);
  })
  .set(4, async ({ textures }) => {
    self.postMessage({ type: 'progress', progress: 4 });
    bakedObjects.planetEmissivity = await bakePlanetEmissivityMap(currentBakingInput, textures!);
    await stepHandlers.get(5)?.({});
  })
  .set(5, async () => {
    self.postMessage({ type: 'progress', progress: 5 });
    bakedObjects.planetHeightNormalMap = await bakePlanetNormalMap(currentBakingInput);
    self.postMessage(<BakingWorkerTextureRequest[]>[
      {
        type: 'texture-request',
        step: 6,
        width: currentBakingInput.bakingResolution,
        height: currentBakingInput.bakingResolution,
        operation: 'color-ramp',
        data: currentBakingInput.planetData.cloudsColorRamp.steps,
      },
    ]);
  })
  .set(6, async ({ textures }) => {
    self.postMessage({ type: 'progress', progress: 6 });
    if (currentBakingInput.planetData.cloudsEnabled) {
      bakedObjects.clouds = await bakeClouds(currentBakingInput, textures!);
    }
    if (currentBakingInput.planetData.ringsEnabled && currentBakingInput.planetData.ringsParams.length > 0) {
      self.postMessage(
        <BakingWorkerTextureRequest[]>currentBakingInput.planetData.ringsParams.map((ringParams) => ({
          type: 'texture-request',
          step: 7,
          width: currentBakingInput.bakingResolution,
          height: currentBakingInput.bakingResolution,
          operation: 'color-ramp',
          data: ringParams.colorRamp.steps,
        })),
      );
    } else {
      await stepHandlers.get(7)?.({});
    }
  })
  .set(7, async ({ textures }) => {
    self.postMessage({ type: 'progress', progress: 7 });
    if (currentBakingInput.planetData.ringsEnabled && currentBakingInput.planetData.ringsParams.length > 0) {
      bakedObjects.rings = await bakeRings(currentBakingInput, textures!);
    }
    await stepHandlers.get(8)?.({});
  })
  .set(8, async () => {
    self.postMessage({ type: 'progress', progress: 8 });
    await sendTextureDataAsOutput();
  });

// --------------------------------------------------------------------------------------------------------------------

self.onmessage = async (event: MessageEvent<BakingWorkerInput | BakingWorkerTextureResponse>) => {
  if (event.data.type === 'baking') {
    await stepHandlers.get(1)?.({ event: <MessageEvent<BakingWorkerInput>>event });
  } else {
    await stepHandlers.get(event.data.step)?.({
      textures: event.data.textures?.map((buffer) => {
        const dt = new DataTexture(buffer, currentBakingInput.bakingResolution, currentBakingInput.bakingResolution);
        dt.needsUpdate = true;
        return dt;
      }),
    });
  }
};

// --------------------------------------------------------------------------------------------------------------------

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
  if (!bakingObjects) {
    self.postMessage({ type: 'error', error: new Error('Baking objects not initialized before updating') });
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

function disposeBakedObjects() {
  bakedObjects.planetSurface!.mesh.geometry.dispose();
  (<NodeMaterial>bakedObjects.planetSurface!.mesh.material).dispose();
  bakedObjects.planetSurface = undefined;

  bakedObjects.planetMetallicRoughness!.mesh.geometry.dispose();
  (<NodeMaterial>bakedObjects.planetMetallicRoughness!.mesh.material).dispose();
  bakedObjects.planetMetallicRoughness = undefined;

  bakedObjects.planetEmissivity!.mesh.geometry.dispose();
  (<NodeMaterial>bakedObjects.planetEmissivity!.mesh.material).dispose();
  bakedObjects.planetEmissivity = undefined;

  bakedObjects.planetHeightNormalMap!.mesh.geometry.dispose();
  (<NodeMaterial>bakedObjects.planetHeightNormalMap!.mesh.material).dispose();
  bakedObjects.planetHeightNormalMap = undefined;

  if (bakedObjects.clouds) {
    bakedObjects.clouds!.mesh.geometry.dispose();
    (<NodeMaterial>bakedObjects.clouds!.mesh.material).dispose();
    bakedObjects.clouds = undefined;
  }

  if (bakedObjects.rings) {
    bakedObjects.rings?.forEach((rbo) => {
      rbo.mesh.geometry.dispose();
      (<NodeMaterial>rbo.mesh.material).dispose();
    });
    bakedObjects.rings = undefined;
  }
}

// --------------------------------------------------------------------------------------------------------------------

/**
 * Baking step 2: bake planet surface with features
 * @param data received message data
 * @param textures textures for the surface, biomes, and cracks, in that order
 */
async function bakePlanetSurface(data: BakingWorkerInput, textures: Texture[]): Promise<BakedObject> {
  const mesh = BakingHelper.createBakingPlanet(data.planetData, textures);
  const texture = await BakingHelper.bakeMesh(
    bakingObjects.renderer,
    bakingObjects.camera,
    bakingObjects.renderTarget,
    mesh,
  );
  if (data.bakingPixelize) {
    texture.minFilter = NearestFilter;
    texture.magFilter = NearestFilter;
  }
  return { mesh, texture };
}

/**
 * Baking step 3: bake planet metallic-roughness map (PBR)
 * @param data received message data
 */
async function bakePlanetMetallicRoughnessMap(data: BakingWorkerInput): Promise<BakedObject> {
  const mesh = BakingHelper.createBakingMetallicRoughnessMap(data.planetData);
  const texture = await BakingHelper.bakeMesh(
    bakingObjects.renderer,
    bakingObjects.camera,
    bakingObjects.renderTarget,
    mesh,
  );
  if (data.bakingPixelize) {
    texture.minFilter = NearestFilter;
    texture.magFilter = NearestFilter;
  }
  return { mesh, texture };
}

/**
 * Baking step 4: bake planet emissivity map
 * @param data received message data
 * @param textures textures for the biomes and cracks emissivity, in that order
 */
async function bakePlanetEmissivityMap(data: BakingWorkerInput, textures: Texture[]): Promise<BakedObject> {
  const mesh = BakingHelper.createBakingEmissivityMap(data.planetData, textures);
  const texture = await BakingHelper.bakeMesh(
    bakingObjects.renderer,
    bakingObjects.camera,
    bakingObjects.renderTarget,
    mesh,
  );
  if (data.bakingPixelize) {
    texture.minFilter = NearestFilter;
    texture.magFilter = NearestFilter;
  }
  return { mesh, texture };
}

/**
 * Baking step 5: bake planet height map and derive its normal map from that
 * @param data received message data
 */
async function bakePlanetNormalMap(data: BakingWorkerInput): Promise<BakedObject> {
  const heightMapMesh = BakingHelper.createBakingHeightMap(data.planetData);
  const heightMapTex = await BakingHelper.bakeMesh(
    bakingObjects.renderer,
    bakingObjects.camera,
    bakingObjects.renderTarget,
    heightMapMesh,
  );

  const mesh = await BakingHelper.createBakingNormalMap(data.planetData, [heightMapTex]);
  const texture = await BakingHelper.bakeMesh(
    bakingObjects.renderer,
    bakingObjects.camera,
    bakingObjects.renderTarget,
    mesh,
  );
  if (data.bakingPixelize) {
    texture.minFilter = NearestFilter;
    texture.magFilter = NearestFilter;
  }
  return { mesh, texture };
}

/**
 * Baking step 6: bake clouds
 * @param data received message data
 * @param textures texture for clouds (opacity ramp)
 */
async function bakeClouds(data: BakingWorkerInput, textures: Texture[]): Promise<BakedObject> {
  const mesh = BakingHelper.createBakingClouds(data.planetData, textures);
  const texture = await BakingHelper.bakeMesh(
    bakingObjects.renderer,
    bakingObjects.camera,
    bakingObjects.renderTarget,
    mesh,
  );
  if (data.bakingPixelize) {
    texture.minFilter = NearestFilter;
    texture.magFilter = NearestFilter;
  }
  return { mesh, texture };
}

/**
 * Baking step 7: bake every ring
 * @param data received message data
 * @param textures textures for every ring (color ramps)
 */
async function bakeRings(data: BakingWorkerInput, textures: Texture[]): Promise<BakedObject[]> {
  const ringTargets: BakedObject[] = [];
  for (let idx = 0; idx < data.planetData.ringsParams.length; idx++) {
    const mesh = BakingHelper.createBakingRing(data.planetData, [textures[idx]], idx);
    const texture = await BakingHelper.bakeMesh(
      bakingObjects.renderer,
      bakingObjects.camera,
      bakingObjects.renderTarget,
      mesh,
    );
    if (data.bakingPixelize) {
      texture.minFilter = NearestFilter;
      texture.magFilter = NearestFilter;
    }
    ringTargets.push({ mesh, texture });
  }
  return ringTargets;
}

async function sendTextureDataAsOutput(): Promise<void> {
  self.postMessage(<BakingWorkerOutput>{
    type: 'done',
    data: {
      planetMap: bakedObjects.planetSurface!.texture.image.data,
      planetMetallicRoughnessMap: bakedObjects.planetMetallicRoughness!.texture.image.data,
      planetEmissiveMap: bakedObjects.planetEmissivity!.texture.image.data,
      planetNormalMap: bakedObjects.planetHeightNormalMap!.texture.image.data,
      clouds: bakedObjects.clouds?.texture.image.data,
      rings: bakedObjects.rings?.map((rbo) => rbo.texture.image.data),
    },
  });
  disposeBakedObjects();
}
