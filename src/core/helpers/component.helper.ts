import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import CustomShaderMaterial, { type MaterialConstructor } from 'three-custom-shader-material/vanilla'
import { degToRad } from 'three/src/math/MathUtils.js'
import { loadCubeTexture, createRampTexture, createBiomeTexture } from './texture.helper'
import type PlanetData from '../models/planet-data.model'
import { type PlanetMeshData, type AtmosphereMeshData, type CloudsMeshData, type RingMeshData, EditorSceneCreationMode } from '../types'
import { LensFlareEffect } from '../effects/lens-flare.effect'
import * as Globals from '@core/globals'
import * as ShaderLoader from '../three/shader.loader'
import { WebGPURenderer } from 'three/webgpu'
import { PlanetTSLMaterial } from '@/core/tsl/materials/planet.tslmat'
import { AtmosphereTSLMaterial } from '@/core/tsl/materials/atmosphere.tslmat'
import { CloudsTSLMaterial } from '@/core/tsl/materials/clouds.tslmat'
import { RingTSLMaterial } from '@/core/tsl/materials/ring.tslmat'
import { idb } from '@/dexie.config'
import { convertToCloudsUniformData, convertToPlanetUniformData } from '../models/converters/planet-data.converter'

// ----------------------------------------------------------------------------------------------------------------------
// LAGRANGE COMPONENTS
type EditorSceneObjects = {
  scene: THREE.Scene
  renderer: WebGPURenderer
  camera: THREE.PerspectiveCamera
}
export async function createScene(data: PlanetData, width: number, height: number, pixelRatio: number, creationMode: EditorSceneCreationMode): Promise<EditorSceneObjects> {
  // setup cubemap
  const scene = new THREE.Scene()
  if (creationMode === EditorSceneCreationMode.EDITOR) {
    scene.background = loadCubeTexture('/skybox/', [
      'space_ft.png',
      'space_bk.png',
      'space_up.png',
      'space_dn.png',
      'space_rt.png',
      'space_lf.png',
    ])
  }
  scene.userData.lens = 'no-occlusion'

  // Make spherical before creating camera
  const spherical = creationMode === EditorSceneCreationMode.PREVIEW
    ? new THREE.Spherical(data.initCamDistance - (data.ringsEnabled ? 0.75 : 1.5), Math.PI / 2.0, degToRad(data.initCamAngle))
    : new THREE.Spherical(data.initCamDistance, Math.PI / 2.0, degToRad(data.initCamAngle))

  // setup scene (renderer, cam, lighting)
  const renderer = await createRenderer(width, height, pixelRatio)
  const camera = createPerspectiveCamera(50, width / height, 0.1, 1e6, spherical)
  return { scene, renderer, camera }
}

export function createSun(data: PlanetData) {
  const sun = new THREE.DirectionalLight(data.sunLightColor, data.sunLightIntensity)
  sun.frustumCulled = false
  sun.userData.lens = 'no-occlusion'
  sun.name = Globals.LG_MESH_NAME_SUN
  sun.castShadow = true
  sun.shadow.camera.far = 1e4
  sun.shadow.mapSize.width = 4096
  sun.shadow.mapSize.height = 4096
  sun.shadow.bias = -0.00003
  return sun
}

export function createLensFlare(data: PlanetData, pos: THREE.Vector3, color: THREE.Color) {
  return new LensFlareEffect({
    lensPosition: pos ?? new THREE.Vector3(0.0),
    colorGain: color ?? new THREE.Color(95, 12, 10),
    starPoints: 2,
    starPointsIntensity: data.lensFlarePointsIntensity ?? 0.25,
    glareSize: 0.025,
    glareIntensity: data.lensFlareGlareIntensity ?? 0.5,
    flareSize: 0.001,
    flareShape: 0.375,
    additionalStreaks: false,
    streaksScale: 0.15,
  })
}

