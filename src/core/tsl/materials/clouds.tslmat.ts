import {
  Color,
  DataTexture,
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  Node,
  TextureNode,
  UniformArrayNode,
  Vector3,
  Vector4,
} from 'three/webgpu'
import {
  Fn,
  int,
  positionLocal,
  texture,
  uniform,
  uniformArray,
  uv,
  vec2,
  vec3,
  vec4,
  type ShaderNodeObject,
} from 'three/tsl'
import { type TSLMaterial } from './tsl-material'
import { displace, warp } from '../features/lwd'
import { fbm3 } from '../noise/fbm3'
import type {
  DisplacementData,
  NoiseData,
  UniformColorNode,
  UniformVector3Node,
  UniformVector4Node,
  WarpingData,
} from '../types'

export type CloudsUniformData = {
  flags: {
    showWarping: boolean
    showDisplacement: boolean
  }
  color: Color
  noise: NoiseData
  warping: WarpingData
  displacement: {
    params: DisplacementData
    noise: NoiseData
  }
  texture: DataTexture
}
export type CloudsUniforms = {
  flags: UniformArrayNode
  color: UniformColorNode
  noise: UniformVector4Node
  warping: UniformVector4Node
  displacement: {
    params: UniformVector3Node
    noise: UniformVector4Node
  }
  texture: TextureNode
}
export class CloudsTSLMaterial implements TSLMaterial<MeshStandardNodeMaterial, CloudsUniformData, CloudsUniforms> {
  public readonly uniforms: CloudsUniforms

  constructor(data: CloudsUniformData) {
    this.uniforms = {
      flags: uniformArray([+data.flags.showWarping, +data.flags.showDisplacement], 'int'),
      color: uniform(data.color),
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
      texture: texture(data.texture),
    }
  }

  buildMaterial(): MeshStandardNodeMaterial {
    const mainNode = Fn(([pos]: [ShaderNodeObject<Node>]) => {
      // XYZ warping + displacement
      const vPos = this.applyXYZTransformations(pos)
      // Clouds
      const opacity = this.calculateOpacity(vPos)
      return vec4(this.uniforms.color, opacity.x)
    }).setLayout({
      name: 'mainNode',
      type: 'vec4',
      inputs: [{ name: 'pos', type: 'vec3' }],
    })

    // init material & set outputs
    const material = new MeshStandardNodeMaterial()
    material.roughness = 1
    material.metalness = 0.5
    material.transparent = true
    material.colorNode = mainNode(positionLocal)
    return material
  }

  buildBakeMaterial(): MeshBasicNodeMaterial {
    const mainNode = Fn(([pos]: [ShaderNodeObject<Node>]) => {
      // XYZ warping + displacement
      const vPos = this.applyXYZTransformations(pos)
      // Clouds
      const opacity = this.calculateOpacity(vPos)
      return vec4(this.uniforms.color, opacity.x)
    }).setLayout({
      name: 'mainNode',
      type: 'vec4',
      inputs: [{ name: 'pos', type: 'vec3' }],
    })

    // init material & set outputs
    const material = new MeshBasicNodeMaterial()
    material.transparent = true
    material.vertexNode = Fn(() => vec4(uv().x, uv().y, 0.0, 1.0).mul(2.0).sub(1.0))()
    material.colorNode = mainNode(positionLocal)
    return material
  }

  // --------------------------------------------------------------------------

  private applyXYZTransformations(pos: ShaderNodeObject<Node>): ShaderNodeObject<Node> {
    const vPos = vec3(warp(pos, this.uniforms.warping, this.uniforms.flags.element(int(0)))).toVar('vPos')
    vPos.assign(
      displace(
        vPos,
        this.uniforms.displacement.params,
        this.uniforms.displacement.noise,
        this.uniforms.flags.element(int(1)),
      ),
    )
    return vPos
  }

  private calculateOpacity(vPos: ShaderNodeObject<Node>) {
    const DVEC_A = vec3(0.1, 0.1, 0.0).toVar('DVEC_A')
    const DVEC_B = vec3(0.2, 0.2, 0.0).toVar('DVEC_B')

    const fOpacity = vec3(
      fbm3(vPos, this.uniforms.noise),
      fbm3(vPos.add(DVEC_A), this.uniforms.noise),
      fbm3(vPos.add(DVEC_B), this.uniforms.noise),
    ).toVar('fOpacity')
    const opacity = vec3(fbm3(vPos.add(fOpacity), this.uniforms.noise)).toVar('opacity')
    opacity.assign(this.uniforms.texture.sample(vec2(opacity.x, 0.5)).xyz)
    return opacity
  }
}
