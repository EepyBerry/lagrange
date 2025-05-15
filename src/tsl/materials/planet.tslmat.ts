import {
  DataTexture,
  MeshStandardNodeMaterial,
  TextureNode,
  UniformArrayNode,
  UniformNode,
  Vector3,
  Vector4,
} from 'three/webgpu'
import { float, mix, positionLocal, step, texture, uniform, uniformArray, vec2, vec3, vec4 } from 'three/tsl'
import { fbm3 } from '../noise/fbm3.func'
import { type TSLMaterial } from './tsl-material'
import type PlanetData from '@/core/models/planet-data.model'
import { warpDisplace, warpXYZ } from '../features/warping.tslf'

export type PlanetUniforms = {
  flags: UniformArrayNode
  pbr: UniformArrayNode
  noise: UniformNode<Vector4>
  warping: UniformNode<Vector4>
  displacement: {
    params: UniformNode<Vector3>
    noise: UniformNode<Vector4>
  }
  textures: TextureNode[]
}
export class PlanetTSLMaterial implements TSLMaterial<MeshStandardNodeMaterial, PlanetUniforms> {
  public readonly uniforms: PlanetUniforms

  constructor(data: PlanetData, textures: DataTexture[]) {
    this.uniforms = {
      flags: uniformArray(
        [
          data.planetSurfaceShowWarping,
          data.planetSurfaceShowDisplacement,
          data.planetSurfaceShowBumps,
          data.biomesEnabled,
        ],
        'bool',
      ),
      pbr: uniformArray([
        data.planetWaterLevel,
        data.planetWaterRoughness,
        data.planetWaterMetalness,
        data.planetGroundRoughness,
        data.planetGroundMetalness,
      ]),
      noise: uniform(
        new Vector4(
          data.planetSurfaceNoise.frequency,
          data.planetSurfaceNoise.amplitude,
          data.planetSurfaceNoise.lacunarity,
          data.planetSurfaceNoise.octaves,
        ),
        'vec4',
      ),
      warping: uniform(
        new Vector4(
          data.planetSurfaceNoise.layers,
          data.planetSurfaceNoise.xWarpFactor,
          data.planetSurfaceNoise.yWarpFactor,
          data.planetSurfaceNoise.zWarpFactor,
        ),
        'vec4',
      ),
      displacement: {
        params: uniform(
          new Vector3(
            data.planetSurfaceDisplacement.factor,
            data.planetSurfaceDisplacement.epsilon,
            data.planetSurfaceDisplacement.multiplier,
          ),
          'vec3',
        ),
        noise: uniform(
          new Vector4(
            data.planetSurfaceDisplacement.frequency,
            data.planetSurfaceDisplacement.amplitude,
            data.planetSurfaceDisplacement.lacunarity,
            data.planetSurfaceDisplacement.octaves,
          ),
          'vec4',
        ),
      },
      textures: [
        texture(textures[0]), // surface
      ],
    }
  }

  get(): MeshStandardNodeMaterial {
    // XYZ Warping + displacement
    let vPos = positionLocal
    //vPos = warpXYZ(vPos, this.uniforms.warping, this.uniforms.flags.element(0))
    /* vPos = warpDisplace(
        vPos,
        this.uniforms.displacement.params,
        this.uniforms.displacement.noise,
        this.uniforms.flags.element(1),
    ) */

    // Heightmap & global flags
    const height = fbm3(vPos, this.uniforms.noise).toVar()
    const FLAG_LAND = step(this.uniforms.pbr.element(0), height).toVar()
    //const FLAG_BIOMES = FLAG_LAND.mul(float(this.uniforms.flags.element(3)))

    // render noise as color
    const colour = vec3(this.uniforms.textures[0].sample(vec2(height, 0.5)).xyz).toVar()

    // init material & set outputs
    const material = new MeshStandardNodeMaterial()
    material.colorNode = vec4(colour, 1.0)
    material.roughnessNode = mix(this.uniforms.pbr.element(1), this.uniforms.pbr.element(3), FLAG_LAND)
    material.metalnessNode = mix(this.uniforms.pbr.element(2), this.uniforms.pbr.element(4), FLAG_LAND)
    return material
  }
}
