import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import CustomShaderMaterial, { type MaterialConstructor } from 'three-custom-shader-material/vanilla'
import { degToRad } from 'three/src/math/MathUtils.js'
import { createRampTexture, createBiomeTexture } from '../helpers/texture.helper'
import type PlanetData from '../models/planet-data.model'
import { ShaderFileType, ColorMode, type SceneRenderObjects } from '../types'
import { loadCubeTexture } from './external-data.loader'
import { LensFlareEffect } from './lens-flare.effect'
import * as Globals from '@core/globals'
import * as ShaderLoader from '../three/shader.loader'
import { WebGPURenderer } from 'three/webgpu'
import { buildPlanetMaterial } from '@/tsl/materials/planet.material'

// ----------------------------------------------------------------------------------------------------------------------
// LAGRANGE COMPONENTS

export function createScene(data: PlanetData, width: number, height: number, pixelRatio: number): SceneRenderObjects {
  // setup cubemap
  const scene = new THREE.Scene()
  scene.background = loadCubeTexture('/skybox/', [
    'space_ft.png',
    'space_bk.png',
    'space_up.png',
    'space_dn.png',
    'space_rt.png',
    'space_lf.png',
  ])

  // setup scene (renderer, cam, lighting)
  const renderer = createRendererComponent(width, height, pixelRatio)
  const camera = createPerspectiveCameraComponent(
    50,
    width / height,
    0.1,
    1e6,
    new THREE.Spherical(data.initCamDistance, Math.PI / 2.0, degToRad(data.initCamAngle)),
  )
  const ambientLight = createAmbientLightComponent(data.ambLightColor, data.ambLightIntensity)
  ambientLight.name = Globals.LG_NAME_AMBLIGHT
  scene.add(ambientLight)

  return { scene, renderer, camera }
}

export function createSun(data: PlanetData) {
  const sun = new THREE.DirectionalLight(data.sunLightColor, data.sunLightIntensity)
  sun.frustumCulled = false
  sun.userData.lens = 'no-occlusion'
  sun.name = Globals.LG_NAME_SUN
  sun.castShadow = true
  sun.shadow.camera.far = 1e4
  sun.shadow.mapSize.width = 4096
  sun.shadow.mapSize.height = 4096
  sun.shadow.bias = -0.00003
  return sun
}

export function createLensFlare(data: PlanetData, pos: THREE.Vector3, color: THREE.Color) {
  return new LensFlareEffect({
    opacity: 1,
    lensPosition: pos,
    colorGain: color,
    starPointsIntensity: data.lensFlarePointsIntensity,
    glareIntensity: data.lensFlareGlareIntensity,
  })
}

