import * as THREE from 'three'
import planetFragShader from '@assets/glsl/planet.frag.glsl?raw'
import planetVertShader from '@assets/glsl/planet.vert.glsl?raw'
import cloudsFragShader from '@assets/glsl/clouds.frag.glsl?raw'
import cloudsVertShader from '@assets/glsl/clouds.vert.glsl?raw'
import atmosphereFragShader from '@assets/glsl/atmosphere.frag.glsl?raw'
import atmosphereVertShader from '@assets/glsl/atmosphere.vert.glsl?raw'
import { degToRad } from 'three/src/math/MathUtils.js'
import {
  LG_NAME_CLOUDS,
  LG_NAME_PLANET,
  LG_NAME_AMBLIGHT,
  LG_NAME_ATMOSPHERE,
  LG_NAME_SUN,
  AXIS_Y,
  AXIS_X,
} from '@core/globals'
import { ColorMode, GeometryType, GradientMode, type DataTextureWrapper } from '@core/types'
import { loadCubeTexture } from '@core/three/external-data.loader'
import {
  createAmbientightComponent,
  createGeometryComponent,
  createPerspectiveCameraComponent,
  createRendererComponent,
  createShaderMaterialComponent,
} from '@core/three/component.builder'
import { SceneElements } from '@core/models/scene-elements.model'
import { LensFlareEffect } from '@core/three/lens-flare.effect'
import PlanetData from '@core/models/planet-data.model'
import { ref } from 'vue'
import { normalizeUInt8ArrayPixels } from '@/utils/math-utils'
import { createBiomeTexture } from '@/utils/three-utils'

// Editor constants
export const LG_PLANET_DATA = ref(new PlanetData())
export const LG_HEIGHT_DIVIDER = 200.0

// ----------------------------------------------------------------------------------------------------------------------
// SCENE FUNCTIONS

export function createScene(data: PlanetData, width: number, height: number, pixelRatio: number): SceneElements {
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
  const ambientLight = createAmbientightComponent(data.ambLightColor, data.ambLightIntensity)
  ambientLight.name = LG_NAME_AMBLIGHT
  scene.add(ambientLight)

  return new SceneElements(scene, renderer, camera)
}

