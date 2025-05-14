import { ref, type Ref } from 'vue'
import * as THREE from 'three'
import { degToRad } from 'three/src/math/MathUtils.js'
import * as Globals from '@core/globals'
import * as ComponentBuilder from '@core/three/component.builder'
import { type BakingTarget, type PlanetSceneData, type PlanetUniformData } from '@core/types'
import PlanetData from '@core/models/planet-data.model'
import { normalizeUInt8ArrayPixels, regeneratePRNGIfNecessary } from '@/utils/math-utils'
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
import {
  clearUniformUpdateMap,
  execUniformUpdate,
  initUniformUpdateMap,
  reloadRingDataUpdates,
} from '../helpers/uniform.helper'
import Stats from 'three/examples/jsm/libs/stats.module.js'

// Editor constants
const LG_SCENE_DATA: PlanetSceneData = {
  rings: [],
}
const LG_UNIFORM_DATA: PlanetUniformData = {}
export const LG_PLANET_DATA: Ref<PlanetData> = ref(new PlanetData())

// Buffers
export const LG_BUFFER_SURFACE: Uint8Array = new Uint8Array(Globals.TEXTURE_SIZES.SURFACE * 4)
export const LG_BUFFER_BIOME: Uint8Array = new Uint8Array(Globals.TEXTURE_SIZES.BIOME * Globals.TEXTURE_SIZES.BIOME * 4)
export const LG_BUFFER_CLOUDS: Uint8Array = new Uint8Array(
  Globals.TEXTURE_SIZES.CLOUDS * Globals.TEXTURE_SIZES.CLOUDS * 4,
)

const hasPlanetBeenEdited: Ref<boolean> = ref(false)
let enableEditorRendering = true
let watchForPlanetUpdates = false

// ------------------------------------------------------------------------------------------------ //
//                                           BOOTSTRAPPING                                          //
// ------------------------------------------------------------------------------------------------ //

export async function bootstrapEditor(canvas: HTMLCanvasElement, w: number, h: number, pixelRatio: number) {
  await sleep(50)
  enableEditorRendering = true
  const sceneRenderObjs = ComponentBuilder.createScene(LG_PLANET_DATA.value, w, h, pixelRatio)
  LG_SCENE_DATA.scene = sceneRenderObjs.scene
  LG_SCENE_DATA.renderer = sceneRenderObjs.renderer
  LG_SCENE_DATA.camera = sceneRenderObjs.camera
  LG_SCENE_DATA.clock = new THREE.Clock()
  initLighting()
  initPlanet()
  initRendering(canvas, w, h)
  initUniformUpdateMap(LG_SCENE_DATA, LG_PLANET_DATA.value)
  ComponentBuilder.createControlsComponent(LG_SCENE_DATA.camera, LG_SCENE_DATA.renderer.domElement)
}

function initLighting(): void {
  const sun = ComponentBuilder.createSun(LG_PLANET_DATA.value)
  const lensFlare = ComponentBuilder.createLensFlare(LG_PLANET_DATA.value, sun.position, sun.color)
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
  const planet = ComponentBuilder.createPlanet(LG_PLANET_DATA.value, LG_BUFFER_SURFACE, LG_BUFFER_BIOME)
  LG_UNIFORM_DATA.planet = planet.uniforms
  /*const clouds = ComponentBuilder.createClouds(LG_PLANET_DATA.value, LG_BUFFER_CLOUDS)
  const atmosphere = ComponentBuilder.createAtmosphere(LG_PLANET_DATA.value, LG_SCENE_DATA.sunLight!.position)
  const rings: GenericMeshData[] = LG_PLANET_DATA.value.ringsParams.map((_, idx) => {
    const newRingBuffer = new Uint8Array(Globals.TEXTURE_SIZES.RING * 4)
    const newRing = ComponentBuilder.createRing(LG_PLANET_DATA.value, newRingBuffer, idx)
    return {
      mesh: newRing.mesh,
      buffer: newRingBuffer,
      texture: newRing.texs[0],
    }
  })*/
  const planetGroup = new THREE.Group()
  planetGroup.add(planet.mesh)
  /*planetGroup.add(clouds.mesh)
  planetGroup.add(atmosphere)

  const ringAnchor = new THREE.Group()
  ringAnchor.name = Globals.LG_NAME_RING_ANCHOR
  rings.forEach((r) => ringAnchor.add(r.mesh))
  planetGroup.add(ringAnchor)*/

  LG_SCENE_DATA.scene!.add(planetGroup)
  LG_SCENE_DATA.planet = planet
  //LG_SCENE_DATA.clouds = clouds.mesh
  //LG_SCENE_DATA.atmosphere = atmosphere
  //LG_SCENE_DATA.rings = rings
  LG_SCENE_DATA.planetGroup = planetGroup
  //LG_SCENE_DATA.ringAnchor = ringAnchor

  // Set initial rotations
  LG_SCENE_DATA.planetGroup.setRotationFromAxisAngle(Globals.AXIS_X, degToRad(LG_PLANET_DATA.value.planetAxialTilt))
  LG_SCENE_DATA.planet.mesh.setRotationFromAxisAngle(LG_SCENE_DATA.planet.mesh.up, degToRad(LG_PLANET_DATA.value.planetRotation))
  /*LG_SCENE_DATA.clouds.setRotationFromAxisAngle(
    LG_SCENE_DATA.clouds.up,
    degToRad(LG_PLANET_DATA.value.planetRotation + LG_PLANET_DATA.value.cloudsRotation),
  )
  LG_SCENE_DATA.ringAnchor.setRotationFromAxisAngle(Globals.AXIS_X, degToRad(90))*/

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
  LG_SCENE_DATA.lensFlare!.update(
    LG_SCENE_DATA.renderer!,
    LG_SCENE_DATA.scene!,
    LG_SCENE_DATA.camera!,
    LG_SCENE_DATA.clock!,
  )
  LG_SCENE_DATA.renderer!.render(LG_SCENE_DATA.scene!, LG_SCENE_DATA.camera!)
}

