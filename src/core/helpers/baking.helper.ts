import * as Globals from "@core/globals";
import * as ComponentHelper from "@core/helpers/component.helper";

import type PlanetData from "@core/models/planet-data.model";
import { renderToCanvas } from "@core/utils/render-utils";
import {
  CanvasTexture,
  DataTexture,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RenderTarget,
  SRGBColorSpace,
  Texture,
  Vector2,
  type WebGPURenderer,
} from "three/webgpu";
import { PlanetTSLMaterial } from "../tsl/materials/planet.tslmat";
import { PlanetDataConverter } from "../models/converters/planet-data.converter";
import { CloudsTSLMaterial } from "../tsl/materials/clouds.tslmat";
import { RingTSLMaterial } from "../tsl/materials/ring.tslmat";
import { CloudsDataConverter } from "../models/converters/clouds-data.converter";
import { RingDataConverter } from "../models/converters/ring-data.converter";

export function createBakingPlanet(data: PlanetData, surfaceTex: DataTexture, biomeTex: DataTexture): Mesh {
  const geometry = ComponentHelper.createSphereGeometryComponent(data.planetMeshQuality);
  geometry.computeTangents();

  const dataConverter = new PlanetDataConverter(data).withSurfaceTexture(surfaceTex).withBiomesTexture(biomeTex);
  const tslMaterial = new PlanetTSLMaterial(dataConverter.convert());
  const mesh = new Mesh(geometry, tslMaterial.buildSurfaceBakeMaterial());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = Globals.MESH_NAME_PLANET;
  return mesh;
}

export function createBakingMetallicRoughnessMap(data: PlanetData): Mesh {
  const geometry = ComponentHelper.createSphereGeometryComponent(data.planetMeshQuality);
  geometry.computeTangents();

  const dataConverter = new PlanetDataConverter(data);
  const tslMaterial = new PlanetTSLMaterial(dataConverter.convert());
  const mesh = new Mesh(geometry, tslMaterial.buildMetallicRoughnessBakeMaterial());
  mesh.name = Globals.MESH_NAME_METALLICROUGHNESSMAP;
  return mesh;
}

export function createBakingEmissivityMap(
  data: PlanetData,
  surfaceTex: DataTexture,
  biomesTex: DataTexture,
  biomeEmissiveTex: DataTexture,
): Mesh {
  const geometry = ComponentHelper.createSphereGeometryComponent(data.planetMeshQuality);
  geometry.computeTangents();

  const dataConverter = new PlanetDataConverter(data)
    .withSurfaceTexture(surfaceTex)
    .withBiomesTexture(biomesTex)
    .withBiomesEmissiveTexture(biomeEmissiveTex);
  const tslMaterial = new PlanetTSLMaterial(dataConverter.convert());
  const mesh = new Mesh(geometry, tslMaterial.buildEmissivityBakeMaterial());
  mesh.name = Globals.MESH_NAME_EMISSIVITYMAP;
  return mesh;
}

export function createBakingHeightMap(data: PlanetData): Mesh {
  const geometry = ComponentHelper.createSphereGeometryComponent(data.planetMeshQuality);
  geometry.computeTangents();

  const dataConverter = new PlanetDataConverter(data);
  const tslMaterial = new PlanetTSLMaterial(dataConverter.convert());
  const mesh = new Mesh(geometry, tslMaterial.buildHeightMapBakeMaterial());
  mesh.name = Globals.MESH_NAME_HEIGHTMAP;
  return mesh;
}

export function createBakingNormalMap(data: PlanetData, heightMapTex: Texture): Mesh {
  const dataConverter = new PlanetDataConverter(data).withBakingSurfaceHeightMapTexture(heightMapTex);
  const tslMaterial = new PlanetTSLMaterial(dataConverter.convert());
  const mesh = new Mesh(new PlaneGeometry(), tslMaterial.buildNormalMapBakeMaterial());
  mesh.name = Globals.MESH_NAME_NORMALMAP;
  return mesh;
}

export function createBakingClouds(data: PlanetData, texture: Texture): Mesh {
  const cloudHeight = data.cloudsHeight;
  const geometry = ComponentHelper.createSphereGeometryComponent(data.planetMeshQuality, cloudHeight);

  const dataConverter = new CloudsDataConverter(data, texture);
  const tslMaterial = new CloudsTSLMaterial(dataConverter.convert());
  const mesh = new Mesh(geometry, tslMaterial.buildBakeMaterial());
  mesh.name = Globals.MESH_NAME_CLOUDS;
  return mesh;
}

export function createBakingRing(data: PlanetData, texture: Texture, paramsIndex: number): Mesh {
  const ringParams = data.ringsParams[paramsIndex];
  const geometry = ComponentHelper.createRingGeometryComponent(
    data.planetMeshQuality,
    ringParams.innerRadius,
    ringParams.outerRadius,
  );
  const dataConverter = new RingDataConverter(ringParams, texture);
  const material = new RingTSLMaterial(dataConverter.convert());
  const mesh = new Mesh(geometry, material.buildBakeMaterial());
  mesh.name = ringParams.id;
  return mesh;
}

// ------------------------------------------------------------------------------------------------
type BakingObjects = {
  renderer: WebGPURenderer;
  camera: OrthographicCamera;
  renderTarget: RenderTarget;
};
/**
 * Creates the main baking objects, as well as a base RenderTarget
 * @param width device width in pixels
 * @param height device height in pixels
 * @param pixelRatio device pixel ratio
 * @returns Scene, WebGPURenderer, OrthographicCamera, and RenderTarget root objects
 */
export async function createBakingObjects(width: number, height: number, pixelRatio: number): Promise<BakingObjects> {
  return {
    renderer: await ComponentHelper.createRenderer(width, height, pixelRatio),
    camera: ComponentHelper.createOrthographicCamera(width, height, 0, 1),
    renderTarget: new RenderTarget(width, height, { colorSpace: SRGBColorSpace }),
  };
}

/**
 * Asynchronously bakes a model's Material/CustomShaderMaterial into a texture
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
): Promise<CanvasTexture<OffscreenCanvas>> {
  const size = new Vector2();
  renderer.getSize(size);

  const rawBuffer = new Uint8Array(size.x * size.y * 4);
  if (!renderer.initialized) {
    await renderer.init();
  }
  renderer.setRenderTarget(renderTarget);
  renderer.render(mesh, camera);

  /* await renderer!.debug.getShaderAsync(
    new THREE.Scene(),
    camera,
    mesh,
  ).then((data) => console.log(data.fragmentShader)) */

  rawBuffer.set(await renderer.readRenderTargetPixelsAsync(renderTarget, 0, 0, size.x, size.y));
  renderer.setRenderTarget(null);

  return new CanvasTexture(renderToCanvas(renderer, rawBuffer, size.x, size.y));
}