export function createSun(data: PlanetData) {
  const sun = new THREE.DirectionalLight(data.sunLightColor, data.sunLightIntensity)
  sun.frustumCulled = false
  sun.userData.lens = 'no-occlusion'
  sun.name = LG_NAME_SUN
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

export function createPlanet(data: PlanetData): { mesh: THREE.Mesh; texs: DataTextureWrapper[] } {
  const geometry = createGeometryComponent(GeometryType.SPHERE)
  geometry.computeTangents()

  const biomeTex = createBiomeTexture(256, data.biomesParams)

  const material = createShaderMaterialComponent(
    planetVertShader,
    planetFragShader,
    {
      // Planet & Rendering
      u_radius: { value: 1.0 },
      u_water_roughness: { value: data.planetWaterRoughness },
      u_water_metalness: { value: data.planetWaterMetalness },
      u_ground_roughness: { value: data.planetGroundRoughness },
      u_ground_metalness: { value: data.planetGroundMetalness },
      u_water_level: { value: data.planetWaterLevel },
      // Surface
      u_bump: { value: data.planetSurfaceShowBumps },
      u_bump_strength: { value: data.planetSurfaceBumpStrength },
      u_bump_offset: { value: 0.005 },
      u_gnd_noise: {
        value: {
          type: data.planetSurfaceNoise.noiseType,
          freq: data.planetSurfaceNoise.frequency,
          amp: data.planetSurfaceNoise.amplitude,
          lac: data.planetSurfaceNoise.lacunarity,
          oct: data.planetSurfaceNoise.octaves,
        },
      },
      u_cr_colors: { value: data.planetSurfaceColorRamp.colors },
      u_cr_positions: { value: data.planetSurfaceColorRamp.factors },
      u_cr_size: { value: data.planetSurfaceColorRampSize },
      // Biomes
      u_biomes: { value: data.biomesEnabled },
      u_biomes_tex: { value: biomeTex.texture },
      u_temp_mode: { value: data.biomesTemperatureMode },
      u_temp_noise: {
        value: {
          type: data.biomesTemperatureNoise.noiseType,
          freq: data.biomesTemperatureNoise.frequency,
          amp: data.biomesTemperatureNoise.amplitude,
          lac: data.biomesTemperatureNoise.lacunarity,
          oct: data.biomesTemperatureNoise.octaves,
        },
      },
      u_humi_mode: { value: GradientMode.REALISTIC },
      u_humi_noise: {
        value: {
          type: data.biomesHumidityNoise.noiseType,
          freq: data.biomesHumidityNoise.frequency,
          amp: data.biomesHumidityNoise.amplitude,
          lac: data.biomesHumidityNoise.lacunarity,
          oct: data.biomesHumidityNoise.octaves,
        },
      },
      //u_humi_tex: { value: humiTex },
    },
    THREE.MeshStandardMaterial,
  )
  material.depthTest = false

  const mesh = new THREE.Mesh(geometry, material)
  mesh.receiveShadow = true
  mesh.name = LG_NAME_PLANET
  return { mesh, texs: [biomeTex] }
}

export function createClouds(data: PlanetData): THREE.Mesh {
  const cloudHeight = data.cloudsHeight / LG_HEIGHT_DIVIDER
  const geometry = createGeometryComponent(GeometryType.SPHERE, cloudHeight)
  const material = createShaderMaterialComponent(
    cloudsVertShader,
    cloudsFragShader,
    {
      u_octaves: { value: 4 },
      u_frequency: { value: data.cloudsNoise.frequency },
      u_amplitude: { value: data.cloudsNoise.amplitude },
      u_lacunarity: { value: data.cloudsNoise.lacunarity },
      u_noise: {
        value: {
          type: data.cloudsNoise.noiseType,
          freq: data.cloudsNoise.frequency,
          amp: data.cloudsNoise.amplitude,
          lac: data.cloudsNoise.lacunarity,
          oct: data.cloudsNoise.octaves,
        },
      },
      u_color: { value: data.cloudsColor },
      u_cr_colors: { value: data.cloudsColorRamp.colors },
      u_cr_positions: { value: data.cloudsColorRamp.factors },
      u_cr_size: { value: data.cloudsColorRampSize },
    },
    THREE.MeshStandardMaterial,
  )
  material.transparent = true
  material.shadowSide = THREE.DoubleSide

  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = LG_NAME_CLOUDS
  mesh.receiveShadow = true
  mesh.castShadow = true
  return mesh
}

export function createAtmosphere(data: PlanetData, sunPos: THREE.Vector3): THREE.Mesh {
  const atmosHeight = data.atmosphereHeight / LG_HEIGHT_DIVIDER
  const atmosDensity = data.atmosphereDensityScale / LG_HEIGHT_DIVIDER
  const geometry = createGeometryComponent(GeometryType.SPHERE, atmosHeight)
  const material = createShaderMaterialComponent(
    atmosphereVertShader,
    atmosphereFragShader,
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
    THREE.ShaderMaterial,
  )
  material.transparent = true

  const mesh = new THREE.Mesh(geometry, material)
  mesh.userData.lens = 'no-occlusion'
  mesh.name = LG_NAME_ATMOSPHERE
  return mesh
}

// ----------------------------------------------------------------------------------------------------------------------
// DATA FUNCTIONS

export type PlanetPreviewData = {
  sun: THREE.DirectionalLight
  ambientLight: THREE.AmbientLight
  planet: THREE.Mesh
  clouds: THREE.Mesh
  atmosphere: THREE.Mesh
}
export function exportPlanetPreview($se: SceneElements, data: PlanetPreviewData): string {
  const initialSize = new THREE.Vector2()
  $se.renderer.getSize(initialSize)

  // ------------------------------- Setup render scene -------------------------------
  const w = 384,
    h = 384
  const previewRenderTarget = new THREE.WebGLRenderTarget(w, h, {
    colorSpace: THREE.SRGBColorSpace,
  })
  const previewScene = new THREE.Scene()
  const previewCamera = createPerspectiveCameraComponent(
    50,
    w / h,
    0.1,
    1e6,
    new THREE.Spherical(
      LG_PLANET_DATA.value.initCamDistance - 1.5,
      Math.PI / 2.0,
      degToRad(LG_PLANET_DATA.value.initCamAngle),
    ),
  )
  previewCamera.setRotationFromAxisAngle(AXIS_Y, degToRad(LG_PLANET_DATA.value.initCamAngle))
  previewCamera.updateProjectionMatrix()

  // ---------------------- Add cloned objects to preview scene -----------------------

  const pivot = new THREE.Group()
  pivot.add(data.planet)
  pivot.add(data.clouds)
  pivot.add(data.atmosphere)
  previewScene.add(pivot)
  previewScene.add(data.sun)
  previewScene.add(data.ambientLight)

  const r = LG_PLANET_DATA.value.planetRadius
  pivot.scale.set(r, r, r)
  pivot.setRotationFromAxisAngle(AXIS_X, degToRad(LG_PLANET_DATA.value.planetAxialTilt))

  // ---------------------------- Setup renderer & render -----------------------------

  $se.renderer.clear()
  $se.renderer.setSize(w, h)
  $se.renderer.setRenderTarget(previewRenderTarget)

  const rawBuffer = new Uint8Array(w * h * 4)
  $se.renderer.render(previewScene, previewCamera)
  $se.renderer.readRenderTargetPixels(previewRenderTarget, 0, 0, w, h, rawBuffer)

  $se.renderer.setSize(initialSize.x, initialSize.y)
  $se.renderer.setRenderTarget(null)

  // ----------------- Create preview canvas & write data from buffer -----------------

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.createImageData(w, h)
  const previewBuffer = normalizeUInt8ArrayPixels(rawBuffer, w, h)
  for (let i = 0; i < imageData.data.length; i++) {
    imageData.data[i] = previewBuffer[i]
  }
  ctx.putImageData(imageData, 0, 0)

  // ------------------------------- Clean-up resources -------------------------------

  pivot.clear()
  data.sun.dispose()
  data.ambientLight.dispose()
  ;(data.clouds.material as THREE.Material).dispose()
  ;(data.atmosphere.material as THREE.Material).dispose()
  ;(data.planet.material as THREE.Material).dispose()

  data.clouds.geometry.dispose()
  data.atmosphere.geometry.dispose()
  data.planet.geometry.dispose()

  previewRenderTarget.dispose()
  previewScene.clear()

  // ----------------------------- Save and remove canvas -----------------------------

  const dataURL = canvas.toDataURL('image/webp')
  canvas.remove()

  return dataURL
}
