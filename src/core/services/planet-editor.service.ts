import { ref } from 'vue'
import * as THREE from 'three'
import { degToRad } from 'three/src/math/MathUtils.js'
import * as Globals from '@core/globals'
import * as ShaderLoader from '../three/shader.loader'
import * as ComponentBuilder from '@core/three/component.builder'
import { ColorMode, ShaderFileType, type BakingTarget, type DataTextureWrapper } from '@core/types'
import { loadCubeTexture } from '@core/three/external-data.loader'
import { SceneElements } from '@core/models/scene-elements.model'
import { LensFlareEffect } from '@core/three/lens-flare.effect'
import PlanetData from '@core/models/planet-data.model'
import { normalizeUInt8ArrayPixels } from '@/utils/math-utils'
import { createBiomeTexture, createRampTexture } from '../helpers/texture.helper'
import {
  bakeMesh,
  createBakingHeightMap,
  createBakingClouds,
  createBakingNormalMap,
  createBakingPBRMap,
  createBakingPlanet,
  createBakingRing,
} from './planet-baker.service'
import { exportMeshesToGLTF } from '../helpers/export.helper'
import { idb } from '@/dexie.config'

// Editor constants
export const LG_PLANET_DATA = ref(new PlanetData())

// Buffers
export const LG_BUFFER_SURFACE = new Uint8Array(Globals.TEXTURE_SIZES.SURFACE * 4)
export const LG_BUFFER_BIOME = new Uint8Array(Globals.TEXTURE_SIZES.BIOME * Globals.TEXTURE_SIZES.BIOME * 4)
export const LG_BUFFER_CLOUDS = new Uint8Array(Globals.TEXTURE_SIZES.CLOUDS * Globals.TEXTURE_SIZES.CLOUDS * 4)
export const LG_BUFFER_RING = new Uint8Array(Globals.TEXTURE_SIZES.RING * Globals.TEXTURE_SIZES.RING * 4)

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
  const renderer = ComponentBuilder.createRendererComponent(width, height, pixelRatio)
  const camera = ComponentBuilder.createPerspectiveCameraComponent(
    50,
    width / height,
    0.1,
    1e6,
    new THREE.Spherical(data.initCamDistance, Math.PI / 2.0, degToRad(data.initCamAngle)),
  )
  const ambientLight = ComponentBuilder.createAmbientightComponent(data.ambLightColor, data.ambLightIntensity)
  ambientLight.name = Globals.LG_NAME_AMBLIGHT
  scene.add(ambientLight)

  return new SceneElements(scene, renderer, camera)
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

export function createPlanet(data: PlanetData): { mesh: THREE.Mesh; texs: DataTextureWrapper[] } {
  const geometry = ComponentBuilder.createSphereGeometryComponent()
  geometry.computeTangents()

  const surfaceTex = createRampTexture(
    LG_BUFFER_SURFACE,
    Globals.TEXTURE_SIZES.SURFACE,
    data.planetSurfaceColorRamp.steps,
  )
  const biomeTex = createBiomeTexture(LG_BUFFER_BIOME, Globals.TEXTURE_SIZES.BIOME, data.biomesParams)

  const material = ComponentBuilder.createCustomShaderMaterialComponent(
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
          wemimode: data.planetWaterEmissiveMode,
          wemicolor: data.planetWaterEmissiveColor,
          wemiscale: data.planetWaterEmissiveIntensity,
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
      u_surface_tex: { value: surfaceTex.texture },
      // Biomes
      u_biomes: { value: data.biomesEnabled },
      u_biomes_tex: { value: biomeTex.texture },
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
    THREE.MeshStandardMaterial
  )

  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.name = Globals.LG_NAME_PLANET
  return { mesh, texs: [surfaceTex, biomeTex] }
}

