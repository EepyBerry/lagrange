import * as THREE from 'three'
import * as Globals from '@core/globals'
import * as ComponentHelper from '@/core/helpers/component.helper'

import type PlanetData from '@core/models/planet-data.model'
import { renderToCanvas } from '@/core/utils/render-utils'
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

export function createBakingNormalMap(data: PlanetData, heightMapTex: THREE.Texture): THREE.Mesh {
  const tslMaterial = new PlanetTSLMaterial(convertToPlanetUniformData(data))
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(),
    tslMaterial.buildNormalMapBakeMaterial(heightMapTex)
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
type BakingObjects = {
  renderer: WebGPURenderer
  camera: THREE.OrthographicCamera
  renderTarget: THREE.RenderTarget
}
/**
 * Creates the main baking objects, as well as a base RenderTarget
 * @param pixelRatio device pixel ratio
 * @returns Scene, WebGPURenderer, OrthographicCamera and RenderTarget root objects
 */
export async function createBakingObjects(width: number, height: number, pixelRatio: number): Promise<BakingObjects> {
  return {
    renderer: await ComponentHelper.createRenderer(width, height, pixelRatio),
    camera: ComponentHelper.createOrthographicCamera(width, height, 0, 1),
    renderTarget: new THREE.RenderTarget(width, height, { colorSpace: THREE.SRGBColorSpace })
  }
}

/**
 * Asynchronously bakes a model's Material/CustomShaderMaterial into a texture
 * @remarks Uses TextureLoader
 * @param renderer WebGPURenderer
 * @param camera orthographic camera
 * @param renderTarget common RenderTarget
 * @param mesh mesh to bake
 * @returns a promise containing the mesh's baked texture
 */
export async function bakeMesh(
  renderer: WebGPURenderer,
  camera: THREE.OrthographicCamera,
  renderTarget: THREE.RenderTarget,
  mesh: THREE.Mesh,
): Promise<THREE.CanvasTexture> {
  const size = new THREE.Vector2()
  renderer.getSize(size)

  const rawBuffer = new Uint8Array(size.x * size.y * 4)
  renderer.setRenderTarget(renderTarget)
  await renderer.renderAsync(mesh, camera)
  rawBuffer.set(await renderer.readRenderTargetPixelsAsync(renderTarget, 0, 0, size.x, size.y))
  renderer.setRenderTarget(null)

  return new THREE.CanvasTexture(renderToCanvas(renderer, rawBuffer, size.x, size.y))
}
