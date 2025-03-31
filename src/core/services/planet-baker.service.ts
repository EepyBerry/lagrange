import * as THREE from 'three'
import * as Globals from '@core/globals'
import * as ShaderLoader from '@core/three/shader.loader'
import * as ComponentBuilder from '@core/three/component.builder'

import { createRampTexture, createBiomeTexture } from '@core/helpers/texture.helper'
import type PlanetData from '@core/models/planet-data.model'
import { ShaderFileType } from '@core/types'
import type CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import { bufferToTexture } from '@/utils/three-utils'

const BAKE_PATCH_RGX = /gl_Position ?=.*;/gm
const BAKE_CAMERA = ComponentBuilder.createOrthgraphicCameraComponent(1, 1, 0, 1)
const BAKE_RENDER_TARGET = new THREE.WebGLRenderTarget(1, 1, { colorSpace: THREE.SRGBColorSpace })

export function createBakingPlanet(data: PlanetData, surfaceTexBuf: Uint8Array, biomeTexBuf: Uint8Array): THREE.Mesh {
  const geometry = ComponentBuilder.createSphereGeometryComponent(data.planetMeshQuality)
  geometry.computeTangents()

  const surfaceTex = createRampTexture(surfaceTexBuf, Globals.TEXTURE_SIZES.SURFACE, data.planetSurfaceColorRamp.steps)
  const biomeTex = createBiomeTexture(biomeTexBuf, Globals.TEXTURE_SIZES.BIOME, data.biomesParams)

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
      u_surface_tex: { value: surfaceTex },
      // Biomes
      u_biomes: { value: data.biomesEnabled },
      u_biomes_tex: { value: biomeTex },
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
  mesh.name = Globals.LG_NAME_PLANET
  return mesh
}

export function createBakingPBRMap(data: PlanetData): THREE.Mesh {
  const geometry = ComponentBuilder.createSphereGeometryComponent(data.planetMeshQuality)
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
  mesh.name = '_PBRMap'
  return mesh
}

export function createBakingHeightMap(data: PlanetData): THREE.Mesh {
  const geometry = ComponentBuilder.createSphereGeometryComponent(data.planetMeshQuality)
  geometry.computeTangents()

  const material = ComponentBuilder.createCustomShaderMaterialComponent(
    ShaderLoader.fetch('base.vert.glsl', ShaderFileType.BAKING),
    ShaderLoader.fetch('bump.frag.glsl', ShaderFileType.BAKING),
    {
      // Planet & Rendering
      u_radius: { value: 1.0 },
      // Surface
      u_bump: { value: data.planetSurfaceShowBumps },
      u_bump_strength: { value: data.planetSurfaceBumpStrength },
      u_bump_offset: { value: 0.005 },
      u_warp: { value: data.planetSurfaceShowWarping },
      u_displace: { value: data.planetSurfaceShowDisplacement },
      u_water_level: { value: data.planetWaterLevel },
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
  mesh.name = '_BumpMap'
  return mesh
}

export function createBakingNormalMap(data: PlanetData, bumpTex: THREE.Texture, resolution: number): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(),
    new THREE.ShaderMaterial({
      vertexShader: ShaderLoader.fetch('normal.vert.glsl', ShaderFileType.BAKING),
      fragmentShader: ShaderLoader.fetch('normal.frag.glsl', ShaderFileType.BAKING),
      uniforms: {
        u_scale: { value: 128 * data.planetSurfaceBumpStrength },
        u_resolution: { value: resolution },
        u_bump_tex: { value: bumpTex },
      },
    }),
  )
}

export function createBakingClouds(data: PlanetData, textureBuffer: Uint8Array): THREE.Mesh {
  const cloudHeight = data.cloudsHeight / Globals.ATMOSPHERE_HEIGHT_DIVIDER
  const geometry = ComponentBuilder.createSphereGeometryComponent(data.planetMeshQuality, cloudHeight)
  const opacityTex = createRampTexture(textureBuffer, Globals.TEXTURE_SIZES.CLOUDS, data.cloudsColorRamp.steps)

  const material = ComponentBuilder.createCustomShaderMaterialComponent(
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
  const geometry = ComponentBuilder.createRingGeometryComponent(
    data.planetMeshQuality,
    ringParams.innerRadius,
    ringParams.outerRadius,
  )
  const material = ComponentBuilder.createCustomShaderMaterialComponent(
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

/**
 * Asynchronously bakes a model's Material/CustomShaderMaterial into a texture
 * @remarks Uses TextureLoader
 * @param renderer renderer
 * @param mesh mesh to bake
 * @param size texture size in pixels
 * @param applyGaussDilation if true, uses a Gaussian blur pass to dilate the texture cleanly
 * @returns a promise containing the mesh's baked texture
 */
export function bakeMesh(
  renderer: THREE.WebGLRenderer,
  mesh: THREE.Mesh,
  width: number,
  height: number,
): THREE.Texture {
  BAKE_RENDER_TARGET.setSize(width, height)

  BAKE_CAMERA.left = -width / 2
  BAKE_CAMERA.right = width / 2
  BAKE_CAMERA.top = height / 2
  BAKE_CAMERA.bottom = -height / 2
  BAKE_CAMERA.updateProjectionMatrix()

  patchMaterialForUnwrapping(mesh.material as CustomShaderMaterial)
  renderer.setRenderTarget(BAKE_RENDER_TARGET)
  renderer.render(mesh, BAKE_CAMERA)

  const renderBuffer = new Uint8Array(width * height * 4)
  renderer.readRenderTargetPixels(BAKE_RENDER_TARGET, 0, 0, width, height, renderBuffer)
  renderer.setRenderTarget(null)

  return bufferToTexture(renderBuffer, width, height)
}

export function prepareMeshForExport(mesh: THREE.Mesh, material: THREE.Material) {
  mesh.material = material
}

// NOTE: modified from three-shader-baker's code (see link)
// https://github.com/FarazzShaikh/three-shader-baker/blob/main/package/src/index.ts
// TODO: Not sure why material patching is necessary, need to investigate further (manual edits in GLSL code don't work)
export function patchMaterialForUnwrapping(material: THREE.Material | CustomShaderMaterial) {
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
}