export function createPlanet(
  data: PlanetData,
  surfaceTexBuf: Uint8Array,
  biomeTexBuf: Uint8Array,
): { mesh: THREE.Mesh; texs: THREE.DataTexture[] } {
  const geometry = createSphereGeometryComponent(data.planetMeshQuality)
  geometry.computeTangents()

  const surfaceTex = createRampTexture(surfaceTexBuf, Globals.TEXTURE_SIZES.SURFACE, data.planetSurfaceColorRamp.steps)
  const biomeTex = createBiomeTexture(biomeTexBuf, Globals.TEXTURE_SIZES.BIOME, data.biomesParams)

  /*const material = createCustomShaderMaterialComponent(
    ShaderLoader.fetch('planet.vert.glsl', ShaderFileType.CORE),
    ShaderLoader.fetch('planet.frag.glsl', ShaderFileType.CORE),
    {
      // Planet & Rendering
      u_radius: { value: 1.0 },
      u_pbr_params: {
        value: {
          wlevel: data.planetWaterLevel,
          wrough: data.planetWaterRoughness,
          wmetal: data.planetWaterMetalness,
          grough: data.planetGroundRoughness,
          gmetal: data.planetGroundMetalness,
        },
      },
      // Surface
      u_bump: { value: data.planetSurfaceShowBumps },
      u_bump_strength: { value: data.planetSurfaceBumpStrength },
      u_bump_offset: { value: 0.005 },
      u_warp: { value: data.planetSurfaceShowWarping },
      u_displace: { value: data.planetSurfaceShowDisplacement },
      u_surface_displacement: {
        value: {
          freq: data.planetSurfaceDisplacement.frequency,
          amp: data.planetSurfaceDisplacement.amplitude,
          lac: data.planetSurfaceDisplacement.lacunarity,
          oct: data.planetSurfaceDisplacement.octaves,
          eps: data.planetSurfaceDisplacement.epsilon,
          mul: data.planetSurfaceDisplacement.multiplier,
          fac: data.planetSurfaceDisplacement.factor,
        },
      },
      u_surface_noise: {
        value: {
          freq: data.planetSurfaceNoise.frequency,
          amp: data.planetSurfaceNoise.amplitude,
          lac: data.planetSurfaceNoise.lacunarity,
          oct: data.planetSurfaceNoise.octaves,
          layers: data.planetSurfaceNoise.layers,
          xwarp: data.planetSurfaceNoise.xWarpFactor,
          ywarp: data.planetSurfaceNoise.yWarpFactor,
          zwarp: data.planetSurfaceNoise.zWarpFactor,
        },
      },
      u_surface_tex: { value: surfaceTex },
      // Biomes
      u_biomes: { value: data.biomesEnabled },
      u_biomes_tex: { value: biomeTex },
      u_temp_noise: {
        value: {
          mode: data.biomesTemperatureMode,
          freq: data.biomesTemperatureNoise.frequency,
          amp: data.biomesTemperatureNoise.amplitude,
          lac: data.biomesTemperatureNoise.lacunarity,
          oct: data.biomesTemperatureNoise.octaves,
        },
      },
      u_humi_noise: {
        value: {
          mode: data.biomesHumidityMode,
          freq: data.biomesHumidityNoise.frequency,
          amp: data.biomesHumidityNoise.amplitude,
          lac: data.biomesHumidityNoise.lacunarity,
          oct: data.biomesHumidityNoise.octaves,
        },
      },
    },
    THREE.MeshStandardMaterial,
  )*/
  const uniformNodeMat = buildPlanetMaterial()

  const mesh = new THREE.Mesh(geometry, uniformNodeMat.material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.name = Globals.LG_NAME_PLANET
  return { mesh, texs: [surfaceTex, biomeTex] }
}

export function createClouds(
  data: PlanetData,
  textureBuffer: Uint8Array,
): { mesh: THREE.Mesh; texs: THREE.DataTexture[] } {
  const cloudHeight = data.cloudsHeight / Globals.ATMOSPHERE_HEIGHT_DIVIDER
  const geometry = createSphereGeometryComponent(data.planetMeshQuality, cloudHeight)
  const opacityTex = createRampTexture(textureBuffer, Globals.TEXTURE_SIZES.CLOUDS, data.cloudsColorRamp.steps)

  const material = createCustomShaderMaterialComponent(
    ShaderLoader.fetch('clouds.vert.glsl', ShaderFileType.CORE),
    ShaderLoader.fetch('clouds.frag.glsl', ShaderFileType.CORE),
    {
      u_warp: { value: data.cloudsShowWarping },
      u_displace: { value: data.cloudsShowDisplacement },
      u_displacement: {
        value: {
          freq: data.cloudsDisplacement.frequency,
          amp: data.cloudsDisplacement.amplitude,
          lac: data.cloudsDisplacement.lacunarity,
          oct: data.cloudsDisplacement.octaves,
          eps: data.cloudsDisplacement.epsilon,
          mul: data.cloudsDisplacement.multiplier,
          fac: data.cloudsDisplacement.factor,
        },
      },
      u_noise: {
        value: {
          freq: data.cloudsNoise.frequency,
          amp: data.cloudsNoise.amplitude,
          lac: data.cloudsNoise.lacunarity,
          oct: data.cloudsNoise.octaves,
          layers: data.cloudsNoise.layers,
          xwarp: data.cloudsNoise.xWarpFactor,
          ywarp: data.cloudsNoise.yWarpFactor,
          zwarp: data.cloudsNoise.zWarpFactor,
        },
      },
      u_color: { value: data.cloudsColor },
      u_opacity_tex: { value: opacityTex },
    },
    THREE.MeshStandardMaterial,
  )
  material.transparent = true

  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = Globals.LG_NAME_CLOUDS
  mesh.receiveShadow = true
  mesh.castShadow = true
  return { mesh, texs: [opacityTex] }
}

export function createAtmosphere(data: PlanetData, sunPos: THREE.Vector3): THREE.Mesh {
  const atmosHeight = data.atmosphereHeight / Globals.ATMOSPHERE_HEIGHT_DIVIDER
  const atmosDensity = data.atmosphereDensityScale / Globals.ATMOSPHERE_HEIGHT_DIVIDER
  const geometry = createSphereGeometryComponent(data.planetMeshQuality, atmosHeight)
  const material = createShaderMaterialComponent(
    ShaderLoader.fetch('atmosphere.vert.glsl', ShaderFileType.CORE),
    ShaderLoader.fetch('atmosphere.frag.glsl', ShaderFileType.CORE),
    {
      u_light_position: { value: sunPos },
      u_light_intensity: { value: data.sunLightIntensity },
      u_surface_radius: { value: 1.0 },
      u_radius: { value: 1.0 + atmosHeight },
      u_density: { value: atmosDensity },
      u_intensity: { value: data.atmosphereIntensity },
      u_color_mode: { value: ColorMode.REALISTIC },
      u_hue: { value: data.atmosphereHue },
      u_tint: { value: data.atmosphereTint },
    },
  )
  material.transparent = true
  material.depthWrite = false

  const mesh = new THREE.Mesh(geometry, material)
  mesh.userData.lens = 'no-occlusion'
  mesh.name = Globals.LG_NAME_ATMOSPHERE
  mesh.castShadow = true
  return mesh
}

export function createRing(
  data: PlanetData,
  textureBuffer: Uint8Array,
  paramsIndex: number,
): { mesh: THREE.Mesh; texs: THREE.DataTexture[] } {
  const ringParams = data.ringsParams[paramsIndex]
  const rgbaTex = createRampTexture(textureBuffer, Globals.TEXTURE_SIZES.RING, ringParams.colorRamp.steps)
  const geometry = createRingGeometryComponent(data.planetMeshQuality, ringParams.innerRadius, ringParams.outerRadius)
  const material = createCustomShaderMaterialComponent(
    ShaderLoader.fetch('ring.vert.glsl', ShaderFileType.CORE),
    ShaderLoader.fetch('ring.frag.glsl', ShaderFileType.CORE),
    {
      u_inner_radius: { value: ringParams.innerRadius },
      u_outer_radius: { value: ringParams.outerRadius },
      u_ring_tex: { value: rgbaTex },
    },
    THREE.MeshStandardMaterial,
  )
  material.side = THREE.DoubleSide
  material.transparent = true
  material.opacity = 1

  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = ringParams.id
  mesh.receiveShadow = true
  mesh.castShadow = true
  return { mesh, texs: [rgbaTex] }
}

// ----------------------------------------------------------------------------------------------------------------------
// NATIVE COMPONENTS

/**
 * Creates a WebGL-based renderer
 * @param width canvas width
 * @param height canvas height
 * @returns the renderer
 */
export function createRendererComponent(width: number, height: number, pixelRatio?: number) {
  const renderer = new WebGPURenderer({ antialias: true, alpha: true })
  if (pixelRatio) {
    renderer.setPixelRatio(pixelRatio)
  }
  renderer.setSize(width, height)
  renderer.setClearColor(0x000000, 0)
  //renderer.setTransparentSort((a, b) => a.z - b.z) // Invert transparent sorting to have a "filter" effect for transparent objects (atmos/ring)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
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
export function createPerspectiveCameraComponent(
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
 * Creates a perspective camera with the given params and optional orbit settings
 * @param fov Field of View, in degrees
 * @param ratio aspect ratio, i.e. width/height
 * @param near closest rendering distance
 * @param far furthest rendering distance
 * @param initialOrbit (optional) orbit settings (angle, etc)
 * @returns the configured camera
 */
export function createOrthgraphicCameraComponent(
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
export function createAmbientLightComponent(color: THREE.ColorRepresentation, intensity: number) {
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

export function createShaderMaterialComponent(
  vertexShader: string,
  fragmentShader?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uniforms?: { [uniform: string]: THREE.IUniform<any> },
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: fragmentShader ? ShaderLoader.resolveImports(fragmentShader) : undefined,
    uniforms,
  })
}

/**
 * Creates standard OrbitControls
 * @param camera the camera to control
 * @param canvas the render canvas
 * @returns an instance of OrbitControls
 */
export function createControlsComponent(camera: THREE.Camera, canvas: HTMLCanvasElement): OrbitControls {
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
