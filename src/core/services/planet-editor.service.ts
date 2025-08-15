import { ref, type Ref } from 'vue'
import * as THREE from 'three'
import { degToRad } from 'three/src/math/MathUtils.js'
import * as Globals from '@core/globals'
import * as ComponentHelper from '@/core/helpers/component.helper'
import { type BakingTarget, type EditorSceneData } from '@core/types'
import PlanetData from '@core/models/planet-data.model'
import { regeneratePRNGIfNecessary } from '@/core/utils/math-utils'
import {
  bakeMesh,
  createBakingHeightMap,
  createBakingClouds,
  createBakingNormalMap,
  createBakingPBRMap,
  createBakingPlanet,
  createBakingRing,
} from '../helpers/baking.helper'
import { exportMeshesToGLTF, exportPlanetScreenshot } from '../helpers/export.helper'
import { idb } from '@/dexie.config'
import { sleep } from '@/core/utils/utils'
import * as UniformHelper from '../helpers/uniform.helper'
import * as SceneHelper from '../helpers/scene.helper'
import * as PreviewHelper from '../helpers/preview.helper'

// Editor constants
let LG_SCENE_DATA!: EditorSceneData
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
  LG_SCENE_DATA = SceneHelper.buildEditorScene(LG_PLANET_DATA.value, w, h, pixelRatio)
  UniformHelper.initUniformUpdateMap(LG_SCENE_DATA, LG_PLANET_DATA.value)
  ComponentHelper.createOrbitControls(LG_SCENE_DATA.camera, LG_SCENE_DATA.renderer.domElement)

  // Configure renderer
  LG_SCENE_DATA.renderer!.setSize(w, h)
  LG_SCENE_DATA.renderer!.setAnimationLoop(() => renderFrame())
  LG_SCENE_DATA.renderer!.domElement.ariaLabel = '3D planet viewer'
  canvas.appendChild(LG_SCENE_DATA.renderer!.domElement)

  // TODO: Remove debug printing when done
  /* LG_SCENE_DATA.renderer!.debug.getShaderAsync(
    LG_SCENE_DATA.scene!,
    LG_SCENE_DATA.camera!,
    LG_SCENE_DATA.lensFlare!.mesh,
  ).then((e) => {
    console.log(e.fragmentShader)
  }) */
}

// ------------------------------------------------------------------------------------------------ //
//                                          SCENE RENDERING                                         //
// ------------------------------------------------------------------------------------------------ //

function renderFrame() {
  if (!enableEditorRendering) {
    return
  }
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

// ------------------------------------------------------------------------------------------------ //
//                                         SCENE MANAGEMENT                                         //
// ------------------------------------------------------------------------------------------------ //

export function updateRingMeshes() {
  const ringsMeshData = LG_SCENE_DATA.rings!
  const ringsParams = LG_PLANET_DATA.value.ringsParams

  // Remove old ring meshes
  ringsMeshData
    .filter((meshData) => !ringsParams.some((params) => params.id === meshData.mesh!.name))
    .forEach((data) => {
      ;(data.mesh!.material as THREE.Material).dispose()
      data.mesh!.geometry.dispose()
      data.buffer = null
    })
  ringsMeshData.splice(0)
  LG_SCENE_DATA.ringAnchor!.clear()

  // Create new ring meshes
  ringsParams
    .filter((params) => !ringsMeshData.some((p) => p.mesh!.name === params.id))
    .forEach((_, idx) => {
      const newRing = ComponentHelper.createRing(LG_PLANET_DATA.value, idx)
      ringsMeshData.push(newRing)
      LG_SCENE_DATA.ringAnchor!.add(newRing.mesh!)
    })
}

function updateScene() {
  if (watchForPlanetUpdates && LG_PLANET_DATA.value.changedProps.length > 0 && !hasPlanetBeenEdited.value) {
    console.debug('<Lagrange> Planet has been edited, warning user in case of unsaved data')
    hasPlanetBeenEdited.value = true
  }
  for (const changedProp of LG_PLANET_DATA.value.changedProps.filter((ch) => !!ch.prop)) {
    if (changedProp.prop === '_ringsParameters') {
      updateRingMeshes()
      UniformHelper.reloadRingDataUpdates(LG_SCENE_DATA, LG_PLANET_DATA.value)
    }
    UniformHelper.execUniformUpdate(changedProp.prop.split('|')[0])
  }
  LG_PLANET_DATA.value.clearChangedProps()
}

/**
 * Removes every object from the scene, then removes the scene itself
 */
export function disposeScene() {
  watchForPlanetUpdates = false
  console.debug('<Lagrange> Clearing scene... ')
  
  SceneHelper.disposeEditorScene(LG_SCENE_DATA)
  LG_BUFFER_BIOME.fill(0)
  LG_BUFFER_CLOUDS.fill(0)

  UniformHelper.clearUniformUpdateMap()
  console.debug('<Lagrange> ...done!')
}

// ------------------------------------------------------------------------------------------------ //
//                                          DATA FUNCTIONS                                          //
// ------------------------------------------------------------------------------------------------ //

export async function randomizePlanet() {
  await sleep(50)
  regeneratePRNGIfNecessary()
  LG_PLANET_DATA.value.randomize()
  updateRingMeshes()
  UniformHelper.reloadRingDataUpdates(LG_SCENE_DATA, LG_PLANET_DATA.value)
}

export async function resetPlanet() {
  LG_PLANET_DATA.value.reset()
}

export function takePlanetScreenshot() {
  exportPlanetScreenshot(LG_SCENE_DATA.renderer!, LG_SCENE_DATA.scene!, LG_SCENE_DATA.camera!, LG_PLANET_DATA.value.planetName)
}

export async function exportPlanetPreview(): Promise<string> {
  await sleep(50)
  LG_SCENE_DATA.lensFlare!.mesh.visible = false
  const dataURL = await PreviewHelper.generatePlanetPreview(LG_PLANET_DATA.value)
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
        const ringMeshData = LG_SCENE_DATA.rings?.find((r) => r.mesh!.name === params.id)
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
