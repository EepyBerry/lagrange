import type { NodeMaterial } from "three/webgpu";
import type PlanetData from "../models/planet-data.model";
import { EditorSceneCreationMode, type EditorSceneData, type RingMeshData } from "../types";
import * as ComponentHelper from './component.helper';
import * as Globals from '@/core/globals'
import { Group, Clock } from 'three';
import { degToRad } from "three/src/math/MathUtils.js";

export async function buildEditorScene(data: PlanetData, renderWidth: number, renderHeight: number, renderPixelRatio: number, creationMode: EditorSceneCreationMode): Promise<EditorSceneData> {
  const sceneData: Partial<EditorSceneData> = {
    planet: {
      surfaceBuffer: new Uint8Array(Globals.TEXTURE_SIZES.SURFACE * 4),
      biomesBuffer: new Uint8Array(Globals.TEXTURE_SIZES.BIOME * Globals.TEXTURE_SIZES.BIOME * 4),
    },
    clouds: {
      buffer: new Uint8Array(Globals.TEXTURE_SIZES.CLOUDS * 4),
    },
    rings: [],
    planetGroup: new Group(),
    ringAnchor: new Group(),
  }
  await buildScene(sceneData as EditorSceneData, data, renderWidth, renderHeight, renderPixelRatio, creationMode)
  buildSceneLighting(sceneData as EditorSceneData, data)
  buildScenePlanet(sceneData as EditorSceneData, data)
  return sceneData as EditorSceneData
}

export function disposeEditorScene(sceneData: EditorSceneData) {
  sceneData.sunLight.dispose()
  sceneData.ambLight.dispose()
  sceneData.scene.remove(sceneData.sunLight!)
  sceneData.scene.remove(sceneData.ambLight!)

  ;(sceneData.lensFlare!.mesh!.material as NodeMaterial).dispose()
  sceneData.lensFlare!.mesh!.geometry.dispose()
  ;(sceneData.planet.mesh!.material as NodeMaterial).dispose()
  sceneData.planet.mesh!.geometry.dispose()
  ;(sceneData.atmosphere!.mesh!.material as NodeMaterial).dispose()
  sceneData.atmosphere!.mesh!.geometry.dispose()
  ;(sceneData.clouds.mesh!.material as NodeMaterial).dispose()
  sceneData.clouds.mesh!.geometry.dispose()
  sceneData.rings.forEach((r) => {
    ;(r.mesh!.material as NodeMaterial).dispose()
    r.mesh!.geometry.dispose()
  })

  sceneData.planet.surfaceBuffer?.fill(0)
  sceneData.planet.surfaceTexture!.dispose()
  sceneData.planet.biomesBuffer?.fill(0)
  sceneData.planet.biomesTexture!.dispose()
  sceneData.clouds.texture!.dispose()
  sceneData.ringAnchor.clear()
  sceneData.planetGroup.clear()

  sceneData.scene.children.forEach((c) => sceneData.scene.remove(c))
  sceneData.renderer.dispose()
}

// ------------------------------------------------------------------------------------------------

async function buildScene(sceneData: EditorSceneData, data: PlanetData, renderWidth: number, renderHeight: number, renderPixelRatio: number, creationMode: EditorSceneCreationMode): Promise<void> {
  const { scene, renderer, camera } = await ComponentHelper.createScene(data, renderWidth, renderHeight, renderPixelRatio, creationMode)
  sceneData.scene = scene
  sceneData.renderer = renderer
  sceneData.camera = camera
  sceneData.clock = new Clock()
}

function buildSceneLighting(sceneData: EditorSceneData, data: PlanetData): void {
  const sun = ComponentHelper.createSun(data)
  sceneData.scene!.add(sun)
  sceneData.sunLight = sun

  const ambientLight = ComponentHelper.createAmbientLight(
    data.ambLightColor,
    data.ambLightIntensity,
  )
  ambientLight.name = Globals.LG_NAME_AMBLIGHT
  sceneData.scene!.add(ambientLight)
  sceneData.ambLight = ambientLight

  const lensFlare = ComponentHelper.createLensFlare(data, sun.position, sun.color)
  sun.add(lensFlare.mesh)
  sceneData.lensFlare = lensFlare

  // Set initial rotations
  const dataSunlightAngle = degToRad(isNaN(data.sunLightAngle) ? -15 : data.sunLightAngle)
  const pos = Globals.SUN_INIT_POS.clone().applyAxisAngle(Globals.AXIS_X, dataSunlightAngle)
  sceneData.sunLight.position.set(pos.x, pos.y, pos.z)
  sceneData.lensFlare.updatePosition(sceneData.sunLight.position)
}

function buildScenePlanet(sceneData: EditorSceneData, data: PlanetData): void {
  const planet = ComponentHelper.createPlanet(data, sceneData.planet.surfaceBuffer, sceneData.planet.biomesBuffer)
  const clouds = ComponentHelper.createClouds(data, sceneData.clouds.buffer)
  const atmosphere = ComponentHelper.createAtmosphere(data, sceneData.sunLight!.position)
  const rings: RingMeshData[] = data.ringsParams.map((_, idx) => ComponentHelper.createRing(data, idx))

  // Toggle elements
  clouds.mesh!.visible = data.cloudsEnabled
  atmosphere.mesh!.visible = data.atmosphereEnabled
  rings.forEach(r => r.mesh!.visible = data.ringsEnabled)

  // Add to scene
  sceneData.planetGroup.add(planet.mesh!)
  sceneData.planetGroup.add(clouds.mesh!)
  sceneData.planetGroup.add(atmosphere.mesh!)

  sceneData.ringAnchor.name = Globals.LG_NAME_RING_ANCHOR
  rings.forEach((r) => sceneData.ringAnchor.add(r.mesh!))
  sceneData.planetGroup.add(sceneData.ringAnchor)

  sceneData.scene!.add(sceneData.planetGroup)
  sceneData.planet = planet
  sceneData.clouds = clouds
  sceneData.atmosphere = atmosphere
  sceneData.rings.push(...rings)

  // Set initial rotations
  sceneData.planetGroup.setRotationFromAxisAngle(Globals.AXIS_X, degToRad(data.planetAxialTilt))
  sceneData.planet.mesh!.setRotationFromAxisAngle(
    sceneData.planet.mesh!.up,
    degToRad(data.planetRotation),
  )
  sceneData.clouds.mesh!.setRotationFromAxisAngle(
    sceneData.clouds.mesh!.up,
    degToRad(data.planetRotation + data.cloudsRotation),
  )
  sceneData.ringAnchor.setRotationFromAxisAngle(Globals.AXIS_X, degToRad(90))

  // Set lighting target
  sceneData.sunLight!.target = sceneData.planetGroup

  // Set scale
  sceneData.planetGroup.scale.setScalar(data.planetRadius)
}