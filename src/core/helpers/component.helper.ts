import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { degToRad } from "three/src/math/MathUtils.js";
import * as TextureHelper from "./texture.helper";
import type PlanetData from "../models/planet-data.model";
import {
  type PlanetMeshData,
  type AtmosphereMeshData,
  type CloudsMeshData,
  type RingMeshData,
  EditorSceneCreationMode,
} from "../types";
import { LensFlareEffect } from "../effects/lens-flare.effect";
import * as Globals from "@core/globals";
import {
  AmbientLight,
  Camera,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MOUSE,
  NodeMaterial,
  OrthographicCamera,
  PCFSoftShadowMap,
  PerspectiveCamera,
  RingGeometry,
  Scene,
  SphereGeometry,
  Spherical,
  SRGBColorSpace,
  Vector3,
  WebGPURenderer,
  type ColorRepresentation,
} from "three/webgpu";
import { PlanetTSLMaterial } from "@core/tsl/materials/planet.tslmat";
import { AtmosphereTSLMaterial } from "@core/tsl/materials/atmosphere.tslmat";
import { CloudsTSLMaterial } from "@core/tsl/materials/clouds.tslmat";
import { RingTSLMaterial } from "@core/tsl/materials/ring.tslmat";
import { idb } from "@/dexie.config";
import { LayeredDataTexture } from "../utils/texture/layered-data-texture";
import type { BiomeParameters } from "../models/biome-parameters.model";
import { PlanetDataConverter } from "../models/converters/planet-data.converter";
import { CloudsDataConverter } from "../models/converters/clouds-data.converter";
import { RingDataConverter } from "../models/converters/ring-data.converter";
import { AtmosphereDataConverter } from "../models/converters/atmosphere-data.converter";
import type { RingParameters } from "../models/ring-parameters.model";

// ----------------------------------------------------------------------------------------------------------------------
// LAGRANGE COMPONENTS
type EditorSceneObjects = {
  scene: Scene;
  renderer: WebGPURenderer;
  camera: PerspectiveCamera;
};
export async function createScene(
  data: PlanetData,
  width: number,
  height: number,
  pixelRatio: number,
  creationMode: EditorSceneCreationMode,
): Promise<EditorSceneObjects> {
  // setup cubemap
  const scene = new Scene();
  if (creationMode === EditorSceneCreationMode.EDITOR) {
    const idbSettings = await idb.settings.limit(1).first();
    TextureHelper.loadCubeTextureSkybox(scene, `/skyboxes/${idbSettings?.skybox ?? "deepspace"}/`);
  }
  scene.userData.lens = "no-occlusion";

  // Make spherical before creating camera
  const spherical =
    creationMode === EditorSceneCreationMode.PREVIEW
      ? new Spherical(data.initCamDistance - 1.5, Math.PI / 2, degToRad(data.initCamAngle))
      : new Spherical(data.initCamDistance, Math.PI / 2, degToRad(data.initCamAngle));

  // setup scene (renderer, cam, lighting)
  const renderer = await createRenderer(width, height, pixelRatio);
  const camera = createPerspectiveCamera(50, width / height, 0.1, 1e6, spherical);
  return { scene, renderer, camera };
}

export function createSun(data: PlanetData) {
  const sun = new DirectionalLight(data.sunLightColor, data.sunLightIntensity);
  sun.frustumCulled = false;
  sun.userData.lens = "no-occlusion";
  sun.name = Globals.MESH_NAME_SUN;
  sun.castShadow = true;
  sun.shadow.camera.far = 1e4;
  sun.shadow.mapSize.width = 4096;
  sun.shadow.mapSize.height = 4096;
  sun.shadow.bias = -0.00003;
  return sun;
}

export function createLensFlare(data: PlanetData, pos: Vector3, color: Color) {
  return new LensFlareEffect({
    lensPosition: pos ?? new Vector3(0),
    colorGain: color ?? new Color(95, 12, 10),
    starPoints: 2,
    starPointsIntensity: data.lensFlarePointsIntensity ?? 0.25,
    glareSize: 0.025,
    glareIntensity: data.lensFlareGlareIntensity ?? 0.5,
    flareSize: 0.001,
    flareShape: 0.375,
    additionalStreaks: false,
    streaksScale: 0.15,
  });
}

