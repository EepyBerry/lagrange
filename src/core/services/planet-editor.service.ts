import { ref } from 'vue'
import * as THREE from 'three'
import { degToRad } from 'three/src/math/MathUtils.js'
import * as Globals from '@core/globals'
import * as ComponentBuilder from '@core/three/component.builder'
import { type BakingTarget } from '@core/types'
import { SceneElements } from '@core/models/scene-elements.model'
import PlanetData from '@core/models/planet-data.model'
import { normalizeUInt8ArrayPixels } from '@/utils/math-utils'
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
import { sleep } from '@/utils/utils'

// Editor constants
export const LG_PLANET_DATA = ref(new PlanetData())

// Buffers
export const LG_BUFFER_SURFACE = new Uint8Array(Globals.TEXTURE_SIZES.SURFACE * 4)
export const LG_BUFFER_BIOME = new Uint8Array(Globals.TEXTURE_SIZES.BIOME * Globals.TEXTURE_SIZES.BIOME * 4)
export const LG_BUFFER_CLOUDS = new Uint8Array(Globals.TEXTURE_SIZES.CLOUDS * Globals.TEXTURE_SIZES.CLOUDS * 4)
export const LG_BUFFER_RING = new Uint8Array(Globals.TEXTURE_SIZES.RING * Globals.TEXTURE_SIZES.RING * 4)

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
  progressDialog: { open: () => void; setProgress: (value: number) => void; setError: (error: unknown) => void },
) {
  progressDialog.setProgress(1)
  await sleep(50)
  const bakingTargets: BakingTarget[] = []
  try {
    const appSettings = await idb.settings.limit(1).first()
    const w = appSettings?.bakingResolution ?? 2048,
      h = appSettings?.bakingResolution ?? 2048

    // ----------------------------------- Bake planet ----------------------------------
    progressDialog.setProgress(2)
    await sleep(50)
    const bakePlanet = createBakingPlanet(LG_PLANET_DATA.value as PlanetData)
    const bakePlanetSurfaceTex = bakeMesh(renderer, bakePlanet, w, h)
    if (appSettings?.bakingPixelize) bakePlanetSurfaceTex.magFilter = THREE.NearestFilter

    progressDialog.setProgress(3)
    await sleep(50)
    const bakePBR = createBakingPBRMap(LG_PLANET_DATA.value as PlanetData)
    const bakePlanetPBRTex = bakeMesh(renderer, bakePBR, w, h)
    if (appSettings?.bakingPixelize) bakePlanetPBRTex.magFilter = THREE.NearestFilter

    progressDialog.setProgress(4)
    await sleep(50)
    const bakeHeight = createBakingHeightMap(LG_PLANET_DATA.value as PlanetData)
    const bakePlanetHeightTex = bakeMesh(renderer, bakeHeight, w, h)

    const bakeNormal = createBakingNormalMap(bakePlanetHeightTex, w)
    const bakePlanetNormalTex = bakeMesh(renderer, bakeNormal, w, h)
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
      await sleep(50)
      const bakeClouds = createBakingClouds(LG_PLANET_DATA.value as PlanetData)
      const bakeCloudsTex = bakeMesh(renderer, bakeClouds, w, h)
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
      bakeClouds.setRotationFromAxisAngle(bakeClouds.up, degToRad(LG_PLANET_DATA.value.cloudsRotation))
    }

    // --------------------------------- Bake ring system -------------------------------
    if (LG_PLANET_DATA.value.ringEnabled) {
      progressDialog.setProgress(6)
      await sleep(50)
      const bakeRing = createBakingRing(LG_PLANET_DATA.value as PlanetData)
      const bakeRingTex = bakeMesh(renderer, bakeRing, w, h)
      if (appSettings?.bakingPixelize) bakeRingTex.magFilter = THREE.NearestFilter

      bakeRing.material = new THREE.MeshStandardMaterial({
        map: bakeRingTex,
        side: THREE.DoubleSide,
        transparent: true,
      })
      bakingTargets.push({ mesh: bakeRing, textures: [bakeRingTex] })
      bakePlanet.add(bakeRing)
      bakeRing.setRotationFromAxisAngle(Globals.AXIS_X, degToRad(LG_PLANET_DATA.value.ringAxialTilt))
    }

    // ---------------------------- Export meshes and clean up ---------------------------
    progressDialog.setProgress(7)
    await sleep(50)

    bakePlanet.scale.setScalar(LG_PLANET_DATA.value.planetRadius)
    bakePlanet.setRotationFromAxisAngle(Globals.AXIS_X, degToRad(LG_PLANET_DATA.value.planetAxialTilt))
    bakePlanet.rotateOnAxis(bakePlanet.up, degToRad(LG_PLANET_DATA.value.planetRotation))

    bakePlanet.name = LG_PLANET_DATA.value.planetName
    exportMeshesToGLTF([bakePlanet], LG_PLANET_DATA.value.planetName.replaceAll(' ', '_') + `_${w}`)
  } catch (error) {
    console.error(error)
    progressDialog.setError(error)
  } finally {
    bakingTargets.forEach((bt) => {
      bt.textures.forEach((tex) => tex.dispose())
      ;(bt.mesh.material as THREE.MeshStandardMaterial)?.dispose()
      bt.mesh.geometry?.dispose()
    })
    progressDialog.setProgress(8)
  }
}