export type CreatePlanetOptions = { mode: CreatePlanetMode, heightMapTex?: THREE.Texture }
export enum CreatePlanetMode { EDITOR, BAKING_SURFACE, BAKING_PBR, BAKING_HEIGHTMAP, BAKING_NORMALMAP }
export function createPlanet(data: PlanetData, surfaceTexBuf: Uint8Array, biomeTexBuf: Uint8Array): PlanetMeshData {
  const geometry = createSphereGeometryComponent(data.planetMeshQuality)
  const surfaceTex = createRampTexture(surfaceTexBuf, Globals.TEXTURE_SIZES.SURFACE, data.planetSurfaceColorRamp.steps)
  const biomeTex = createBiomeTexture(biomeTexBuf, Globals.TEXTURE_SIZES.BIOME, data.biomesParams)

  const tslMaterial = new PlanetTSLMaterial(convertToPlanetUniformData(data, surfaceTex, biomeTex))
  const mesh = new THREE.Mesh(geometry, tslMaterial.buildMaterial())
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.name = Globals.LG_MESH_NAME_PLANET

  return {
    mesh,
    uniforms: tslMaterial.uniforms,
    surfaceBuffer: surfaceTexBuf,
    surfaceTexture: surfaceTex,
    biomesBuffer: biomeTexBuf,
    biomesTexture: biomeTex,
  }
}

export function createClouds(data: PlanetData, textureBuffer: Uint8Array): CloudsMeshData {
  const cloudsHeight = data.cloudsHeight / Globals.ATMOSPHERE_HEIGHT_DIVIDER
  const geometry = createSphereGeometryComponent(data.planetMeshQuality, cloudsHeight)
  const opacityTex = createRampTexture(textureBuffer, Globals.TEXTURE_SIZES.CLOUDS, data.cloudsColorRamp.steps)

  const tslMaterial = new CloudsTSLMaterial(convertToCloudsUniformData(data, opacityTex))
  const mesh = new THREE.Mesh(geometry, tslMaterial.buildMaterial())
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.name = Globals.LG_MESH_NAME_CLOUDS

  return {
    mesh,
    uniforms: tslMaterial.uniforms,
    buffer: textureBuffer,
    texture: opacityTex,
  }
}

export function createAtmosphere(data: PlanetData, sunPos: THREE.Vector3): AtmosphereMeshData {
  const geometry = createSphereGeometryComponent(
    data.planetMeshQuality,
    data.atmosphereHeight / Globals.ATMOSPHERE_HEIGHT_DIVIDER
  )
  const tslMaterial = new AtmosphereTSLMaterial({
    sunlight: {
      position: sunPos,
      intensity: data.sunLightIntensity
    },
    transform: {
      radius: data.planetRadius + (data.atmosphereHeight / Globals.ATMOSPHERE_HEIGHT_DIVIDER),
      surfaceRadius: data.planetRadius,
    },
    render: {
      density: data.atmosphereDensityScale,
      intensity: data.atmosphereIntensity,
      colorMode: data.atmosphereColorMode,
      hue: data.atmosphereHue,
      tint: data.atmosphereTint,
    }
  })
  const mesh = new THREE.Mesh(geometry, tslMaterial.buildMaterial())
  mesh.userData.lens = 'no-occlusion'
  mesh.name = Globals.LG_MESH_NAME_ATMOSPHERE
  mesh.castShadow = true

  return {
    mesh,
    uniforms: tslMaterial.uniforms,
  }
}

export function createRing(
  data: PlanetData,
  paramsIndex: number,
): RingMeshData {
  const textureBuffer = new Uint8Array(Globals.TEXTURE_SIZES.RING * 4)
  const ringParams = data.ringsParams[paramsIndex]
  const ringTex = createRampTexture(textureBuffer, Globals.TEXTURE_SIZES.RING, ringParams.colorRamp.steps)
  const geometry = createRingGeometryComponent(data.planetMeshQuality, ringParams.innerRadius, ringParams.outerRadius)
  const tslMaterial = new RingTSLMaterial({
    innerRadius: ringParams.innerRadius,
    outerRadius: ringParams.outerRadius,
    texture: ringTex
  })

  const mesh = new THREE.Mesh(geometry, tslMaterial.buildMaterial())
  mesh.name = ringParams.id
  mesh.receiveShadow = true
  mesh.castShadow = true
  return {
    mesh, 
    uniforms: tslMaterial.uniforms,
    buffer: textureBuffer,
    texture: ringTex,
  }
}

