import * as THREE from 'three'
import * as Globals from '@core/globals'
import * as ShaderLoader from '../three/shader.loader'
import * as ComponentBuilder from '@core/three/component.builder'

import { createRampTexture, createBiomeTexture } from "../helpers/texture.helper";
import type PlanetData from "../models/planet-data.model";
import { type DataTextureWrapper, ShaderFileType } from "../types";
import { LG_BUFFER_SURFACE, LG_BUFFER_BIOME } from "./planet-editor.service";

export function createBakingPLanet(data: PlanetData): { mesh: THREE.Mesh; texs: DataTextureWrapper[] } {
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
  return { mesh, texs: [surfaceTex, biomeTex] }
}