export function createClouds(data: PlanetData): { mesh: THREE.Mesh; texs: DataTextureWrapper[] } {
  const cloudHeight = data.cloudsHeight / Globals.ATMOSPHERE_HEIGHT_DIVIDER
  const geometry = ComponentBuilder.createSphereGeometryComponent(cloudHeight)
  const opacityTex = createRampTexture(LG_BUFFER_CLOUDS, Globals.TEXTURE_SIZES.CLOUDS, data.cloudsColorRamp.steps)

  const material = ComponentBuilder.createCustomShaderMaterialComponent(
    ShaderLoader.fetch('clouds.vert.glsl', ShaderFileType.CORE),
    ShaderLoader.fetch('clouds.frag.glsl', ShaderFileType.CORE),
    {
      u_warp: { value: data.cloudsShowWarping },
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
      u_opacity_tex: { value: opacityTex.texture },
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
  const geometry = ComponentBuilder.createSphereGeometryComponent(atmosHeight)
  const material = ComponentBuilder.createShaderMaterialComponent(
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

export function createRing(data: PlanetData): { mesh: THREE.Mesh; texs: DataTextureWrapper[] } {
  const rgbaTex = createRampTexture(LG_BUFFER_RING, Globals.TEXTURE_SIZES.RING, data.ringColorRamp.steps)
  const geometry = ComponentBuilder.createRingGeometryComponent(data.ringInnerRadius, data.ringOuterRadius)
  const material = ComponentBuilder.createCustomShaderMaterialComponent(
    ShaderLoader.fetch('ring.vert.glsl', ShaderFileType.CORE),
    ShaderLoader.fetch('ring.frag.glsl', ShaderFileType.CORE),
    {
      u_inner_radius: { value: LG_PLANET_DATA.value.ringInnerRadius },
      u_outer_radius: { value: LG_PLANET_DATA.value.ringOuterRadius },
      u_ring_tex: { value: rgbaTex.texture },
    },
    THREE.MeshStandardMaterial,
  )
  material.side = THREE.DoubleSide
  material.transparent = true

  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = Globals.LG_NAME_RING
  mesh.receiveShadow = true
  mesh.castShadow = true
  return { mesh, texs: [rgbaTex] }
}

// ----------------------------------------------------------------------------------------------------------------------
// DATA FUNCTIONS

export type PlanetPreviewData = {
  sun: THREE.DirectionalLight
  ambientLight: THREE.AmbientLight
  planet: THREE.Mesh
  clouds: THREE.Mesh
  atmosphere: THREE.Mesh
  ring: THREE.Mesh
}
export type PlanetGltfData = {
  planet: THREE.Mesh
  clouds: THREE.Mesh
  ring: THREE.Mesh
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
  const previewCamera = ComponentBuilder.createPerspectiveCameraComponent(
    50,
    w / h,
    0.1,
    1e4,
    new THREE.Spherical(
      LG_PLANET_DATA.value.initCamDistance - (LG_PLANET_DATA.value.ringEnabled ? 0.75 : 1.5),
      Math.PI / 2.0,
      degToRad(LG_PLANET_DATA.value.initCamAngle),
    ),
  )
  previewCamera.setRotationFromAxisAngle(Globals.AXIS_Y, degToRad(LG_PLANET_DATA.value.initCamAngle))
  previewCamera.updateProjectionMatrix()

  // ---------------------- Add cloned objects to preview scene -----------------------
  const planetGroup = new THREE.Group()
  planetGroup.add(data.planet)
  planetGroup.add(data.clouds)
  planetGroup.add(data.atmosphere)

  const ringAnchor = new THREE.Group()
  ringAnchor.add(data.ring)
  planetGroup.add(ringAnchor)

  previewScene.add(planetGroup)
  previewScene.add(data.sun!)
  previewScene.add(data.ambientLight!)

  planetGroup.scale.setScalar(LG_PLANET_DATA.value.planetRadius)
  planetGroup.setRotationFromAxisAngle(Globals.AXIS_X, degToRad(LG_PLANET_DATA.value.planetAxialTilt))
  ringAnchor.setRotationFromAxisAngle(Globals.AXIS_X, degToRad(LG_PLANET_DATA.value.ringAxialTilt))

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
  ringAnchor.clear()
  planetGroup.clear()
  data.sun!.dispose()
  data.ambientLight!.dispose()
  ;(data.clouds.material as THREE.Material).dispose()
  ;(data.atmosphere.material as THREE.Material).dispose()
  ;(data.planet.material as THREE.Material).dispose()
  ;(data.ring.material as THREE.Material).dispose()

  data.clouds.geometry.dispose()
  data.atmosphere.geometry.dispose()
  data.planet.geometry.dispose()
  data.ring.geometry.dispose()

  previewRenderTarget.dispose()
  previewScene.clear()

  // ----------------------------- Save and remove canvas -----------------------------

  const dataURL = canvas.toDataURL('image/webp')
  canvas.remove()
  return dataURL
}

export async function exportPlanetToGLTF(
  renderer: THREE.WebGLRenderer,
  progressDialog: { open: () => void; setProgress: (value: number) => void },
) {
  progressDialog.setProgress(1)
  const bakingTargets: BakingTarget[] = []
  const appSettings = await idb.settings.limit(1).first()
  const w = appSettings?.bakingResolution ?? 2048,
    h = appSettings?.bakingResolution ?? 2048

  // ----------------------------------- Bake planet ----------------------------------
  progressDialog.setProgress(2)
  const bakePlanet = createBakingPlanet(LG_PLANET_DATA.value as PlanetData)
  const bakePlanetSurfaceTex = await bakeMesh(renderer, bakePlanet, w, h)
  if (appSettings?.bakingPixelize) bakePlanetSurfaceTex.magFilter = THREE.NearestFilter

  progressDialog.setProgress(3)
  const bakePBR = createBakingPBRMap(LG_PLANET_DATA.value as PlanetData)
  const bakePlanetPBRTex = await bakeMesh(renderer, bakePBR, w, h)
  if (appSettings?.bakingPixelize) bakePlanetPBRTex.magFilter = THREE.NearestFilter

  progressDialog.setProgress(4)
  const bakeHeight = createBakingHeightMap(LG_PLANET_DATA.value as PlanetData)
  const bakePlanetHeightTex = await bakeMesh(renderer, bakeHeight, w, h)

  const bakeNormal = createBakingNormalMap(bakePlanetHeightTex, w)
  const bakePlanetNormalTex = await bakeMesh(renderer, bakeNormal, w, h)
  if (appSettings?.bakingPixelize) bakePlanetNormalTex.magFilter = THREE.NearestFilter

  bakePlanet.material = new THREE.MeshStandardMaterial({
    map: bakePlanetSurfaceTex,
    roughnessMap: bakePlanetPBRTex,
    metalnessMap: bakePlanetPBRTex,
    normalMap: bakePlanetNormalTex,
    normalScale: new THREE.Vector2(
      2.0 * LG_PLANET_DATA.value.planetSurfaceBumpStrength,
      2.0 * LG_PLANET_DATA.value.planetSurfaceBumpStrength,
    ),
  })
  bakingTargets.push({ mesh: bakePlanet, textures: [bakePlanetSurfaceTex, bakePlanetPBRTex, bakePlanetHeightTex] })

  // ----------------------------------- Bake clouds ----------------------------------
  if (LG_PLANET_DATA.value.cloudsEnabled) {
    progressDialog.setProgress(5)
    const bakeClouds = createBakingClouds(LG_PLANET_DATA.value as PlanetData)
    const bakeCloudsTex = await bakeMesh(renderer, bakeClouds, w, h)
    if (appSettings?.bakingPixelize) bakeCloudsTex.magFilter = THREE.NearestFilter

    bakeClouds.material = new THREE.MeshStandardMaterial({
      map: bakeCloudsTex,
      opacity: 1.0,
      metalness: 0.5,
      roughness: 1.0,
      transparent: true,
    })
    bakingTargets.push({ mesh: bakeClouds, textures: [bakeCloudsTex] })
    bakePlanet.add(bakeClouds)
  }

  // --------------------------------- Bake ring system -------------------------------
  if (LG_PLANET_DATA.value.ringEnabled) {
    progressDialog.setProgress(6)
    const bakeRing = createBakingRing(LG_PLANET_DATA.value as PlanetData)
    const bakeRingTex = await bakeMesh(renderer, bakeRing, w, h)
    if (appSettings?.bakingPixelize) bakeRingTex.magFilter = THREE.NearestFilter

    bakeRing.material = new THREE.MeshStandardMaterial({
      map: bakeRingTex,
      side: THREE.DoubleSide,
      transparent: true,
    })
    bakingTargets.push({ mesh: bakeRing, textures: [bakeRingTex] })
    bakePlanet.add(bakeRing)
  }

  // ---------------------------- Export meshes and clean up ---------------------------
  progressDialog.setProgress(7)
  bakePlanet.name = LG_PLANET_DATA.value.planetName
  exportMeshesToGLTF([bakePlanet], LG_PLANET_DATA.value.planetName.replaceAll(' ', '_') + `_${w}`)
  bakingTargets.forEach((bt) => {
    bt.textures.forEach((tex) => tex.dispose())
    ;(bt.mesh.material as THREE.MeshStandardMaterial).dispose()
    bt.mesh.geometry.dispose()
  })
  progressDialog.setProgress(8)
}
