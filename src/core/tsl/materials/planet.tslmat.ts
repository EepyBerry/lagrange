import {
  Texture,
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  Node,
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
} from '../tsl-types'
import { applyBump } from '../features/bump'
import { computeHumidity, computeTemperature, sampleBiomeTexture } from '../features/biomes'
import { sobel } from '../utils/sobel-utils'
import { flattenUV } from '../utils/vertex-utils'

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
    }
    emissive: {
      waterEmissiveIntensity: number
      groundEmissiveIntensity: number
    }
  }
  surface: {
    baseTexture?: Texture
    noise: NoiseData
    warping: WarpingData
    displacement: {
      params: DisplacementData
      noise: NoiseData
    }
  }
  biomes: {
    baseTexture?: Texture
    emissiveTexture?: Texture
    temperatureMode: number
    temperatureNoise: NoiseData
    humidityMode: number
    humidityNoise: NoiseData
  }
  // uniforms used for baking only
  baking: {
    unifiedSurfaceTexture?: Texture
    heightMapTexture?: Texture
  }
}
export type PlanetUniforms = {
  radius: UniformNumberNode
  bumpStrength: UniformNumberNode
  flags: UniformArrayNode
  pbr: {
    waterLevel: UniformNumberNode
    metallicRoughness: UniformVector4Node
    emissive: UniformVector2Node
  }
  surface: {
    baseTexture?: TextureNode
    noise: UniformVector4Node
    warping: UniformVector4Node
    displacement: {
      params: UniformVector3Node
      noise: UniformVector4Node
    }
  }
  biomes: {
    baseTexture?: TextureNode
    emissiveTexture?: TextureNode
    temperatureMode: UniformNumberNode
    temperatureNoise: UniformVector4Node
    humidityMode: UniformNumberNode
    humidityNoise: UniformVector4Node
  }
  // uniforms used for baking only
  baking: {
    unifiedSurfaceTexture?: TextureNode
    heightMapTexture?: TextureNode
  }
}
export class PlanetTSLMaterial implements TSLMaterial<MeshStandardNodeMaterial, PlanetUniformData, PlanetUniforms> {
  public readonly uniforms: PlanetUniforms

