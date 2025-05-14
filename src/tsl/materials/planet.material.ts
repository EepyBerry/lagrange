import { MeshStandardNodeMaterial, UniformArrayNode } from "three/webgpu";
import type { UniformNodeMaterial } from "../types";
import { mix, positionLocal, step, texture, uniformArray, vec2, vec3, vec4 } from "three/tsl";
import { fbm3 } from "../noise/fbm3.func";
import { LG_BUFFER_SURFACE, LG_PLANET_DATA } from "@/core/services/planet-editor.service";
import * as Globals from '@core/globals'
import { createRampTexture } from "@/core/helpers/texture.helper";

export type PlanetUniforms = {
  noise: UniformArrayNode
}
export function buildPlanetMaterial(): UniformNodeMaterial<MeshStandardNodeMaterial, PlanetUniforms> {
  // Uniform declaration
  const uniforms = {
    pbr: uniformArray([
      LG_PLANET_DATA.value.planetWaterLevel,
      LG_PLANET_DATA.value.planetWaterRoughness,
      LG_PLANET_DATA.value.planetWaterMetalness,
      LG_PLANET_DATA.value.planetGroundRoughness,
      LG_PLANET_DATA.value.planetGroundMetalness,
    ], 'float'),
    noise: uniformArray([
      LG_PLANET_DATA.value.planetSurfaceNoise.frequency,
      LG_PLANET_DATA.value.planetSurfaceNoise.amplitude,
      LG_PLANET_DATA.value.planetSurfaceNoise.lacunarity,
      LG_PLANET_DATA.value.planetSurfaceNoise.octaves
    ], 'float'),
    textures: [
      texture(createRampTexture(LG_BUFFER_SURFACE, Globals.TEXTURE_SIZES.SURFACE, LG_PLANET_DATA.value.planetSurfaceColorRamp.steps))
    ]
  };

  // Heightmap & global flags
  const height = fbm3(positionLocal, uniforms.noise.element(0), uniforms.noise.element(1), uniforms.noise.element(2), uniforms.noise.element(3)).toVar()
  const FLAG_LAND = step(uniforms.pbr.element(0), height).toVar();

  // render noise as color
  const colour = vec3(uniforms.textures[0].sample(vec2(height, 0.5)).xyz).toVar();

  // init material & set outputs
  const material = new MeshStandardNodeMaterial()
  material.colorNode = vec4(colour, 1.0)
  material.roughnessNode = mix(uniforms.pbr.element(1), uniforms.pbr.element(3), FLAG_LAND);
  material.metalnessNode = mix(uniforms.pbr.element(2), uniforms.pbr.element(4), FLAG_LAND);
  return { material, uniforms }
}
