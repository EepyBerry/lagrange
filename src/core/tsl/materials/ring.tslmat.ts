import {
  DoubleSide,
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  Node,
  type DataTexture,
  type TextureNode,
} from 'three/webgpu'
import type { UniformNumberNode } from '../types'
import type { TSLMaterial } from './tsl-material'
import { float, Fn, length, positionLocal, texture, uniform, uv, vec2, vec4, type ShaderNodeObject } from 'three/tsl'
import { flattenUV } from '../utils/vertex.tlsutil'

export type RingUniformData = {
  innerRadius: number
  outerRadius: number
  texture: DataTexture
}
export type RingUniforms = {
  innerRadius: UniformNumberNode
  outerRadius: UniformNumberNode
  texture: TextureNode
}
export class RingTSLMaterial implements TSLMaterial<MeshStandardNodeMaterial, RingUniformData, RingUniforms> {
  public readonly uniforms: RingUniforms

  constructor(data: RingUniformData) {
    this.uniforms = {
      innerRadius: uniform(data.innerRadius, 'float').setName('uInnerRadius'),
      outerRadius: uniform(data.outerRadius, 'float').setName('uOuterRadius'),
      texture: texture(data.texture).setName('uTexture'),
    }
  }

  buildMaterial(): MeshStandardNodeMaterial {
    const mainNode = Fn(([pos]: [ShaderNodeObject<Node>]) => {
      const distanceToCenter = length(pos.xy).toVar('distanceToCenter')
      const rampFactor = float(
        this.clampToRange(distanceToCenter, this.uniforms.innerRadius, this.uniforms.outerRadius),
      ).toVar('rampFactor')
      const texCoord = vec2(rampFactor, 0.5).toVar('texCoord')
      return this.uniforms.texture.sample(texCoord)
    }).setLayout({
      name: 'mainNode',
      type: 'vec4',
      inputs: [{ name: 'pos', type: 'vec3' }],
    })

    // init material & set outputs
    const material = new MeshStandardNodeMaterial()
    material.fragmentNode = mainNode(positionLocal)
    material.transparent = false
    material.side = DoubleSide
    return material
  }

  buildBakeMaterial(): MeshBasicNodeMaterial {
    const mainNode = Fn(([pos]: [ShaderNodeObject<Node>]) => {
      const distanceToCenter = length(pos.xy).toVar('distanceToCenter')
      const rampFactor = float(
        this.clampToRange(distanceToCenter, this.uniforms.innerRadius, this.uniforms.outerRadius),
      ).toVar('rampFactor')
      const texCoord = vec2(rampFactor, 0.5).toVar('texCoord')
      return this.uniforms.texture.sample(texCoord)
    }).setLayout({
      name: 'mainNode',
      type: 'vec4',
      inputs: [{ name: 'pos', type: 'vec3' }],
    })

    // init material & set outputs
    const material = new MeshBasicNodeMaterial()
    material.vertexNode = flattenUV(uv())
    material.fragmentNode = mainNode(positionLocal)
    material.transparent = false
    material.side = DoubleSide
    return material
  }

  // --------------------------------------------------------------------------

  private clampToRange(i_v: ShaderNodeObject<Node>, i_min: UniformNumberNode, i_max: UniformNumberNode) {
    return i_v.sub(i_min).div(i_max.sub(i_min))
  }
}
