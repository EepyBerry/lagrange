import * as THREE from 'three'
import * as Globals from '@core/globals'
import * as ShaderLoader from '../three/shader.loader'
import * as ComponentBuilder from '@core/three/component.builder'

import { createRampTexture, createBiomeTexture } from "../helpers/texture.helper";
import type PlanetData from "../models/planet-data.model";
import { ShaderFileType, type BakingResult } from "../types";
import { LG_BUFFER_SURFACE, LG_BUFFER_BIOME, LG_BUFFER_RING, LG_BUFFER_CLOUDS } from "./planet-editor.service";
import { getTextureAsDataUrl, ShaderBaker } from 'three-shader-baker';
import { clamp } from 'three/src/math/MathUtils.js';

const SHADER_BAKER = new ShaderBaker()

export function createBakingPlanet(data: PlanetData): THREE.Mesh {
  const geometry = ComponentBuilder.createSphereGeometryComponent()
  geometry.computeTangents()

  const surfaceTex = createRampTexture(LG_BUFFER_SURFACE, Globals.TEXTURE_SIZES.SURFACE, data.planetSurfaceColorRamp.steps)
  const biomeTex = createBiomeTexture(LG_BUFFER_BIOME, Globals.TEXTURE_SIZES.BIOME, data.biomesParams)

  const material = ComponentBuilder.createCustomShaderMaterialComponent(
    ShaderLoader.fetch('base.vert.glsl', ShaderFileType.BAKING),
    ShaderLoader.fetch('planet.frag.glsl', ShaderFileType.BAKING),
    {
      // Planet & Rendering
      u_radius: { value: 1.0 },
      u_pbr_params: {
        value: {
          wlevel: data.planetWaterLevel,
        },
      },
      // Surface
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
    THREE.MeshBasicMaterial,
  )

  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = Globals.LG_NAME_PLANET + '_unlit'
  return mesh
}

export function createBakingPBRMap(data: PlanetData): THREE.Mesh {
  const geometry = ComponentBuilder.createSphereGeometryComponent()
  geometry.computeTangents()

  const material = ComponentBuilder.createCustomShaderMaterialComponent(
    ShaderLoader.fetch('base.vert.glsl', ShaderFileType.BAKING),
    ShaderLoader.fetch('pbr.frag.glsl', ShaderFileType.BAKING),
    {
      // Planet & Rendering
      u_pbr_params: {
        value: {
          wlevel: data.planetWaterLevel,
          wrough: data.planetWaterRoughness,
          wmetal: data.planetWaterMetalness,
          grough: data.planetGroundRoughness,
          gmetal: data.planetGroundMetalness,
        },
      },
      // Surface
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
    },
    THREE.MeshBasicMaterial,
  )

  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = Globals.LG_NAME_PLANET + '_unlit'
  return mesh
}

export function createBakingClouds(data: PlanetData): THREE.Mesh {
  const cloudHeight = data.cloudsHeight / Globals.ATMOSPHERE_HEIGHT_DIVIDER
  const geometry = ComponentBuilder.createSphereGeometryComponent(cloudHeight)
  const opacityTex = createRampTexture(LG_BUFFER_CLOUDS, Globals.TEXTURE_SIZES.CLOUDS, data.cloudsColorRamp.steps)

  const material = ComponentBuilder.createCustomShaderMaterialComponent(
    ShaderLoader.fetch('base.vert.glsl', ShaderFileType.BAKING),
    ShaderLoader.fetch('clouds.frag.glsl', ShaderFileType.BAKING),
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
    THREE.MeshBasicMaterial,
  )
  material.transparent = true

  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = Globals.LG_NAME_CLOUDS
  mesh.receiveShadow = true
  mesh.castShadow = true
  return mesh
}

export function createBakingRing(data: PlanetData): THREE.Mesh {
  const rgbaTex = createRampTexture(LG_BUFFER_RING, Globals.TEXTURE_SIZES.RING, data.ringColorRamp.steps)
  const geometry = ComponentBuilder.createRingGeometryComponent(data.ringInnerRadius, data.ringOuterRadius)
  const material = ComponentBuilder.createCustomShaderMaterialComponent(
    ShaderLoader.fetch('ring.vert.glsl', ShaderFileType.CORE),
    ShaderLoader.fetch('ring.frag.glsl', ShaderFileType.CORE),
    {
      u_inner_radius: { value: data.ringInnerRadius },
      u_outer_radius: { value: data.ringOuterRadius },
      u_ring_tex: { value: rgbaTex.texture },
    },
    THREE.MeshBasicMaterial,
  )
  material.side = THREE.DoubleSide
  material.transparent = true

  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = Globals.LG_NAME_RING
  mesh.receiveShadow = true
  mesh.castShadow = true
  return mesh
}

// ------------------------------------------------------------------------------------------------

/**
 * Asynchronously bakes a model's Material/ShaderMaterial/CustomShaderMaterial into a texture
 * @remarks Uses three-shader-baker + TextureLoader
 * @param renderer renderer
 * @param mesh mesh to bake
 * @param size texture size in pixels
 * @returns a promise containing the mesh's baked texture
 */
export async function bakeTexture(
  renderer: THREE.WebGLRenderer,
  mesh: THREE.Mesh,
  size: number
): Promise<THREE.Texture> {
  const bakedRenderTarget: THREE.WebGLRenderTarget<THREE.Texture> = SHADER_BAKER.bake(renderer, mesh, { size, dilation: 0.1 })
  const dataUri = getTextureAsDataUrl(renderer, bakedRenderTarget.texture)
  const tex = await new THREE.TextureLoader().loadAsync(dataUri)
  tex.flipY = false
  return tex
}

/**
 * Uses the alphaMap's green channel to write a new texture with the given baseColor
 * @remarks This is a workaround to three-shader-baker failing when trying to bake an alpha-based texture
 * @param baseColor base texture color
 * @param alphaMap previously baked alphaMap
 * @returns a new texture with combined parameter data
 */
export async function writeTextureAlpha(texture: THREE.Texture, baseColor: THREE.Color, size: number): Promise<THREE.Texture> {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(texture.image, 0, 0, size, size)
  const texData = ctx.getImageData(0, 0, size, size, { colorSpace: "srgb" })
  
  let pixelStride = 0, brightness = 0
  const pixelCoords: THREE.Vector2 = new THREE.Vector2(0,0)
  for (let i = 0; i < texData.data.length; i++) {
    brightness = Number(texData.data[pixelStride + 1])
    texData.data[pixelStride + 0] = clamp(baseColor.r * 255.0, 0, 255)
    texData.data[pixelStride + 1] = clamp(baseColor.g * 255.0, 0, 255)
    texData.data[pixelStride + 2] = clamp(baseColor.b * 255.0, 0, 255)
    texData.data[pixelStride + 3] = brightness
    pixelStride += 4

    pixelCoords.x++
    if (pixelCoords.x === size - 1) {
      pixelCoords.x = 0
      pixelCoords.y++
    }
  }
  ctx.putImageData(texData, 0, 0)
  const tex = await new THREE.TextureLoader().loadAsync(canvas.toDataURL())
  tex.flipY = false
  return tex
}