import {
  DataTexture,
  MeshBasicNodeMaterial,
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
  int,
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
import { displace, layer, warp } from '../features/lwd'
import type { DisplacementData, NoiseData, UniformNumberNode, UniformVector3Node, UniformVector4Node, WarpingData } from '../types'
import { applyBump } from '../features/bump'
import { computeHumidity, computeTemperature, sampleBiomeTexture } from '../features/biomes'

export type PlanetData = {
  radius: number
  bumpStrength: number
  flags: {
    showWarping: boolean
    showDisplacement: boolean
    showBumps: boolean
    enableBiomes: boolean
  }
  pbr: {
    waterLevel: number
    waterRoughness: number
    waterMetalness: number
    groundRoughness: number
    groundMetalness: number
  }
  noise: NoiseData
  warping: WarpingData
  displacement: {
    params: DisplacementData
    noise: NoiseData
  }
  biomes: {
    temperatureMode: number
    temperatureNoise: NoiseData
    humidityMode: number
    humidityNoise: NoiseData
  }
  textures: {
    surface: DataTexture
    biomes: DataTexture
  }
}
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
export class PlanetTSLMaterial implements TSLMaterial<MeshStandardNodeMaterial, PlanetData, PlanetUniforms> {
  public readonly uniforms: PlanetUniforms

  constructor(data: PlanetData) {
    this.uniforms = {
      radius: uniform(data.radius, 'float'),
      bumpStrength: uniform(data.bumpStrength, 'float'),
      flags: uniformArray(
        [
          +data.flags.showWarping,
          +data.flags.showDisplacement,
          +data.flags.showBumps,
          +data.flags.enableBiomes,
        ],
        'int',
      ),
      pbr: uniformArray([
        data.pbr.waterLevel,
        data.pbr.waterRoughness,
        data.pbr.waterMetalness,
        data.pbr.groundRoughness,
        data.pbr.groundMetalness,
      ]),
      noise: uniform(
        new Vector4(
          data.noise.frequency,
          data.noise.amplitude,
          data.noise.lacunarity,
          data.noise.octaves,
        ),
        'vec4',
      ),
      warping: uniform(
        new Vector4(
          data.warping.layers,
          data.warping.warpFactor.x,
          data.warping.warpFactor.y,
          data.warping.warpFactor.z,
        ),
        'vec4',
      ),
      displacement: {
        params: uniform(
          new Vector3(
            data.displacement.params.factor,
            data.displacement.params.epsilon,
            data.displacement.params.multiplier,
          ),
          'vec3',
        ),
        noise: uniform(
          new Vector4(
            data.displacement.noise.frequency,
            data.displacement.noise.amplitude,
            data.displacement.noise.lacunarity,
            data.displacement.noise.octaves,
          ),
          'vec4',
        ),
      },
      biomes: {
        temperatureMode: uniform(data.biomes.temperatureMode),
        temperatureNoise: uniform(
          new Vector4(
            data.biomes.temperatureNoise.frequency,
            data.biomes.temperatureNoise.amplitude,
            data.biomes.temperatureNoise.lacunarity,
            data.biomes.temperatureNoise.octaves,
          ),
          'vec4',
        ),
        humidityMode: uniform(data.biomes.humidityMode),
        humidityNoise: uniform(
          new Vector4(
            data.biomes.humidityNoise.frequency,
            data.biomes.humidityNoise.amplitude,
            data.biomes.humidityNoise.lacunarity,
            data.biomes.humidityNoise.octaves,
          ),
          'vec4',
        ),
      },
      textures: [
        texture(data.textures.surface),
        texture(data.textures.biomes),
      ],
    }
  }

  buildMaterial(): MeshStandardNodeMaterial {
    // XYZ Warping + displacement
    let vPos = positionLocal
    vPos = warp(vPos, this.uniforms.warping, this.uniforms.flags.element(int(0)))
    vPos = displace(
      vPos,
      this.uniforms.displacement.params,
      this.uniforms.displacement.noise,
      this.uniforms.flags.element(int(1)),
    )

    // Heightmap & global flags
    const heightLimit = float(1.0).sub(EPSILON)
    const height = layer(vPos, this.uniforms.noise, this.uniforms.warping.x).toVar()
    const FLAG_LAND = step(this.uniforms.pbr.element(int(0)), height).toVar()
    const FLAG_BIOMES = FLAG_LAND.mul(float(this.uniforms.flags.element(int(3))))

    // render noise as color
    const texCoord = vec2(min(height, heightLimit), 0.5).toVar('texCoord')
    let colour = vec3(this.uniforms.textures[0].sample(texCoord).xyz)

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
    material.normalNode = transformNormalToView(mix(normalLocal, bump, FLAG_LAND.mul(this.uniforms.flags.element(int(2)))))
    material.roughnessNode = mix(this.uniforms.pbr.element(int(1)), this.uniforms.pbr.element(int(3)), FLAG_LAND)
    material.metalnessNode = mix(this.uniforms.pbr.element(int(2)), this.uniforms.pbr.element(int(4)), FLAG_LAND)
    return material
  }

  buildSurfaceBakeMaterial(): MeshBasicNodeMaterial {
    const material = new MeshBasicNodeMaterial()
    return material
  }

  buildPBRBakeMaterial(): MeshBasicNodeMaterial {
    const material = new MeshBasicNodeMaterial()
    return material
  }

  buildHeightMapBakeMaterial(): MeshBasicNodeMaterial {
    const material = new MeshBasicNodeMaterial()
    return material
  }

  buildNormalMapBakeMaterial(): MeshBasicNodeMaterial {
    const material = new MeshBasicNodeMaterial()
    return material
  }
}