export function createPlanet(data: PlanetData, surfaceTexBuf: Uint8Array): PlanetMeshData {
  const geometry = createSphereGeometryComponent(data.planetMeshQuality);
  geometry.computeTangents();
  const surfaceTex = TextureHelper.createRampTexture(
    surfaceTexBuf,
    Globals.TEXTURE_SIZES.SURFACE,
    data.planetSurfaceColorRamp.steps,
  );
  const biomeLayersTex = new LayeredDataTexture<BiomeParameters>(
    Globals.TEXTURE_SIZES.BIOME,
    Globals.TEXTURE_SIZES.BIOME,
    data.biomesParams,
    TextureHelper.fillBiomeLayer,
  );
  const biomeEmissivityLayersTex = new LayeredDataTexture<BiomeParameters>(
    Globals.TEXTURE_SIZES.BIOME,
    Globals.TEXTURE_SIZES.BIOME,
    data.biomesParams,
    TextureHelper.fillBiomeEmissivityLayer,
  );
  //setTimeout(() => biomeEmissivityLayersTex.debugSaveTexture(), 10000)

  const dataConverter = new PlanetDataConverter(data)
    .withSurfaceTexture(surfaceTex)
    .withBiomesTexture(biomeLayersTex.texture)
    .withBiomesEmissiveTexture(biomeEmissivityLayersTex.texture);
  const tslMaterial = new PlanetTSLMaterial(dataConverter.convert());
  const mesh = new Mesh(geometry, tslMaterial.buildMaterial());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = Globals.MESH_NAME_PLANET;

  return {
    mesh,
    uniforms: tslMaterial.uniforms,
    surfaceBuffer: surfaceTexBuf,
    surfaceTexture: surfaceTex,
    biomeLayersTexture: biomeLayersTex,
    biomeEmissiveLayersTexture: biomeEmissivityLayersTex,
  };
}

export function createClouds(data: PlanetData, textureBuffer: Uint8Array): CloudsMeshData {
  const geometry = createSphereGeometryComponent(data.planetMeshQuality, data.cloudsHeight);
  const texture = TextureHelper.createRampTexture(
    textureBuffer,
    Globals.TEXTURE_SIZES.CLOUDS,
    data.cloudsColorRamp.steps,
  );

  const dataConverter = new CloudsDataConverter(data, texture);
  const tslMaterial = new CloudsTSLMaterial(dataConverter.convert());
  const mesh = new Mesh(geometry, tslMaterial.buildMaterial());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = Globals.MESH_NAME_CLOUDS;

  return {
    mesh,
    uniforms: tslMaterial.uniforms,
    buffer: textureBuffer,
    texture,
  };
}

export function createAtmosphere(data: PlanetData, sunPos: Vector3): AtmosphereMeshData {
  // note: geometry is scaled via the planetGroup: always set to [1 + height]
  const geometry = createSphereGeometryComponent(data.planetMeshQuality, 1 + data.atmosphereHeight);
  const dataConverter = new AtmosphereDataConverter(data, sunPos);
  const tslMaterial = new AtmosphereTSLMaterial(dataConverter.convert());
  const mesh = new Mesh(geometry, tslMaterial.buildMaterial());
  mesh.userData.lens = "no-occlusion";
  mesh.name = Globals.MESH_NAME_ATMOSPHERE;
  mesh.castShadow = false;

  return {
    mesh,
    uniforms: tslMaterial.uniforms,
  };
}

export function createRing(data: PlanetData, ringParams: RingParameters): RingMeshData {
  const textureBuffer = new Uint8Array(Globals.TEXTURE_SIZES.RING * 4);
  const geometry = createRingGeometryComponent(data.planetMeshQuality, ringParams.innerRadius, ringParams.outerRadius);
  const ringTex = TextureHelper.createRampTexture(
    textureBuffer,
    Globals.TEXTURE_SIZES.RING,
    ringParams.colorRamp.steps,
  );

  const dataConverter = new RingDataConverter(ringParams, ringTex);
  const tslMaterial = new RingTSLMaterial(dataConverter.convert());

  const mesh = new Mesh(geometry, tslMaterial.buildMaterial());
  mesh.name = ringParams.id;
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  return {
    mesh,
    uniforms: tslMaterial.uniforms,
    buffer: textureBuffer,
    texture: ringTex,
  };
}
export function disposeRing(ringAnchor: Group, ringsMeshData: RingMeshData[], ringParams: RingParameters): void {
  // get ring data + mesh
  const ringMeshData = ringsMeshData.find((r) => r.mesh!.name === ringParams.id);
  if (!ringMeshData) {
    throw new Error("Cannot delete non-existent ring of ID: " + ringParams.id);
  }
  // delete ring
  ringAnchor.remove(ringMeshData.mesh!);
  (ringMeshData.mesh!.material as NodeMaterial).dispose();
  ringMeshData.mesh!.geometry.dispose();
  ringMeshData.texture!.dispose();
  ringMeshData.buffer = null;
}