  constructor(data: PlanetUniformData) {
    this.uniforms = {
      radius: uniform(data.radius, 'float'),
      bumpStrength: uniform(data.bumpStrength, 'float'),
      flags: uniformArray(
        [
          +data.flags.showWarping,
          +data.flags.showDisplacement,
          +data.flags.showBumps,
          +data.flags.showBiomes,
          +data.flags.showEmissive,
        ],
        'int',
      ),
      pbr: {
        waterLevel: uniform(data.pbr.waterLevel, 'float'),
        metallicRoughness: uniform(
          new Vector4(
            data.pbr.metallicRoughness.waterRoughness,
            data.pbr.metallicRoughness.waterMetalness,
            data.pbr.metallicRoughness.groundRoughness,
            data.pbr.metallicRoughness.groundMetalness,
          ),
          'vec4',
        ),
        emissive: uniform(
          new Vector2(data.pbr.emissive.waterEmissiveIntensity, data.pbr.emissive.groundEmissiveIntensity),
          'vec2',
        ),
      },
      surface: {
        baseTexture: texture(data.surface.baseTexture),
        noise: uniform(
          new Vector4(
            data.surface.noise.frequency,
            data.surface.noise.amplitude,
            data.surface.noise.lacunarity,
            data.surface.noise.octaves,
          ),
          'vec4',
        ),
        warping: uniform(
          new Vector4(
            data.surface.warping.layers,
            data.surface.warping.warpFactor.x,
            data.surface.warping.warpFactor.y,
            data.surface.warping.warpFactor.z,
          ),
          'vec4',
        ),
        displacement: {
          params: uniform(
            new Vector3(
              data.surface.displacement.params.factor,
              data.surface.displacement.params.epsilon,
              data.surface.displacement.params.multiplier,
            ),
            'vec3',
          ),
          noise: uniform(
            new Vector4(
              data.surface.displacement.noise.frequency,
              data.surface.displacement.noise.amplitude,
              data.surface.displacement.noise.lacunarity,
              data.surface.displacement.noise.octaves,
            ),
            'vec4',
          ),
        },
      },
      biomes: {
        baseTexture: texture(data.biomes.baseTexture),
        emissiveTexture: texture(data.biomes.emissiveTexture),
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
      baking: {
        unifiedSurfaceTexture: texture(data.baking.unifiedSurfaceTexture),
        heightMapTexture: texture(data.baking.heightMapTexture)
      }
    }
  }

  buildMaterial(): MeshStandardNodeMaterial {
    if (!this.uniforms.surface.baseTexture) {
      throw new Error('Cannot build material with missing uniform: surface.baseTexture')
    }
    if (!this.uniforms.biomes.baseTexture) {
      throw new Error('Cannot build material with missing uniform: biomes.baseTexture')
    }

    // XYZ Warping + displacement
    const vPos = this.applyXYZTransformations(positionLocal)

    // Heightmap & global flags
    const heightLimit = float(1.0).sub(EPSILON)
    const height = layer(vPos, this.uniforms.surface.noise, this.uniforms.surface.warping.x).toVar()
    const FLAG_LAND = step(this.uniforms.pbr.waterLevel, height).toVar()
    const FLAG_BIOMES = FLAG_LAND.mul(float(this.uniforms.flags.element(int(3))))

    // render noise as color
    const texCoord = vec2(min(height, heightLimit), 0.5).toVar('texCoord')
    let colour = vec3(this.uniforms.surface.baseTexture.sample(texCoord).xyz)

    // Render biomes
    const biomeTexCoord = this.calculateBiomeTextureCoordinates(vPos, heightLimit, FLAG_BIOMES).toVar('biomeTexCoord')
    colour = this.renderBiomes(colour, this.uniforms.biomes.baseTexture!, biomeTexCoord, FLAG_BIOMES)

    // Render bump-map (under MIT license)
    const bump = this.applyBumpMap(vPos, height)

    // Init material & set outputs
    const material = new MeshStandardNodeMaterial()
    material.colorNode = vec4(colour, 1.0)
    material.normalNode = transformNormalToView(
      mix(normalLocal, bump, FLAG_LAND.mul(this.uniforms.flags.element(int(2)))),
    )
    material.roughnessNode = mix(
      this.uniforms.pbr.metallicRoughness.x,
      this.uniforms.pbr.metallicRoughness.z,
      FLAG_LAND,
    )
    material.metalnessNode = mix(
      this.uniforms.pbr.metallicRoughness.y,
      this.uniforms.pbr.metallicRoughness.w,
      FLAG_LAND,
    )
    material.emissiveNode = this.applyEmissiveIntensity(colour, this.uniforms.biomes.baseTexture, biomeTexCoord, FLAG_LAND)
    return material
  }

  buildSurfaceBakeMaterial(): MeshBasicNodeMaterial {
    if (!this.uniforms.surface.baseTexture) {
      throw new Error('Cannot build material with missing uniform: surface.baseTexture')
    }
    if (!this.uniforms.biomes.baseTexture) {
      throw new Error('Cannot build material with missing uniform: biomes.baseTexture')
    }

    // XYZ Warping + displacement
    const vPos = this.applyXYZTransformations(positionLocal)

    // Heightmap & global flags
    const heightLimit = float(1.0).sub(EPSILON)
    const height = layer(vPos, this.uniforms.surface.noise, this.uniforms.surface.warping.x).toVar()
    const FLAG_LAND = step(this.uniforms.pbr.waterLevel, height).toVar()
    const FLAG_BIOMES = FLAG_LAND.mul(float(this.uniforms.flags.element(int(3))))

    // render noise as color
    const texCoord = vec2(min(height, heightLimit), 0.5).toVar('texCoord')
    let colour = vec3(this.uniforms.surface.baseTexture.sample(texCoord).xyz)

    // Render biomes
    const biomeTexCoord = this.calculateBiomeTextureCoordinates(vPos, heightLimit, FLAG_BIOMES).toVar('biomeTexCoord')
    colour = this.renderBiomes(colour, this.uniforms.biomes.baseTexture!, biomeTexCoord, FLAG_BIOMES)

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
    const height = layer(vPos, this.uniforms.surface.noise, this.uniforms.surface.warping.x).toVar()
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

  buildEmissivityBakeMaterial(): MeshBasicNodeMaterial {
    if (!this.uniforms.baking.unifiedSurfaceTexture) {
      throw new Error('Cannot build material with missing uniform: baking.unifiedSurfaceTexture')
    }
    if (!this.uniforms.biomes.emissiveTexture) {
      throw new Error('Cannot build material with missing uniform: biomes.emissiveTexture')
    }
    
    // XYZ Warping + displacement
    const vPos = this.applyXYZTransformations(positionLocal)

    // Heightmap & global flags
    const heightLimit = float(1.0).sub(EPSILON)
    const height = layer(vPos, this.uniforms.surface.noise, this.uniforms.surface.warping.x).toVar()
    const FLAG_LAND = step(this.uniforms.pbr.waterLevel, height).toVar()
    const FLAG_BIOMES = FLAG_LAND.mul(float(this.uniforms.flags.element(int(3))))

    // render noise as color
    const texCoord = vec2(min(height, heightLimit), 0.5).toVar('texCoord')
    const colour = vec3(this.uniforms.baking!.unifiedSurfaceTexture!.sample(texCoord).xyz)

    // get biome texcoords for emissivity calculations
    const biomeTexCoord = this.calculateBiomeTextureCoordinates(vPos, heightLimit, FLAG_BIOMES).toVar('biomeTexCoord')

    // Init material & set outputs
    const material = new MeshBasicNodeMaterial()
    material.vertexNode = flattenUV(uv())
    material.colorNode = vec4(this.applyEmissiveIntensity(colour, this.uniforms.biomes.emissiveTexture!, biomeTexCoord, FLAG_LAND).xyz, 1.0)
    return material
  }

  buildHeightMapBakeMaterial(): MeshBasicNodeMaterial {
    // XYZ Warping + displacement
    const vPos = this.applyXYZTransformations(positionLocal)

    // Heightmap & global flags
    const height = layer(vPos, this.uniforms.surface.noise, this.uniforms.surface.warping.x).toVar()
    const FLAG_LAND = step(this.uniforms.pbr.waterLevel, height).toVar()

    // Init material & set outputs
    const material = new MeshBasicNodeMaterial()
    material.vertexNode = flattenUV(uv())
    material.colorNode = vec4(mix(vec3(this.uniforms.pbr.waterLevel), vec3(height), FLAG_LAND), 1.0)
    return material
  }

  buildNormalMapBakeMaterial(): MeshBasicNodeMaterial {
    if (!this.uniforms.baking.heightMapTexture) {
      throw new Error('Cannot build material with missing uniform: baking.heightMapTexture')
    }

    const texNode = this.uniforms.baking.heightMapTexture
    const offset = vec3(-1.0 / texNode.value.width, 0.0, 1.0 /  texNode.value.height).toVar('offset')

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
    const normal = sobel(sobelMat, float(texNode.value.width).mul(this.uniforms.bumpStrength)).toVar('N')

    const material = new MeshBasicNodeMaterial()
    material.vertexNode = flattenUV(uv())
    material.colorNode = vec4(normal, 1.0)
    return material
  }

  // --------------------------------------------------------------------------

  private applyXYZTransformations(vPos: ShaderNodeObject<Node>): ShaderNodeObject<Node> {
    vPos = warp(vPos, this.uniforms.surface.warping, this.uniforms.flags.element(int(0)))
    return displace(
      vPos,
      this.uniforms.surface.displacement.params,
      this.uniforms.surface.displacement.noise,
      this.uniforms.flags.element(int(1)),
    )
  }

  private calculateBiomeTextureCoordinates(
    vPos: ShaderNodeObject<Node>,
    heightLimit: ShaderNodeObject<Node>,
    FLAG_BIOMES: ShaderNodeObject<Node>,
  ) {
    const temp = float(
      computeTemperature(vPos, this.uniforms.biomes.temperatureNoise, this.uniforms.biomes.temperatureMode),
    )
    const humi = float(computeHumidity(vPos, this.uniforms.biomes.humidityNoise, this.uniforms.biomes.humidityMode))
    return vec2(
      float(mix(0.0, temp, FLAG_BIOMES)).min(heightLimit),
      float(mix(0.0, humi, FLAG_BIOMES)).min(heightLimit)
    )
  }

  private renderBiomes(
    colour: ShaderNodeObject<Node>,
    texture: TextureNode,
    texCoords: ShaderNodeObject<Node>,
    FLAG_BIOMES: ShaderNodeObject<Node>,
  ): ShaderNodeObject<Node> {
    return mix(colour, sampleBiomeTexture(texture, texCoords.x, texCoords.y, colour), FLAG_BIOMES)
  }

  private applyBumpMap(vPos: ShaderNodeObject<Node>, height: ShaderNodeObject<Node>): ShaderNodeObject<Node> {
    const dx = vec3(tangentLocal.mul(this.uniforms.surface.warping.yzw).mul(0.005)).toVar()
    const dy = vec3(bitangentLocal.mul(this.uniforms.surface.warping.yzw).mul(0.005)).toVar()
    const dxHeight = float(layer(vPos.add(dx), this.uniforms.surface.noise, this.uniforms.surface.warping.x)).toVar()
    const dyHeight = float(layer(vPos.add(dy), this.uniforms.surface.noise, this.uniforms.surface.warping.x)).toVar()
    return vec3(
      applyBump(
        normalLocal,
        vPos,
        dx,
        dy,
        height,
        dxHeight,
        dyHeight,
        this.uniforms.radius,
        this.uniforms.bumpStrength,
      ),
    ).toVar()
  }

  private applyEmissiveIntensity(
    surfaceColor: ShaderNodeObject<Node>,
    biomeEmissiveTexture: TextureNode,
    biomeTexCoord: ShaderNodeObject<Node>,
    FLAG_LAND: ShaderNodeObject<Node>,
  ): ShaderNodeObject<Node> {
    // Get base emissive factor (water or ground value)
    const baseEmissiveFactor = mix(this.uniforms.pbr.emissive.x, this.uniforms.pbr.emissive.y, FLAG_LAND).toVar(
      'baseEmissiveFactor',
    )
    // Get biome emissive factor from texture (green channel = value, alpha channel = strength factor)
    const biomeEmissiveColor = vec4(biomeEmissiveTexture.sample(biomeTexCoord)).toVar('biomeEmissiveTexCoord')
    const resultEmissiveFactor = mix(baseEmissiveFactor, biomeEmissiveColor.y.mul(10.0), biomeEmissiveColor.w).toVar(
      'biomeEmissiveFactor',
    )
    return surfaceColor.mul(this.uniforms.flags.element(int(4))).mul(resultEmissiveFactor)
  }
}
