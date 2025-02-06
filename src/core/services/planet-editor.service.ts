import { ref, type Ref } from 'vue'
import * as THREE from 'three'
import { degToRad } from 'three/src/math/MathUtils.js'
import * as Globals from '@core/globals'
import * as ComponentBuilder from '@core/three/component.builder'
import { type BakingTarget, type PlanetSceneData } from '@core/types'
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
import saveAs from 'file-saver'
import { clearUniformUpdateMap, execUniformUpdate, initUniformUpdateMap } from '../helpers/uniform.helper'
import Stats from 'three/examples/jsm/libs/stats.module.js'

// Editor constants
const LG_SCENE_DATA: PlanetSceneData = {}
export const LG_PLANET_DATA = ref(new PlanetData())

// Buffers
export const LG_BUFFER_SURFACE = new Uint8Array(Globals.TEXTURE_SIZES.SURFACE * 4)
export const LG_BUFFER_BIOME = new Uint8Array(Globals.TEXTURE_SIZES.BIOME * Globals.TEXTURE_SIZES.BIOME * 4)
export const LG_BUFFER_CLOUDS = new Uint8Array(Globals.TEXTURE_SIZES.CLOUDS * Globals.TEXTURE_SIZES.CLOUDS * 4)
export const LG_BUFFER_RING = new Uint8Array(Globals.TEXTURE_SIZES.RING * Globals.TEXTURE_SIZES.RING * 4)

const hasPlanetBeenEdited: Ref<boolean> = ref(false)
let enableEditorRendering = true
let watchForPlanetUpdates = false

// ------------------------------------------------------------------------------------------------ //
//                                           BOOTSTRAPPING                                          //
// ------------------------------------------------------------------------------------------------ //

export function bootstrapEditor(canvas: HTMLCanvasElement, w: number, h: number, pixelRatio: number) {
  enableEditorRendering = true
  const sceneElems = ComponentBuilder.createScene(w, h, pixelRatio)
  LG_SCENE_DATA.scene = sceneElems.scene
  LG_SCENE_DATA.renderer = sceneElems.renderer
  LG_SCENE_DATA.camera = sceneElems.camera
  LG_SCENE_DATA.clock = new THREE.Clock()
  initLighting()
  initPlanet()
  initRendering(canvas, w, h)
  initUniformUpdateMap(LG_SCENE_DATA)
  ComponentBuilder.createControlsComponent(LG_SCENE_DATA.camera, LG_SCENE_DATA.renderer.domElement)
}

function initLighting(): void {
  const sun = ComponentBuilder.createSun(LG_PLANET_DATA.value as PlanetData)
  const lensFlare = ComponentBuilder.createLensFlare(LG_PLANET_DATA.value as PlanetData, sun.position, sun.color)
  sun.add(lensFlare.mesh)
  LG_SCENE_DATA.scene!.add(sun)
  LG_SCENE_DATA.sunLight = sun
  LG_SCENE_DATA.ambLight = LG_SCENE_DATA.scene!.getObjectByName(Globals.LG_NAME_AMBLIGHT) as THREE.AmbientLight
  LG_SCENE_DATA.lensFlare = lensFlare

  // Set initial rotations
  const pos = Globals.SUN_INIT_POS.clone()
  pos.applyAxisAngle(Globals.AXIS_X, degToRad(-15))
  LG_SCENE_DATA.sunLight.position.set(pos.x, pos.y, pos.z)
  LG_SCENE_DATA.lensFlare.updatePosition(LG_SCENE_DATA.sunLight.position)
}

function initPlanet(): void {
  const planet = ComponentBuilder.createPlanet(LG_PLANET_DATA.value as PlanetData)
  const clouds = ComponentBuilder.createClouds(LG_PLANET_DATA.value as PlanetData)
  const atmosphere = ComponentBuilder.createAtmosphere(LG_PLANET_DATA.value as PlanetData, LG_SCENE_DATA.sunLight!.position)
  const ring = ComponentBuilder.createRing(LG_PLANET_DATA.value as PlanetData)
  const planetGroup = new THREE.Group()
  planetGroup.add(planet.mesh)
  planetGroup.add(clouds.mesh)
  planetGroup.add(atmosphere)

  const ringAnchor = new THREE.Group()
  ringAnchor.add(ring.mesh)
  planetGroup.add(ringAnchor)

  LG_SCENE_DATA.scene!.add(planetGroup)
  LG_SCENE_DATA.planet = planet.mesh
  LG_SCENE_DATA.clouds = clouds.mesh
  LG_SCENE_DATA.atmosphere = atmosphere
  LG_SCENE_DATA.ring = ring.mesh
  LG_SCENE_DATA.planetGroup = planetGroup
  LG_SCENE_DATA.ringAnchor = ringAnchor

  // Set datatextures + data
  LG_SCENE_DATA.surfaceDataTex = planet.texs[0].texture
  LG_SCENE_DATA.biomeDataTex = planet.texs[1].texture
  LG_SCENE_DATA.cloudsDataTex = clouds.texs[0].texture
  LG_SCENE_DATA.ringDataTex = ring.texs[0].texture

  // Set initial rotations
  LG_SCENE_DATA.planetGroup.setRotationFromAxisAngle(Globals.AXIS_X, degToRad(LG_PLANET_DATA.value.planetAxialTilt))
  LG_SCENE_DATA.planet.setRotationFromAxisAngle(LG_SCENE_DATA.planet.up, degToRad(LG_PLANET_DATA.value.planetRotation))
  LG_SCENE_DATA.clouds.setRotationFromAxisAngle(
    LG_SCENE_DATA.clouds.up,
    degToRad(LG_PLANET_DATA.value.planetRotation + LG_PLANET_DATA.value.cloudsRotation),
  )
  LG_SCENE_DATA.ringAnchor.setRotationFromAxisAngle(Globals.AXIS_X, degToRad(LG_PLANET_DATA.value.ringAxialTilt))
  LG_SCENE_DATA.ring.setRotationFromAxisAngle(LG_SCENE_DATA.ring.up, degToRad(LG_PLANET_DATA.value.ringRotation))

  // Set lighting target
  LG_SCENE_DATA.sunLight!.target = LG_SCENE_DATA.planetGroup
}

