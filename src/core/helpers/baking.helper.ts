import * as THREE from 'three'
import * as Globals from '@core/globals'
import * as ShaderLoader from '@core/three/shader.loader'
import * as ComponentHelper from '@/core/helpers/component.helper'

import { createBiomeTexture, createRampTexture } from '@core/helpers/texture.helper'
import type PlanetData from '@core/models/planet-data.model'
import { ShaderFileType } from '@core/types'
import { bufferToTexture } from '@/core/utils/render-utils'
import type { WebGPURenderer } from 'three/webgpu'
import { PlanetTSLMaterial } from '../tsl/materials/planet.tslmat'
import { convertToPlanetUniformData } from '../models/converters/planet-data.converter'

export function createBakingPlanet(data: PlanetData, surfaceTexBuf: Uint8Array, biomeTexBuf: Uint8Array): THREE.Mesh {
  const geometry = ComponentHelper.createSphereGeometryComponent(data.planetMeshQuality)
  const surfaceTex = createRampTexture(surfaceTexBuf, Globals.TEXTURE_SIZES.SURFACE, data.planetSurfaceColorRamp.steps)
  const biomeTex = createBiomeTexture(biomeTexBuf, Globals.TEXTURE_SIZES.BIOME, data.biomesParams)

  const tslMaterial = new PlanetTSLMaterial(convertToPlanetUniformData(data, surfaceTex, biomeTex))
  const mesh = new THREE.Mesh(geometry, tslMaterial.buildSurfaceBakeMaterial())
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.name = Globals.LG_NAME_PLANET
  return mesh
}

export function createBakingPBRMap(data: PlanetData): THREE.Mesh {
  const geometry = ComponentHelper.createSphereGeometryComponent(data.planetMeshQuality)
  geometry.computeTangents()

  const tslMaterial = new PlanetTSLMaterial(convertToPlanetUniformData(data))
  const mesh = new THREE.Mesh(geometry, tslMaterial.buildPBRBakeMaterial())
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.name = '_PBRMap'
  return mesh
}

export function createBakingHeightMap(data: PlanetData): THREE.Mesh {
  const geometry = ComponentHelper.createSphereGeometryComponent(data.planetMeshQuality)
  geometry.computeTangents()

  const tslMaterial = new PlanetTSLMaterial(convertToPlanetUniformData(data))
  const mesh = new THREE.Mesh(geometry, tslMaterial.buildHeightMapBakeMaterial())
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.name = '_HeightMap'
  return mesh
}

export function createBakingNormalMap(data: PlanetData, heightMapTex: THREE.Texture, resolution: THREE.Vector2): THREE.Mesh {
  const tslMaterial = new PlanetTSLMaterial(convertToPlanetUniformData(data))
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(),
    tslMaterial.buildNormalMapBakeMaterial(heightMapTex, resolution)
  )
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.name = '_NormalMap'
  return mesh
}

export function createBakingClouds(data: PlanetData, textureBuffer: Uint8Array): THREE.Mesh {
  const cloudHeight = data.cloudsHeight / Globals.ATMOSPHERE_HEIGHT_DIVIDER
  const geometry = ComponentHelper.createSphereGeometryComponent(data.planetMeshQuality, cloudHeight)
  const opacityTex = createRampTexture(textureBuffer, Globals.TEXTURE_SIZES.CLOUDS, data.cloudsColorRamp.steps)

  const material = ComponentHelper.createCustomShaderMaterialComponent(
    ShaderLoader.fetch('base.vert.glsl', ShaderFileType.BAKING),
    ShaderLoader.fetch('clouds.frag.glsl', ShaderFileType.BAKING),
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
    THREE.MeshBasicMaterial,
  )
  material.transparent = true

  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = Globals.LG_NAME_CLOUDS
  mesh.receiveShadow = true
  mesh.castShadow = true
  return mesh
}

export function createBakingRing(data: PlanetData, textureBuffer: Uint8Array, paramsIndex: number): THREE.Mesh {
  const ringParams = data.ringsParams[paramsIndex]
  const rgbaTex = createRampTexture(textureBuffer, Globals.TEXTURE_SIZES.RING, ringParams.colorRamp.steps)
  const geometry = ComponentHelper.createRingGeometryComponent(
    data.planetMeshQuality,
    ringParams.innerRadius,
    ringParams.outerRadius,
  )
  const material = ComponentHelper.createCustomShaderMaterialComponent(
    ShaderLoader.fetch('ring.vert.glsl', ShaderFileType.CORE),
    ShaderLoader.fetch('ring.frag.glsl', ShaderFileType.CORE),
    {
      u_inner_radius: { value: ringParams.innerRadius },
      u_outer_radius: { value: ringParams.outerRadius },
      u_ring_tex: { value: rgbaTex },
    },
    THREE.MeshBasicMaterial,
  )
  material.side = THREE.DoubleSide
  material.transparent = true
  material.opacity = 1

  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = ringParams.id
  mesh.receiveShadow = true
  mesh.castShadow = true
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
  renderer.setRenderTarget(null)

  return bufferToTexture(renderBuffer, width, height)
}

// NOTE: modified from three-shader-baker's code (see link)
// https://github.com/FarazzShaikh/three-shader-baker/blob/main/package/src/index.ts
// TODO: Not sure why material patching is necessary, need to investigate further (manual edits in GLSL code don't work)
/* export function patchMaterialForUnwrapping(material: THREE.Material | CustomShaderMaterial) {
  const origBeforeCompile = material.onBeforeCompile
  material.onBeforeCompile = (shader, renderer) => {
    origBeforeCompile(shader, renderer)
    if (shader.vertexShader.includes('#include <project_vertex>')) {
      shader.vertexShader = shader.vertexShader.replace(
        '#include <project_vertex>',
        `
          #include <project_vertex>
          gl_Position = vec4(uv, 0.0, 1.0) * 2.0 - 1.0;
        `,
      )
    } else {
      shader.vertexShader = shader.vertexShader.replace(
        shader.vertexShader.match(BAKE_PATCH_RGX)![0],
        'gl_Position = vec4(uv, 0.0, 1.0) * 2.0 - 1.0;',
      )
    }
  }
} */