// ----------------------------------------------------------------------------------------------------------------------
// NATIVE COMPONENTS

/**
 * Creates a WebGL-based renderer
 * @param width canvas width
 * @param height canvas height
 * @returns the renderer
 */
export async function createRenderer(width: number, height: number, pixelRatio?: number) {
  const idbSettings = await idb.settings.limit(1).first()
  const renderer = new WebGPURenderer({ antialias: true, alpha: true, forceWebGL: idbSettings!.renderingBackend == 'webgl' })
  if (pixelRatio) {
    renderer.setPixelRatio(pixelRatio)
  }
  renderer.setSize(width, height)
  renderer.setClearColor(0x000000, 0)
  renderer.setTransparentSort((a, b) => a.z! - b.z!) // Invert transparent sorting to have a "filter" effect for transparent objects (atmos/ring)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  console.debug(`<Lagrange> Initialised renderer using ${idbSettings!.renderingBackend == 'webgl' ? 'WebGL' : 'WebGPU'} backend.`)
  return renderer
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
  initialOrbit?: THREE.Spherical,
): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(fov, ratio, near, far)
  if (initialOrbit) {
    initialOrbit.makeSafe()
    camera.position.setFromSpherical(initialOrbit)
  }
  return camera
}

/**
 * Creates an orthographic camera with the given params and optional orbit settings
 * @param width screen width
 * @param height screen height
 * @param near closest rendering distance
 * @param far furthest rendering distance
 * @returns the configured camera
 */
export function createOrthographicCamera(
  width: number,
  height: number,
  near: number,
  far: number,
): THREE.OrthographicCamera {
  return new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, near, far)
}

/**
 * Creates a simple ambient light
 * @param color light color
 * @param intensity light intensity
 * @returns the AmbientLight instance
 */
export function createAmbientLight(color: THREE.ColorRepresentation, intensity: number) {
  const light = new THREE.AmbientLight(color)
  light.intensity = intensity
  return light
}

export function createSphereGeometryComponent(quality: number, addtlRadius: number = 0): THREE.SphereGeometry {
  return new THREE.SphereGeometry(1.0 + addtlRadius, quality, quality / 2.0)
}

export function createRingGeometryComponent(
  quality: number,
  innerRadius: number = 1.25,
  outerRadius: number = 1.75,
): THREE.RingGeometry {
  return new THREE.RingGeometry(innerRadius, outerRadius, quality)
}

/**
 * Creates a CustomShaderMaterial instance from the given parameters
 * @param vertexShader GLSL vertex shader
 * @param fragmentShader GLSL fragment shader
 * @param shaderFunctions additional shader functions
 * @param uniforms shader uniforms
 * @param baseMaterial (optional) base material to use
 * @returns the RawShaderMaterial instance
 */
export function createCustomShaderMaterialComponent<T extends MaterialConstructor>(
  vertexShader: string,
  fragmentShader?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uniforms?: { [uniform: string]: THREE.IUniform<any> },
  baseMaterial?: T,
): CustomShaderMaterial<T> {
  const mat = new CustomShaderMaterial({
    baseMaterial: baseMaterial ?? THREE.MeshStandardMaterial,
    vertexShader,
    fragmentShader: fragmentShader ? ShaderLoader.resolveImports(fragmentShader) : undefined,
    uniforms,
    silent: true,
  })
  return mat
}

/**
 * Creates standard OrbitControls
 * @param camera the camera to control
 * @param canvas the render canvas
 * @returns an instance of OrbitControls
 */
export function createOrbitControls(camera: THREE.Camera, canvas: HTMLCanvasElement): OrbitControls {
  const controls = new OrbitControls(camera, canvas)
  controls.enablePan = false
  controls.enableDamping = false
  controls.dampingFactor = 0.05
  controls.screenSpacePanning = false
  controls.minDistance = 1.5
  controls.maxDistance = 10
  controls.maxPolarAngle = Math.PI
  controls.rotateSpeed = 0.5
  controls.zoomSpeed = 1.5
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.DOLLY,
  }
  return controls
}