export function disposeAllRings(ringAnchor: Group, ringsMeshData: RingMeshData[]): void {
  ringAnchor.clear();
  ringsMeshData.forEach((rmd) => {
    (rmd.mesh!.material as NodeMaterial).dispose();
    rmd.mesh!.geometry.dispose();
    rmd.texture!.dispose();
    rmd.buffer = null;
  });
}

// ----------------------------------------------------------------------------------------------------------------------
// NATIVE COMPONENTS

/**
 * Creates a WebGPURenderer isntance
 * @param width canvas width
 * @param height canvas height
 * @param pixelRatio device pixel ratio
 * @returns the renderer
 */
export async function createRenderer(width: number, height: number, pixelRatio?: number): Promise<WebGPURenderer> {
  const idbSettings = await idb.settings.limit(1).first();
  const renderer = new WebGPURenderer({
    antialias: true,
    alpha: true,
    forceWebGL: idbSettings!.renderingBackend == "webgl",
  });
  if (pixelRatio) {
    renderer.setPixelRatio(pixelRatio);
  }
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  renderer.setTransparentSort((a, b) => a.z! - b.z!); // Invert transparent sorting to have a "filter" effect for transparent objects (atmos/ring)
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.outputColorSpace = SRGBColorSpace;
  console.debug(
    `<Lagrange> Initialised renderer using ${idbSettings!.renderingBackend == "webgl" ? "WebGL" : "WebGPU"} backend.`,
  );
  return renderer;
}

/**
 * Creates a perspective camera with the given params and optional orbit settings
 * @param fov Field of View, in degrees
 * @param ratio aspect ratio, i.e. width/height
 * @param near closest rendering distance
 * @param far furthest rendering distance
 * @param initialOrbit (optional) orbit settings (angle, etc)
 * @returns the configured camera
 */
export function createPerspectiveCamera(
  fov: number,
  ratio: number,
  near: number,
  far: number,
  initialOrbit?: Spherical,
): PerspectiveCamera {
  const camera = new PerspectiveCamera(fov, ratio, near, far);
  if (initialOrbit) {
    initialOrbit.makeSafe();
    camera.position.setFromSpherical(initialOrbit);
  }
  return camera;
}

/**
 * Creates an orthographic camera with the given params and optional orbit settings
 * @param width screen width
 * @param height screen height
 * @param near closest rendering distance
 * @param far furthest rendering distance
 * @returns the configured camera
 */
export function createOrthographicCamera(width: number, height: number, near: number, far: number): OrthographicCamera {
  return new OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, near, far);
}

/**
 * Creates a simple ambient light
 * @param color light color
 * @param intensity light intensity
 * @returns the AmbientLight instance
 */
export function createAmbientLight(color: ColorRepresentation, intensity: number): AmbientLight {
  const light = new AmbientLight(color);
  light.intensity = intensity;
  return light;
}

export function createSphereGeometryComponent(quality: number, radius: number = 1): SphereGeometry {
  return new SphereGeometry(radius, quality, quality / 2);
}

export function createRingGeometryComponent(
  quality: number,
  innerRadius: number = 1.25,
  outerRadius: number = 1.75,
): RingGeometry {
  return new RingGeometry(innerRadius, outerRadius, quality);
}

/**
 * Creates standard OrbitControls
 * @param camera the camera to control
 * @param canvas the render canvas
 * @returns an instance of OrbitControls
 */
export function createOrbitControls(camera: Camera, canvas: HTMLCanvasElement): OrbitControls {
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.enableDamping = false;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 1.5;
  controls.maxDistance = 10;
  controls.maxPolarAngle = Math.PI;
  controls.rotateSpeed = 0.5;
  controls.zoomSpeed = 2;
  controls.mouseButtons = {
    LEFT: MOUSE.ROTATE,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: MOUSE.DOLLY,
  };
  return controls;
}
