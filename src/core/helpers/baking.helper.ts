import * as THREE from 'three'
import * as Globals from '@core/globals'
import * as ComponentHelper from '@/core/helpers/component.helper'

import { createBiomeTexture, createRampTexture } from '@core/helpers/texture.helper'
import type PlanetData from '@core/models/planet-data.model'
import { bufferToTexture } from '@/core/utils/render-utils'
import type { WebGPURenderer } from 'three/webgpu'
import { PlanetTSLMaterial } from '../tsl/materials/planet.tslmat'
import { convertToCloudsUniformData, convertToPlanetUniformData, convertToRingUniformData } from '../models/converters/planet-data.converter'
import { CloudsTSLMaterial } from '../tsl/materials/clouds.tslmat'
import { RingTSLMaterial } from '../tsl/materials/ring.tslmat'

export function createBakingPlanet(data: PlanetData, surfaceTex: THREE.DataTexture, biomeTex: THREE.DataTexture): THREE.Mesh {
  const geometry = ComponentHelper.createSphereGeometryComponent(data.planetMeshQuality)
  const tslMaterial = new PlanetTSLMaterial(convertToPlanetUniformData(data, surfaceTex, biomeTex))
  const mesh = new THREE.Mesh(geometry, tslMaterial.buildSurfaceBakeMaterial())
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.name = Globals.LG_MESH_NAME_PLANET
  return mesh
}

export function createBakingPBRMap(data: PlanetData): THREE.Mesh {
  const geometry = ComponentHelper.createSphereGeometryComponent(data.planetMeshQuality)
  geometry.computeTangents()

  const tslMaterial = new PlanetTSLMaterial(convertToPlanetUniformData(data))
  const mesh = new THREE.Mesh(geometry, tslMaterial.buildPBRBakeMaterial())
  mesh.name = Globals.LG_MESH_NAME_PBRMAP
  return mesh
}

export function createBakingHeightMap(data: PlanetData): THREE.Mesh {
  const geometry = ComponentHelper.createSphereGeometryComponent(data.planetMeshQuality)
  geometry.computeTangents()

  const tslMaterial = new PlanetTSLMaterial(convertToPlanetUniformData(data))
  const mesh = new THREE.Mesh(geometry, tslMaterial.buildHeightMapBakeMaterial())
  mesh.name = Globals.LG_MESH_NAME_HEIGHTMAP
  return mesh
}

export function createBakingNormalMap(data: PlanetData, heightMapTex: THREE.Texture, resolution: THREE.Vector2): THREE.Mesh {
  const tslMaterial = new PlanetTSLMaterial(convertToPlanetUniformData(data))
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(),
    tslMaterial.buildNormalMapBakeMaterial(heightMapTex, resolution)
  )
  mesh.name = Globals.LG_MESH_NAME_NORMALMAP
  return mesh
}

export function createBakingClouds(data: PlanetData, texture: THREE.DataTexture): THREE.Mesh {
  const cloudHeight = data.cloudsHeight / Globals.ATMOSPHERE_HEIGHT_DIVIDER
  const geometry = ComponentHelper.createSphereGeometryComponent(data.planetMeshQuality, cloudHeight)

  const tslMaterial = new CloudsTSLMaterial(convertToCloudsUniformData(data, texture))
  const mesh = new THREE.Mesh(geometry, tslMaterial.buildBakeMaterial())
  mesh.name = Globals.LG_MESH_NAME_CLOUDS
  return mesh
}

export function createBakingRing(data: PlanetData, texture: THREE.DataTexture, paramsIndex: number): THREE.Mesh {
  const ringParams = data.ringsParams[paramsIndex]
  const geometry = ComponentHelper.createRingGeometryComponent(
    data.planetMeshQuality,
    ringParams.innerRadius,
    ringParams.outerRadius,
  )
  const material = new RingTSLMaterial(convertToRingUniformData(ringParams, texture))
  const mesh = new THREE.Mesh(geometry, material.buildBakeMaterial())
  mesh.name = ringParams.id
  return mesh
}

// ------------------------------------------------------------------------------------------------
type BakingSceneObjects = {
  scene: THREE.Scene
  renderer: WebGPURenderer
  camera: THREE.OrthographicCamera
  renderTarget: THREE.RenderTarget
}
/**
 * Creates the main scene for baking purposes, as well as a base RenderTarget
 * @param pixelRatio device pixel ratio
 * @returns Scene, WebGPURenderer, OrthographicCamera and RenderTarget root objects
 */
export async function createBakingScene(pixelRatio: number): Promise<BakingSceneObjects> {
  return {
    scene: new THREE.Scene(),
    renderer: await ComponentHelper.createRenderer(1, 1, pixelRatio),
    camera: ComponentHelper.createOrthographicCamera(1, 1, 0, 1),
    renderTarget: new THREE.WebGLRenderTarget(1, 1, { colorSpace: THREE.SRGBColorSpace })
  }
}

/**
 * Asynchronously bakes a model's Material/CustomShaderMaterial into a texture
 * @remarks Uses TextureLoader
 * @param scene scene
 * @param renderer WebGPURenderer
 * @param camera orthographic camera
 * @param mesh mesh to bake
 * @param width texture width in pixels
 * @param height texture height in pixels
 * @returns a promise containing the mesh's baked texture
 */
export async function bakeMesh(
  scene: THREE.Scene,
  renderer: WebGPURenderer,
  camera: THREE.OrthographicCamera,
  renderTarget: THREE.RenderTarget,
  mesh: THREE.Mesh,
  width: number,
  height: number,
): Promise<THREE.Texture> {
  scene.add(mesh)
  renderTarget.setSize(width, height)

  camera.left = -width / 2
  camera.right = width / 2
  camera.top = height / 2
  camera.bottom = -height / 2
  camera.updateProjectionMatrix()

  renderer.setRenderTarget(renderTarget)
  await renderer.renderAsync(scene, camera)
  renderer.setRenderTarget(null)
  scene.remove(mesh)

  const renderBuffer = await renderer.readRenderTargetPixelsAsync(renderTarget, 0, 0, width, height)
  return bufferToTexture(renderBuffer, width, height)
}
