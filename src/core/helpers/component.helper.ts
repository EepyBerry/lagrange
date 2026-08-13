import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { degToRad } from "three/src/math/MathUtils.js";
import * as TextureHelper from "./texture.helper";
import type PlanetData from "@core/models/planet/planet-data.model.ts";
import {
  type EditorBackendType,
  EditorSceneCreationMode, type EditorSceneObjects, type MeshData,
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
import { PlanetTSLMaterial } from "@tsl/materials/planet.tslmat";
import { AtmosphereTSLMaterial } from "@tsl/materials/atmosphere.tslmat";
import { CloudsTSLMaterial } from "@tsl/materials/clouds.tslmat";
import { RingTSLMaterial } from "@tsl/materials/ring.tslmat";
import { idb } from "@/dexie.config";
import type { RingParameters } from "@core/models/planet/ring-parameters.model.ts";
import TSLRenderPipeline from "@tsl/rendering/render-pipeline.ts";
import type RenderPipelineData from "@core/models/renderpipeline/render-pipeline-data.model.ts";

// ----------------------------------------------------------------------------------------------------------------------
// LAGRANGE COMPONENTS
export async function createScene(
  data: PlanetData,
  width: number,
  height: number,
  pixelRatio: number,
  creationMode: EditorSceneCreationMode,
): Promise<EditorSceneObjects> {
  const idbSettings = await idb.settings.limit(1).first();
  const scene = new Scene();
  if (creationMode === EditorSceneCreationMode.Editor) {
    TextureHelper.loadCubeTextureSkybox(scene, `/skyboxes/${idbSettings?.skybox ?? "deepspace"}/`);
  }
  scene.userData.lens = "no-occlusion";

  // Make spherical before creating camera
  const spherical =
    creationMode === EditorSceneCreationMode.Preview
      ? new Spherical(data.initCamDistance - 1.5, Math.PI / 2, degToRad(data.initCamAngle))
      : new Spherical(data.initCamDistance, Math.PI / 2, degToRad(data.initCamAngle));

  // setup scene (renderer, cam, lighting)
  const renderer = await createRenderer(idbSettings!.renderingBackend, width, height, pixelRatio);
  const camera = createPerspectiveCamera(idbSettings!.cameraFOV, width / height, 0.1, 1e6, spherical);
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

export function createPlanet(data: PlanetData): MeshData<PlanetTSLMaterial> {
  const geometry = createSphereGeometryComponent(data.planetMeshQuality);
  geometry.computeTangents();
  //setTimeout(() => saveAs(new Blob([cracksTex.image.data]), 'tex.raw'), 1000)

  const tslMaterial = new PlanetTSLMaterial(data);
  const mesh = new Mesh(geometry, tslMaterial.buildMaterial());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = Globals.MESH_NAME_PLANET;

  return { mesh, tslMaterial };
}

export function createClouds(data: PlanetData): MeshData<CloudsTSLMaterial> {
  const geometry = createSphereGeometryComponent(data.planetMeshQuality, data.cloudsHeight);
  const tslMaterial = new CloudsTSLMaterial(data);
  const mesh = new Mesh(geometry, tslMaterial.buildMaterial());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = Globals.MESH_NAME_CLOUDS;

  return { mesh, tslMaterial };
}

export function createAtmosphere(data: PlanetData, sunLight: DirectionalLight): MeshData<AtmosphereTSLMaterial> {
  // note: geometry is scaled via the planetGroup: always set to [1 + height]
  const geometry = createSphereGeometryComponent(data.planetMeshQuality, 1 + data.atmosphereHeight);
  const tslMaterial = new AtmosphereTSLMaterial(data, { sunlightPosition: sunLight.position, sunlightIntensity: sunLight.intensity });
  const mesh = new Mesh(geometry, tslMaterial.buildMaterial());
  mesh.userData.lens = "no-occlusion";
  mesh.name = Globals.MESH_NAME_ATMOSPHERE;
  mesh.castShadow = false;

  return { mesh, tslMaterial };
}

export function createRing(data: PlanetData, ringParams: RingParameters): MeshData<RingTSLMaterial> {
  const geometry = createRingGeometryComponent(data.planetMeshQuality, ringParams.innerRadius, ringParams.outerRadius);
  const tslMaterial = new RingTSLMaterial(ringParams);
  const mesh = new Mesh(geometry, tslMaterial.buildMaterial());
  mesh.name = ringParams.id;
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  return { mesh, tslMaterial };
}
export function disposeRing(ringAnchor: Group, meshDataArr: MeshData<RingTSLMaterial>[], ringId: string): void {
  // get ring data + mesh
  const meshDataIdx = meshDataArr.findIndex((r) => r.tslMaterial.ringInstanceId === ringId);
  if (meshDataIdx < 0) {
    throw new Error("Cannot delete non-existent ring of ID: " + ringId);
  }
  const meshData = meshDataArr[meshDataIdx];
  // delete ring
  ringAnchor.remove(meshData.mesh!);
  (meshData.mesh!.material as NodeMaterial).dispose();
  meshData.mesh!.geometry.dispose();
  meshData.tslMaterial.dispose();
  meshDataArr.splice(meshDataIdx, 1);
}

// ----------------------------------------------------------------------------------------------------------------------
// NATIVE COMPONENTS

/**
 * Creates a WebGPURenderer instance
 * @param renderingBackend type of rendering backend, WebGL or WebGPU
 * @param width canvas width
 * @param height canvas height
 * @param pixelRatio device pixel ratio
 * @returns the renderer
 */
export async function createRenderer(renderingBackend: EditorBackendType, width: number, height: number, pixelRatio?: number): Promise<WebGPURenderer> {
  const renderer = new WebGPURenderer({
    antialias: true,
    alpha: true,
    forceWebGL: renderingBackend == "webgl",
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
    `<Lagrange> Initialised renderer using ${renderingBackend == "webgl" ? "WebGL" : "WebGPU"} backend.`,
  );
  return renderer;
}

export function createRenderPipeline(data: RenderPipelineData, renderer: WebGPURenderer, scene: Scene, camera: Camera): TSLRenderPipeline {
  return new TSLRenderPipeline(data, renderer, scene, camera);
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
export async function createOrbitControls(camera: Camera, canvas: HTMLCanvasElement): Promise<OrbitControls> {
  const idbSettings = await idb.settings.limit(1).first();
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
    LEFT: idbSettings?.cameraMouseControlsScheme === 'standard'
      ? MOUSE.ROTATE
      : MOUSE.DOLLY,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: idbSettings?.cameraMouseControlsScheme === 'standard'
      ? MOUSE.DOLLY
      : MOUSE.ROTATE,
  };
  return controls;
}