export function updateCameraRendering(w: number, h: number) {
  LG_SCENE_DATA.camera!.aspect = w / h
  LG_SCENE_DATA.camera!.updateProjectionMatrix()
  LG_SCENE_DATA.renderer!.setSize(w, h)
}

export function updateRingMeshes() {
  const ringsMeshData = LG_SCENE_DATA.rings!
  const ringsParams = LG_PLANET_DATA.value.ringsParams

  // Remove old ring meshes
  ringsMeshData
    .filter((meshData) => !ringsParams.some((params) => params.id === meshData.mesh.name))
    .forEach((data) => {
      ;(data.mesh.material as THREE.Material).dispose()
      data.mesh.geometry.dispose()
      data.buffer = null
    })
  ringsMeshData.splice(0)
  LG_SCENE_DATA.ringAnchor!.clear()

  // Create new ring meshes
  ringsParams
    .filter((params) => !ringsMeshData.some((p) => p.mesh.name === params.id))
    .forEach((_, idx) => {
      const newRingBuffer = new Uint8Array(Globals.TEXTURE_SIZES.RING * 4)
      const newRing = ComponentBuilder.createRing(LG_PLANET_DATA.value, newRingBuffer, idx)
      ringsMeshData.push({
        mesh: newRing.mesh,
        buffer: newRingBuffer,
        texture: newRing.texs[0],
      })
      LG_SCENE_DATA.ringAnchor!.add(newRing.mesh)
    })
}

