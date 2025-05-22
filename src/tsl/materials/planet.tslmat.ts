import {
  DataTexture,
  MeshStandardNodeMaterial,
  TextureNode,
  UniformArrayNode,
  Vector3,
  Vector4,
} from 'three/webgpu'
import {
  bitangentLocal,
  EPSILON,
  float,
  min,
  mix,
  normalLocal,
  positionLocal,
  step,
  tangentLocal,
  texture,
  transformNormalToView,
  uniform,
  uniformArray,
  vec2,
  vec3,
  vec4,
} from 'three/tsl'
import { type TSLMaterial } from './tsl-material'
import type PlanetData from '@/core/models/planet-data.model'
import { displace, layer, warp } from '../features/lwd.tslf'
import type { UniformNumberNode, UniformVector3Node, UniformVector4Node } from '../types'
import { applyBump } from '../features/bump.tslf'
import { computeHumidity, computeTemperature, sampleBiomeTexture } from '../features/biomes.tslf'

export type PlanetUniforms = {
  radius: UniformNumberNode
  bumpStrength: UniformNumberNode
  flags: UniformArrayNode

  pbr: UniformArrayNode
  noise: UniformVector4Node
  warping: UniformVector4Node
  displacement: {
    params: UniformVector3Node
    noise: UniformVector4Node
  }
  biomes: {
    temperatureMode: UniformNumberNode
    temperatureNoise: UniformVector4Node
    humidityMode: UniformNumberNode
    humidityNoise: UniformVector4Node
  }
  textures: TextureNode[]
}
export class PlanetTSLMaterial implements TSLMaterial<MeshStandardNodeMaterial, PlanetUniforms> {
  public readonly uniforms: PlanetUniforms

  constructor(data: PlanetData, textures: DataTexture[]) {
    // Register uniforms
    this.uniforms = {
      radius: uniform(data.planetRadius, 'float'),
      bumpStrength: uniform(data.planetSurfaceBumpStrength, 'float'),
      flags: uniformArray(
        [
          +data.planetSurfaceShowWarping,
          +data.planetSurfaceShowDisplacement,
          +data.planetSurfaceShowBumps,
          +data.biomesEnabled,
        ],
        'int',
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
      biomes: {
        temperatureMode: uniform(data.biomesTemperatureMode),
        temperatureNoise: uniform(
          new Vector4(
            data.biomesTemperatureNoise.frequency,
            data.biomesTemperatureNoise.amplitude,
            data.biomesTemperatureNoise.lacunarity,
            data.biomesTemperatureNoise.octaves,
          ),
          'vec4',
        ),
        humidityMode: uniform(data.biomesHumidityMode),
        humidityNoise: uniform(
          new Vector4(
            data.biomesHumidityNoise.frequency,
            data.biomesHumidityNoise.amplitude,
            data.biomesHumidityNoise.lacunarity,
            data.biomesHumidityNoise.octaves,
          ),
          'vec4',
        ),
      },
      textures: [
        texture(textures[0]), // surface
        texture(textures[1]), // biomes
      ],
    }
  }

  build(): MeshStandardNodeMaterial {
    // XYZ Warping + displacement
    let vPos = positionLocal
    vPos = warp(vPos, this.uniforms.warping, this.uniforms.flags.element(0))
    vPos = displace(
      vPos,
      this.uniforms.displacement.params,
      this.uniforms.displacement.noise,
      this.uniforms.flags.element(1),
    )

    // Heightmap & global flags
    const heightLimit = float(1.0).sub(EPSILON)
    const height = layer(vPos, this.uniforms.noise, this.uniforms.warping.x).toVar()
    const FLAG_LAND = step(this.uniforms.pbr.element(0), height).toVar()
    const FLAG_BIOMES = FLAG_LAND.mul(float(this.uniforms.flags.element(3)))

    // render noise as color
    let colour = vec3(this.uniforms.textures[0].sample(vec2(min(height, heightLimit), 0.5)).xyz)

    // Render biomes
    const tHeight = float(
      mix(
        0.0,
        computeTemperature(vPos, this.uniforms.biomes.temperatureNoise, this.uniforms.biomes.temperatureMode),
        FLAG_BIOMES,
      ),
    )
      .min(heightLimit)
      .toVar()
    const hHeight = float(
      mix(
        0.0,
        computeHumidity(vPos, this.uniforms.biomes.humidityNoise, this.uniforms.biomes.humidityMode),
        FLAG_BIOMES,
      ),
    )
      .min(heightLimit)
      .toVar()
    colour = mix(colour, sampleBiomeTexture(this.uniforms.textures[1], tHeight, hHeight, colour), FLAG_BIOMES)

    // Render bump-map (under MIT license)
    // note: see license in bump.func.glsl
    const dx = vec3(tangentLocal.mul(this.uniforms.warping.yzw).mul(0.005)).toVar()
    const dy = vec3(bitangentLocal.mul(this.uniforms.warping.yzw).mul(0.005)).toVar()
    const dxHeight = float(layer(vPos.add(dx), this.uniforms.noise, this.uniforms.warping.x)).toVar()
    const dyHeight = float(layer(vPos.add(dy), this.uniforms.noise, this.uniforms.warping.x)).toVar()
    const bump = vec3(
      applyBump(vPos, dx, dy, height, dxHeight, dyHeight, this.uniforms.radius, this.uniforms.bumpStrength),
    ).toVar()

    // init material & set outputs
    const material = new MeshStandardNodeMaterial()
    material.colorNode = vec4(colour, 1.0)
    material.normalNode = transformNormalToView(mix(normalLocal, bump, FLAG_LAND.mul(this.uniforms.flags.element(2))))
    material.roughnessNode = mix(this.uniforms.pbr.element(1), this.uniforms.pbr.element(3), FLAG_LAND)
    material.metalnessNode = mix(this.uniforms.pbr.element(2), this.uniforms.pbr.element(4), FLAG_LAND)
    return material
  }
}
