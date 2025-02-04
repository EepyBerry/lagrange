import type { TSLShader } from '@/core/helpers/tsl.helper';
import { LG_PLANET_DATA } from '@/core/services/planet-editor.service';
import { int, mix, positionLocal, step, uniform, vec3, vec4 } from 'three/tsl'
import type { DataTexture, MeshStandardNodeMaterial } from 'three/webgpu';
import { fbm3 } from '../functions/fbm.func';

export class TSLPlanetShader implements TSLShader {

  // Size & PBR uniforms
  private uRadius = uniform(LG_PLANET_DATA.value.planetRadius)
  private uWaterLevel = uniform(LG_PLANET_DATA.value.planetWaterLevel)
  private uMetallicRoughness = uniform(vec4(
    LG_PLANET_DATA.value.planetWaterRoughness,
    LG_PLANET_DATA.value.planetWaterMetalness,
    LG_PLANET_DATA.value.planetGroundRoughness,
    LG_PLANET_DATA.value.planetGroundMetalness,
  ))

  // Noise parameters
  private uSurfaceNoise = uniform(vec4(
    LG_PLANET_DATA.value.planetSurfaceNoise.frequency,
    LG_PLANET_DATA.value.planetSurfaceNoise.amplitude,
    LG_PLANET_DATA.value.planetSurfaceNoise.lacunarity,
    LG_PLANET_DATA.value.planetSurfaceNoise.octaves,
  ))
  private uSurfaceNoiseLayers = uniform(int(LG_PLANET_DATA.value.planetSurfaceNoise.layers))
  private uSurfaceNoiseWarp = uniform(vec3(LG_PLANET_DATA.value.planetSurfaceNoise.warpFactor))
  
  // Textures
  private uBiomesTex: DataTexture

  constructor(biomesTex: DataTexture) {
    this.uBiomesTex = biomesTex
  }

  run(mat: MeshStandardNodeMaterial): void {
    const height = fbm3(positionLocal, this.uSurfaceNoise.w, this.uSurfaceNoise.x, this.uSurfaceNoise.y, this.uSurfaceNoise.z)
    const FLAG_LAND = step(this.uWaterLevel, height)
    
    const color = vec3(0.0).toVar()
    color.addAssign(height)

    mat.colorNode = vec4(color, 1.0)
    mat.roughnessNode = mix(this.uMetallicRoughness.w, this.uMetallicRoughness.y, FLAG_LAND)
    mat.metalnessNode = mix(this.uMetallicRoughness.x, this.uMetallicRoughness.z, FLAG_LAND)
  }
}