function initRendering(sceneRoot: HTMLCanvasElement, width: number, height: number) {
  const stats = new Stats()
  stats.dom.style.right = '0'
  stats.dom.style.left = 'auto'
  stats.dom.ariaHidden = 'true'
  // document.body.appendChild(stats.dom)

  LG_SCENE_DATA.renderer!.setSize(width, height)
  LG_SCENE_DATA.renderer!.setAnimationLoop(() => renderFrame(stats))
  LG_SCENE_DATA.renderer!.domElement.ariaLabel = '3D planet viewer'
  sceneRoot.appendChild(LG_SCENE_DATA.renderer!.domElement)
}

// ------------------------------------------------------------------------------------------------ //
//                                         SCENE MANAGEMENT                                         //
// ------------------------------------------------------------------------------------------------ //

function renderFrame(stats: Stats) {
  if (!enableEditorRendering) {
    return
  }
  stats.update()
  updateScene()
  watchForPlanetUpdates = true
  LG_SCENE_DATA.lensFlare!.update(LG_SCENE_DATA.renderer!, LG_SCENE_DATA.scene!, LG_SCENE_DATA.camera!, LG_SCENE_DATA.clock!)
  LG_SCENE_DATA.renderer!.render(LG_SCENE_DATA.scene!, LG_SCENE_DATA.camera!)
}

export function updateCameraRendering(w: number, h: number) {
  LG_SCENE_DATA.camera!.aspect = w / h
  LG_SCENE_DATA.camera!.updateProjectionMatrix()
  LG_SCENE_DATA.renderer!.setSize(w, h)
}

function updateScene() {
  if (watchForPlanetUpdates && LG_PLANET_DATA.value.changedProps.length > 0 && !hasPlanetBeenEdited.value) {
    console.debug('Planet has been edited, warning user in case of unsaved data')
    hasPlanetBeenEdited.value = true
  }
  for (const changedProp of LG_PLANET_DATA.value.changedProps.filter((ch) => !!ch.prop)) {
    let key = changedProp.prop
    // Check for additional info, separated by |
    key = changedProp.prop.split('|')[0]
    execUniformUpdate(key)
  }
  LG_PLANET_DATA.value.clearChangedProps()
}

/**
 * Removes every object from the scene, then removes the scene itself
 */
export function disposeScene() {
  watchForPlanetUpdates = false
  console.debug('[unmount] Clearing scene...')
  LG_SCENE_DATA.sunLight!.dispose()
  LG_SCENE_DATA.ambLight!.dispose()
  LG_SCENE_DATA.scene!.remove(LG_SCENE_DATA.sunLight!)
  LG_SCENE_DATA.scene!.remove(LG_SCENE_DATA.ambLight!)

  LG_SCENE_DATA.lensFlare!.material.dispose()
  LG_SCENE_DATA.lensFlare!.mesh.geometry.dispose()
  ;(LG_SCENE_DATA.planet!.material as THREE.Material).dispose()
  LG_SCENE_DATA.planet!.geometry.dispose()
  ;(LG_SCENE_DATA.clouds!.material as THREE.Material).dispose()
  LG_SCENE_DATA.clouds!.geometry.dispose()
  ;(LG_SCENE_DATA.atmosphere!.material as THREE.Material).dispose()
  LG_SCENE_DATA.atmosphere!.geometry.dispose()
  ;(LG_SCENE_DATA.ring!.material as THREE.Material).dispose()
  LG_SCENE_DATA.ring!.geometry.dispose()

  LG_BUFFER_SURFACE.fill(0)
  LG_BUFFER_BIOME.fill(0)
  LG_BUFFER_CLOUDS.fill(0)
  LG_BUFFER_RING.fill(0)
  LG_SCENE_DATA.surfaceDataTex!.dispose()
  LG_SCENE_DATA.biomeDataTex!.dispose()
  LG_SCENE_DATA.cloudsDataTex!.dispose()
  LG_SCENE_DATA.ringAnchor!.clear()
  LG_SCENE_DATA.planetGroup!.clear()

  LG_SCENE_DATA.scene!.children.forEach((c) => LG_SCENE_DATA.scene!.remove(c))
  LG_SCENE_DATA.renderer!.dispose()
  
  clearUniformUpdateMap()
  console.debug('[unmount] ...done!')
}

