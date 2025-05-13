import { MeshStandardNodeMaterial, UniformArrayNode, UniformNode } from "three/webgpu";
import type { UniformNodeMaterial } from "../types";
import { float, int, positionLocal, uniformArray } from "three/tsl";
import { fbm3 } from "../noise/fbm3.func";
import { LG_PLANET_DATA } from "@/core/services/planet-editor.service";

export type PlanetUniforms = {
  noise: UniformArrayNode
}
export function buildPlanetMaterial(): UniformNodeMaterial<MeshStandardNodeMaterial, PlanetUniforms> {
  const uniforms = {
    noise: uniformArray([
      float(LG_PLANET_DATA.value.planetSurfaceNoise.frequency),
      float(LG_PLANET_DATA.value.planetSurfaceNoise.amplitude),
      float(LG_PLANET_DATA.value.planetSurfaceNoise.lacunarity),
      float(LG_PLANET_DATA.value.planetSurfaceNoise.octaves)
    ], 'float')
  }
  const height = fbm3([positionLocal, uniforms.noise.element(0), uniforms.noise.element(1), uniforms.noise.element(2), uniforms.noise.element(3)])
  
  const material = new MeshStandardNodeMaterial()
  return { material, uniforms }
}
