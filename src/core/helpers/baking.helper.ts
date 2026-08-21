import * as Globals from "@core/globals";
import * as ComponentHelper from "@core/helpers/component.helper";
import {
  DataTexture,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RenderTarget,
  SRGBColorSpace,
  Texture,
  Vector2,
  WebGPURenderer,
} from "three/webgpu";
import { BakingPlanetSurfaceTSLMaterial } from "@tsl/materials/baking/planet-surface.baking.tslmat.ts";
import type { BakingSceneObjects, EditorBackendType } from "@core/types.ts";
import type { SerializedPlanetData } from "@core/editor/workers/worker-serializer.types.ts";
import {
  BakingPlanetMetallicRoughnessTSLMaterial
} from "@tsl/materials/baking/planet-metallic-roughness.baking.tslmat.ts";
import { BakingPlanetEmissivityTSLMaterial } from "@tsl/materials/baking/planet-emissivity.baking.tslmat.ts";
import { BakingPlanetHeightMapTSLMaterial } from "@tsl/materials/baking/planet-heightmap.baking.tslmat.ts";
import { BakingPlanetNormalMapTSLMaterial } from "@tsl/materials/baking/planet-normalmap.baking.tslmat.ts";
import { BakingCloudsTSLMaterial } from "@tsl/materials/baking/clouds.baking.tslmat.ts";
import { BakingRingTSLMaterial } from "@tsl/materials/baking/ring.baking.tslmat.ts";

export function createBakingPlanet(data: SerializedPlanetData, textures: Texture[]): Mesh {
  const geometry = ComponentHelper.createSphereGeometryComponent(data.planetMeshQuality);
  geometry.computeTangents();
  const tslMaterial = new BakingPlanetSurfaceTSLMaterial(data, textures);
  const mesh = new Mesh(geometry, tslMaterial.buildMaterial());
  mesh.name = Globals.MESH_NAME_PLANET;
  return mesh;
}

export function createBakingMetallicRoughnessMap(data: SerializedPlanetData): Mesh {
  const geometry = ComponentHelper.createSphereGeometryComponent(data.planetMeshQuality);
  geometry.computeTangents();
  const tslMaterial = new BakingPlanetMetallicRoughnessTSLMaterial(data);
  const mesh = new Mesh(geometry, tslMaterial.buildMaterial());
  mesh.name = Globals.MESH_NAME_METALLICROUGHNESSMAP;
  return mesh;
}

export function createBakingEmissivityMap(data: SerializedPlanetData, textures: Texture[]): Mesh {
  const geometry = ComponentHelper.createSphereGeometryComponent(data.planetMeshQuality);
  geometry.computeTangents();

  const tslMaterial = new BakingPlanetEmissivityTSLMaterial(data, textures);
  const mesh = new Mesh(geometry, tslMaterial.buildMaterial());
  mesh.name = Globals.MESH_NAME_EMISSIVITYMAP;
  return mesh;
}

export function createBakingHeightMap(data: SerializedPlanetData, textures: Texture[]): Mesh {
  const geometry = ComponentHelper.createSphereGeometryComponent(data.planetMeshQuality);
  geometry.computeTangents();

  const tslMaterial = new BakingPlanetHeightMapTSLMaterial(data, textures);
  const mesh = new Mesh(geometry, tslMaterial.buildMaterial());
  mesh.name = Globals.MESH_NAME_HEIGHTMAP;
  return mesh;
}

export async function createBakingNormalMap(data: SerializedPlanetData, textures: Texture[]): Promise<Mesh> {
  const tslMaterial = new BakingPlanetNormalMapTSLMaterial(data, textures);
  const mesh = new Mesh(new PlaneGeometry(), tslMaterial.buildMaterial());
  mesh.name = Globals.MESH_NAME_NORMALMAP;
  return mesh;
}

export function createBakingClouds(data: SerializedPlanetData, textures: Texture[]): Mesh {
  const cloudHeight = data.cloudsHeight;
  const geometry = ComponentHelper.createSphereGeometryComponent(data.planetMeshQuality, cloudHeight);

  const tslMaterial = new BakingCloudsTSLMaterial(data, textures);
  const mesh = new Mesh(geometry, tslMaterial.buildMaterial());
  mesh.name = Globals.MESH_NAME_CLOUDS;
  return mesh;
}

export function createBakingRing(data: SerializedPlanetData, textures: Texture[], paramsIndex: number): Mesh {
  const ringParams = data.ringsParams[paramsIndex];
  const geometry = ComponentHelper.createRingGeometryComponent(
    data.planetMeshQuality,
    ringParams.innerRadius,
    ringParams.outerRadius,
  );
  const material = new BakingRingTSLMaterial(ringParams, textures);
  const mesh = new Mesh(geometry, material.buildMaterial());
  mesh.name = ringParams.id;
  return mesh;
}

// ------------------------------------------------------------------------------------------------
/**
 * Creates the main baking objects, as well as a base RenderTarget
 * @param renderingBackend the rendering backend, WebGL or WebGPU
 * @param width device width in pixels
 * @param height device height in pixels
 * @param pixelRatio device pixel ratio
 * @returns Scene, WebGPURenderer, OrthographicCamera, and RenderTarget root objects
 */
export function createBakingObjects(renderingBackend: EditorBackendType, width: number, height: number, pixelRatio: number): BakingSceneObjects {
  const renderer = new WebGPURenderer({
    antialias: true,
    alpha: true,
    forceWebGL: renderingBackend == "webgl",
    canvas: new OffscreenCanvas(width, height),
  });
  renderer.setPixelRatio(pixelRatio);
  return {
    renderer,
    camera: ComponentHelper.createOrthographicCamera(width, height, 0, 1),
    renderTarget: new RenderTarget(width, height, { colorSpace: SRGBColorSpace }),
  };
}

/**
 * Asynchronously bakes a model's material(s) into a texture
 * @remarks Uses TextureLoader
 * @param renderer WebGPURenderer
 * @param camera orthographic camera
 * @param renderTarget common RenderTarget
 * @param mesh mesh to bake
 * @returns a promise containing the mesh's baked texture
 */
export async function bakeMesh(
  renderer: WebGPURenderer,
  camera: OrthographicCamera,
  renderTarget: RenderTarget,
  mesh: Mesh,
): Promise<DataTexture> {
  const size = new Vector2();
  renderer.getSize(size);

  const rawBuffer = new Uint8Array(size.x * size.y * 4);
  if (!renderer.initialized) {
    await renderer.init();
  }
  renderer.setRenderTarget(renderTarget);
  renderer.render(mesh, camera);

  rawBuffer.set(await renderer.readRenderTargetPixelsAsync(renderTarget, 0, 0, size.x, size.y));
  renderer.setRenderTarget(null);

  const dt = new DataTexture(rawBuffer, size.x, size.y);
  dt.needsUpdate = true;
  return dt;
}
