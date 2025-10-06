import {
  Color,
  DataTexture,
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  Node,
  Texture,
  TextureNode,
  UniformArrayNode,
  Vector2,
  Vector3,
  Vector4,
} from 'three/webgpu'
import {
  bitangentLocal,
  EPSILON,
  float,
  int,
  mat3,
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
  uv,
  vec2,
  vec3,
  vec4,
  type ShaderNodeObject,
} from 'three/tsl'
import { type TSLMaterial } from './tsl-material'
import { displace, layer, warp } from '../features/lwd'
import type {
  DisplacementData,
  NoiseData,
  UniformNumberNode,
  UniformVector2Node,
  UniformVector3Node,
  UniformVector4Node,
  WarpingData,
} from '../types'
import { applyBump } from '../features/bump'
import { computeHumidity, computeTemperature, sampleBiomeTexture } from '../features/biomes'
import { sobel } from '../utils/sobel.tlsutil'
import { flattenUV } from '../utils/vertex.tlsutil'

export type PlanetUniformData = {
  radius: number
  bumpStrength: number
  flags: {
    showWarping: boolean
    showDisplacement: boolean
    showBumps: boolean
    showBiomes: boolean
    showEmissive: boolean
  }
  pbr: {
    waterLevel: number
    metallicRoughness: {
      waterRoughness: number
      waterMetalness: number
      groundRoughness: number
      groundMetalness: number
    },
    emissive: {
      waterEmissiveIntensity: number
      groundEmissiveIntensity: number
    }
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
  textures?: {
    surface: DataTexture
    biomes: DataTexture
  }
}
export type PlanetUniforms = {
  radius: UniformNumberNode
  bumpStrength: UniformNumberNode
  flags: UniformArrayNode
  pbr: {
    waterLevel: UniformNumberNode
    metallicRoughness: UniformVector4Node,
    emissive: UniformVector2Node
  }
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
  textures?: TextureNode[]
}
export class PlanetTSLMaterial implements TSLMaterial<MeshStandardNodeMaterial, PlanetUniformData, PlanetUniforms> {
  public readonly uniforms: PlanetUniforms

  constructor(data: PlanetUniformData) {
    this.uniforms = {
      radius: uniform(data.radius, 'float'),
      bumpStrength: uniform(data.bumpStrength, 'float'),
      flags: uniformArray(
        [+data.flags.showWarping, +data.flags.showDisplacement, +data.flags.showBumps, +data.flags.showBiomes, +data.flags.showEmissive],
        'int',
      ),
      pbr: {
        waterLevel: uniform(data.pbr.waterLevel, 'float'),
        metallicRoughness: uniform(
          new Vector4(
            data.pbr.metallicRoughness.waterRoughness,
            data.pbr.metallicRoughness.waterMetalness,
            data.pbr.metallicRoughness.groundRoughness,
            data.pbr.metallicRoughness.groundMetalness
          ),
          'vec4',
        ),
        emissive: uniform(
          new Vector2(
            data.pbr.emissive.waterEmissiveIntensity,
            data.pbr.emissive.groundEmissiveIntensity
          ),
          'vec4',
        )
      },
      noise: uniform(
        new Vector4(data.noise.frequency, data.noise.amplitude, data.noise.lacunarity, data.noise.octaves),
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
      textures: data.textures ? [texture(data.textures.surface), texture(data.textures.biomes)] : undefined,
    }
  }

  buildMaterial(): MeshStandardNodeMaterial {
    if (this.uniforms.textures === undefined) {
      throw new Error('Cannot build material with missing uniform: textures')
    }

    // XYZ Warping + displacement
    const vPos = this.applyXYZTransformations(positionLocal)

    // Heightmap & global flags
    const heightLimit = float(1.0).sub(EPSILON)
    const height = layer(vPos, this.uniforms.noise, this.uniforms.warping.x).toVar()
    const FLAG_LAND = step(this.uniforms.pbr.waterLevel, height).toVar()
    const FLAG_BIOMES = FLAG_LAND.mul(float(this.uniforms.flags.element(int(3))))

    // render noise as color
    const texCoord = vec2(min(height, heightLimit), 0.5).toVar('texCoord')
    let colour = vec3(this.uniforms.textures![0].sample(texCoord).xyz)

    // Render biomes
    colour = this.renderBiomes(colour, vPos, heightLimit, FLAG_BIOMES)

    // Render bump-map (under MIT license)
    const bump = this.applyBumpMap(vPos, height)

    // Init material & set outputs
    const material = new MeshStandardNodeMaterial()
    material.colorNode = vec4(colour, 1.0)
    material.normalNode = transformNormalToView(
      mix(normalLocal, bump, FLAG_LAND.mul(this.uniforms.flags.element(int(2)))),
    )
    material.roughnessNode = mix(this.uniforms.pbr.metallicRoughness.w, this.uniforms.pbr.metallicRoughness.y, FLAG_LAND)
    material.metalnessNode = mix(this.uniforms.pbr.metallicRoughness.x, this.uniforms.pbr.metallicRoughness.z, FLAG_LAND)
    material.emissiveNode = this.applyEmissiveIntensity(colour, FLAG_LAND)
    return material
  }

  buildSurfaceBakeMaterial(): MeshBasicNodeMaterial {
    if (this.uniforms.textures === undefined) {
      throw new Error('Cannot build material with missing uniform: textures')
    }

    // XYZ Warping + displacement
    const vPos = this.applyXYZTransformations(positionLocal)

    // Heightmap & global flags
    const heightLimit = float(1.0).sub(EPSILON)
    const height = layer(vPos, this.uniforms.noise, this.uniforms.warping.x).toVar()
    const FLAG_LAND = step(this.uniforms.pbr.waterLevel, height).toVar()
    const FLAG_BIOMES = FLAG_LAND.mul(float(this.uniforms.flags.element(int(3))))

    // render noise as color
    const texCoord = vec2(min(height, heightLimit), 0.5).toVar('texCoord')
    let colour = vec3(this.uniforms.textures![0].sample(texCoord).xyz)

    // Render biomes
    colour = this.renderBiomes(colour, vPos, heightLimit, FLAG_BIOMES)

    // Init material & set outputs
    const material = new MeshBasicNodeMaterial()
    material.vertexNode = flattenUV(uv())
    material.colorNode = vec4(colour, 1.0)
    return material
  }

  buildMetallicRoughnessBakeMaterial(): MeshBasicNodeMaterial {
    // XYZ Warping + displacement
    const vPos = this.applyXYZTransformations(positionLocal)

    // Heightmap & global flags
    const height = layer(vPos, this.uniforms.noise, this.uniforms.warping.x).toVar()
    const FLAG_LAND = step(this.uniforms.pbr.waterLevel, height).toVar()

    // render PBR as green/blue mask
    const outRoughness = mix(this.uniforms.pbr.metallicRoughness.w, this.uniforms.pbr.metallicRoughness.y, FLAG_LAND)
    const outMetalness = mix(this.uniforms.pbr.metallicRoughness.x, this.uniforms.pbr.metallicRoughness.z, FLAG_LAND)

    // Init material & set outputs
    const material = new MeshBasicNodeMaterial()
    material.vertexNode = flattenUV(uv())
    material.colorNode = vec4(0.0, outRoughness, outMetalness, 1.0)
    return material
  }

  buildEmissivityBakeMaterial(surfaceTex: Texture): MeshBasicNodeMaterial {
    // XYZ Warping + displacement
    const vPos = this.applyXYZTransformations(positionLocal)

    // Heightmap & global flags
    const heightLimit = float(1.0).sub(EPSILON)
    const height = layer(vPos, this.uniforms.noise, this.uniforms.warping.x).toVar()
    const FLAG_LAND = step(this.uniforms.pbr.waterLevel, height).toVar()

    // render noise as color
    const texNode = texture(surfaceTex).setName('texNode')
    const texCoord = vec2(min(height, heightLimit), 0.5).toVar('texCoord')
    const colour = vec3(texNode.sample(texCoord).xyz)

    // Init material & set outputs
    const material = new MeshBasicNodeMaterial()
    material.vertexNode = flattenUV(uv())
    material.colorNode = vec4(this.applyEmissiveIntensity(colour, FLAG_LAND).xyz, 1.0)
    return material
  }

  buildHeightMapBakeMaterial(): MeshBasicNodeMaterial {
    // XYZ Warping + displacement
    const vPos = this.applyXYZTransformations(positionLocal)

    // Heightmap & global flags
    const height = layer(vPos, this.uniforms.noise, this.uniforms.warping.x).toVar()
    const FLAG_LAND = step(this.uniforms.pbr.waterLevel, height).toVar()

    // Init material & set outputs
    const material = new MeshBasicNodeMaterial()
    material.vertexNode = flattenUV(uv())
    material.colorNode = vec4(mix(vec3(this.uniforms.pbr.waterLevel), vec3(height), FLAG_LAND), 1.0)
    return material
  }

  buildNormalMapBakeMaterial(heightMap: Texture): MeshBasicNodeMaterial {
    const texNode = texture(heightMap)
    const offset = vec3(-1.0 / heightMap.width, 0.0, 1.0 / heightMap.height).toVar('offset')

    // Sample height-map at 8 points around the current position
    const s00 = texNode.sample(uv().add(offset.xx)).x.toVar('s00')
    const s01 = texNode.sample(uv().add(offset.yx)).x.toVar('s10')
    const s02 = texNode.sample(uv().add(offset.zx)).x.toVar('s20')
    const s10 = texNode.sample(uv().add(offset.xy)).x.toVar('s01')
    const s12 = texNode.sample(uv().add(offset.zy)).x.toVar('s21')
    const s20 = texNode.sample(uv().add(offset.xz)).x.toVar('s02')
    const s21 = texNode.sample(uv().add(offset.yz)).x.toVar('s12')
    const s22 = texNode.sample(uv().add(offset.zz)).x.toVar('s22')
    // @ts-expect-error: Invalid type definitions for mat3(...) using nodes
    const sobelMat = mat3(s00, s01, s02, s10, uv().x, s12, s20, s21, s22).toVar('sobelMat')
    const normal = sobel(sobelMat, float(heightMap.width).mul(this.uniforms.bumpStrength)).toVar('N')

    const material = new MeshBasicNodeMaterial()
    material.vertexNode = flattenUV(uv())
    material.colorNode = vec4(normal, 1.0)
    return material
  }

  // --------------------------------------------------------------------------

  private applyXYZTransformations(vPos: ShaderNodeObject<Node>): ShaderNodeObject<Node> {
    vPos = warp(vPos, this.uniforms.warping, this.uniforms.flags.element(int(0)))
    return displace(
      vPos,
      this.uniforms.displacement.params,
      this.uniforms.displacement.noise,
      this.uniforms.flags.element(int(1)),
    )
  }

  private renderBiomes(
    colour: ShaderNodeObject<Node>,
    vPos: ShaderNodeObject<Node>,
    heightLimit: ShaderNodeObject<Node>,
    FLAG_BIOMES: ShaderNodeObject<Node>,
  ): ShaderNodeObject<Node> {
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
    return mix(colour, sampleBiomeTexture(this.uniforms.textures![1], tHeight, hHeight, colour), FLAG_BIOMES)
  }

  private applyBumpMap(vPos: ShaderNodeObject<Node>, height: ShaderNodeObject<Node>): ShaderNodeObject<Node> {
    const dx = vec3(tangentLocal.mul(this.uniforms.warping.yzw).mul(0.005)).toVar()
    const dy = vec3(bitangentLocal.mul(this.uniforms.warping.yzw).mul(0.005)).toVar()
    const dxHeight = float(layer(vPos.add(dx), this.uniforms.noise, this.uniforms.warping.x)).toVar()
    const dyHeight = float(layer(vPos.add(dy), this.uniforms.noise, this.uniforms.warping.x)).toVar()
    return vec3(
      applyBump(vPos, dx, dy, height, dxHeight, dyHeight, this.uniforms.radius, this.uniforms.bumpStrength),
    ).toVar()
  }

  private applyEmissiveIntensity(colour: ShaderNodeObject<Node>, FLAG_LAND: ShaderNodeObject<Node>): ShaderNodeObject<Node> {
    const emissiveFactor = mix(this.uniforms.pbr.emissive.x, this.uniforms.pbr.emissive.y, FLAG_LAND).toVar('emissiveFactor')
    return colour.mul(this.uniforms.flags.element(int(4))).mul(emissiveFactor)
  }
}