// ------------------------------------------------------------------------------------------------ //
//                                          DATA FUNCTIONS                                          //
// ------------------------------------------------------------------------------------------------ //

export async function resetPlanet() {
  LG_PLANET_DATA.value.reset()
}

export function exportPlanetScreenshot() {
  LG_SCENE_DATA.renderer!.domElement.toBlob((blob) => {
    saveAs(blob!, `${LG_PLANET_DATA.value.planetName.replaceAll(' ', '_')}-${new Date().toISOString()}.png`)
  }, 'image/png')
}

export async function exportPlanetPreview(): Promise<string> {
  await sleep(50)
  LG_SCENE_DATA.lensFlare!.mesh.visible = false

  // ------------------------------- Setup render scene -------------------------------
  const w = 384, h = 384
  const previewRenderTarget = new THREE.WebGLRenderTarget(w, h, {
    colorSpace: THREE.SRGBColorSpace,
  })
  const previewCamera = ComponentBuilder.createPerspectiveCameraComponent(
    50,
    w / h,
    0.1,
    10,
    new THREE.Spherical(
      LG_PLANET_DATA.value.initCamDistance - (LG_PLANET_DATA.value.ringEnabled ? 0.75 : 1.5),
      Math.PI / 2.0,
      degToRad(LG_PLANET_DATA.value.initCamAngle),
    ),
  )
  previewCamera.setRotationFromAxisAngle(Globals.AXIS_Y, degToRad(LG_PLANET_DATA.value.initCamAngle))
  previewCamera.updateProjectionMatrix()

  const renderGroup = new THREE.Group()
  renderGroup.add(LG_SCENE_DATA.planetGroup!, LG_SCENE_DATA.sunLight!)

  // ---------------------------- Setup renderer & render -----------------------------
  LG_SCENE_DATA.renderer!.setRenderTarget(previewRenderTarget)

  const rawBuffer = new Uint8Array(w * h * 4)
  LG_SCENE_DATA.renderer!.render(renderGroup, previewCamera)
  LG_SCENE_DATA.renderer!.readRenderTargetPixels(previewRenderTarget, 0, 0, w, h, rawBuffer)
  LG_SCENE_DATA.renderer!.setRenderTarget(null)

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
  LG_SCENE_DATA.scene!.add(LG_SCENE_DATA.planetGroup!, LG_SCENE_DATA.sunLight!)
  previewRenderTarget.dispose()

  // ----------------------------- Save and remove canvas -----------------------------
  const dataURL = canvas.toDataURL('image/webp')
  canvas.remove()

  LG_SCENE_DATA.lensFlare!.mesh.visible = true
  return dataURL
}

export async function exportPlanetToGLTF(
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
    const bakePlanetSurfaceTex = bakeMesh(LG_SCENE_DATA.renderer!, bakePlanet, w, h)
    if (appSettings?.bakingPixelize) bakePlanetSurfaceTex.magFilter = THREE.NearestFilter

    progressDialog.setProgress(3)
    await sleep(50)
    const bakePBR = createBakingPBRMap(LG_PLANET_DATA.value as PlanetData)
    const bakePlanetPBRTex = bakeMesh(LG_SCENE_DATA.renderer!, bakePBR, w, h)
    if (appSettings?.bakingPixelize) bakePlanetPBRTex.magFilter = THREE.NearestFilter

    progressDialog.setProgress(4)
    await sleep(50)
    const bakeHeight = createBakingHeightMap(LG_PLANET_DATA.value as PlanetData)
    const bakePlanetHeightTex = bakeMesh(LG_SCENE_DATA.renderer!, bakeHeight, w, h)

    const bakeNormal = createBakingNormalMap(bakePlanetHeightTex, w)
    const bakePlanetNormalTex = bakeMesh(LG_SCENE_DATA.renderer!, bakeNormal, w, h)
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
      const bakeCloudsTex = bakeMesh(LG_SCENE_DATA.renderer!, bakeClouds, w, h)
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
      const bakeRingTex = bakeMesh(LG_SCENE_DATA.renderer!, bakeRing, w, h)
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

// ------------------------------------------------------------------------------------------------ //
//                                            ACCESSORS                                             //
// ------------------------------------------------------------------------------------------------ //

export function isPlanetEdited() {
  return hasPlanetBeenEdited.value
}
export function setPlanetEditFlag(value: boolean) {
  hasPlanetBeenEdited.value = value
}
export function setEditorRendering(value: boolean) {
  enableEditorRendering = value
}