function updateScene() {
  if (watchForPlanetUpdates && LG_PLANET_DATA.value.changedProps.length > 0 && !hasPlanetBeenEdited.value) {
    console.debug('Planet has been edited, warning user in case of unsaved data')
    hasPlanetBeenEdited.value = true
  }
  for (const changedProp of LG_PLANET_DATA.value.changedProps.filter((ch) => !!ch.prop)) {
    /*if (changedProp.prop === '_ringsParameters') {
      updateRingMeshes()
      reloadRingDataUpdates(LG_SCENE_DATA, LG_PLANET_DATA.value)
    }*/
    execUniformUpdate(changedProp.prop)
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

  /*LG_SCENE_DATA.lensFlare!.material.dispose()
  LG_SCENE_DATA.lensFlare!.mesh.geometry.dispose()*/
  ;(LG_SCENE_DATA.planet!.mesh.material as THREE.Material).dispose()
  LG_SCENE_DATA.planet!.mesh.geometry.dispose()
  /*;(LG_SCENE_DATA.clouds!.material as THREE.Material).dispose()
  LG_SCENE_DATA.clouds!.geometry.dispose()
  ;(LG_SCENE_DATA.atmosphere!.material as THREE.Material).dispose()
  LG_SCENE_DATA.atmosphere!.geometry.dispose()
  LG_SCENE_DATA.rings!.forEach((r) => {
    ;(r.mesh.material as THREE.Material).dispose()
    r.mesh.geometry.dispose()
  })*/

  LG_BUFFER_SURFACE.fill(0)
  /*LG_BUFFER_BIOME.fill(0)
  LG_BUFFER_CLOUDS.fill(0)*/
  LG_SCENE_DATA.planet?.surfaceTexture.dispose()
  /*LG_SCENE_DATA.biomeDataTex!.dispose()
  LG_SCENE_DATA.cloudsDataTex!.dispose()
  LG_SCENE_DATA.ringAnchor!.clear()*/
  LG_SCENE_DATA.planetGroup!.clear()

  LG_SCENE_DATA.scene!.children.forEach((c) => LG_SCENE_DATA.scene!.remove(c))
  LG_SCENE_DATA.renderer!.dispose()

  clearUniformUpdateMap()
  console.debug('[unmount] ...done!')
}

// ------------------------------------------------------------------------------------------------ //
//                                          DATA FUNCTIONS                                          //
// ------------------------------------------------------------------------------------------------ //

export async function randomizePlanet() {
  await sleep(50)
  regeneratePRNGIfNecessary()
  LG_PLANET_DATA.value.randomize()
  updateRingMeshes()
  reloadRingDataUpdates(LG_SCENE_DATA, LG_PLANET_DATA.value)
}

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
  const w = 384,
    h = 384
  const previewRenderTarget = new THREE.WebGLRenderTarget(w, h, {
    colorSpace: THREE.SRGBColorSpace,
  })
  const previewCamera = ComponentBuilder.createPerspectiveCameraComponent(
    50,
    w / h,
    0.1,
    10,
    new THREE.Spherical(
      LG_PLANET_DATA.value.initCamDistance - (LG_PLANET_DATA.value.ringsEnabled ? 0.75 : 1.5),
      Math.PI / 2.0,
      degToRad(LG_PLANET_DATA.value.initCamAngle),
    ),
  )
  previewCamera.setRotationFromAxisAngle(Globals.AXIS_Y, degToRad(LG_PLANET_DATA.value.initCamAngle))
  previewCamera.updateProjectionMatrix()

  const renderScene = new THREE.Scene()
  renderScene.add(LG_SCENE_DATA.planetGroup!, LG_SCENE_DATA.sunLight!)

  // ---------------------------- Setup renderer & render -----------------------------
  const rawBuffer = new Uint8Array(w * h * 4)
  LG_SCENE_DATA.renderer!.setRenderTarget(previewRenderTarget)
  LG_SCENE_DATA.renderer!.render(renderScene, previewCamera)
  rawBuffer.set(await LG_SCENE_DATA.renderer!.readRenderTargetPixelsAsync(previewRenderTarget, 0, 0, w,h))
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

export async function exportPlanetToGLTF(progressDialog: {
  open: () => void
  setProgress: (value: number) => void
  setError: (error: unknown) => void
}) {
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
    const bakePlanet = createBakingPlanet(LG_PLANET_DATA.value, LG_BUFFER_SURFACE, LG_BUFFER_BIOME)
    const bakePlanetSurfaceTex = await bakeMesh(LG_SCENE_DATA.renderer!, bakePlanet, w, h)
    if (appSettings?.bakingPixelize) bakePlanetSurfaceTex.magFilter = THREE.NearestFilter

    progressDialog.setProgress(3)
    await sleep(50)
    const bakePBR = createBakingPBRMap(LG_PLANET_DATA.value)
    const bakePlanetPBRTex = await bakeMesh(LG_SCENE_DATA.renderer!, bakePBR, w, h)
    if (appSettings?.bakingPixelize) bakePlanetPBRTex.magFilter = THREE.NearestFilter

    progressDialog.setProgress(4)
    await sleep(50)
    const bakeHeight = createBakingHeightMap(LG_PLANET_DATA.value)
    const bakePlanetHeightTex = await bakeMesh(LG_SCENE_DATA.renderer!, bakeHeight, w, h)

    const bakeNormal = createBakingNormalMap(LG_PLANET_DATA.value, bakePlanetHeightTex, w)
    const bakePlanetNormalTex = await bakeMesh(LG_SCENE_DATA.renderer!, bakeNormal, w, h)
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
      const bakeClouds = createBakingClouds(LG_PLANET_DATA.value, LG_BUFFER_CLOUDS)
      const bakeCloudsTex = await bakeMesh(LG_SCENE_DATA.renderer!, bakeClouds, w, h)
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
    if (LG_PLANET_DATA.value.ringsEnabled) {
      progressDialog.setProgress(6)
      await sleep(50)
      const ringGroup = new THREE.Group()
      ringGroup.name = Globals.LG_NAME_RING_ANCHOR
      bakePlanet.add(ringGroup)
      LG_PLANET_DATA.value.ringsParams.forEach(async (params, idx) => {
        const ringMeshData = LG_SCENE_DATA.rings?.find((r) => r.mesh.name === params.id)
        if (!ringMeshData) return

        const bakeRing = createBakingRing(LG_PLANET_DATA.value, ringMeshData!.buffer!, idx)
        const bakeRingTex = await bakeMesh(LG_SCENE_DATA.renderer!, bakeRing, w, h)
        if (appSettings?.bakingPixelize) bakeRingTex.magFilter = THREE.NearestFilter

        bakeRing.material = new THREE.MeshStandardMaterial({
          map: bakeRingTex,
          side: THREE.DoubleSide,
          transparent: true,
        })
        bakingTargets.push({ mesh: bakeRing, textures: [bakeRingTex] })
        ringGroup.add(bakeRing)
        bakeRing.setRotationFromAxisAngle(Globals.AXIS_X, degToRad(90))
      })
      bakePlanet.add(ringGroup)
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
    await sleep(50)
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
