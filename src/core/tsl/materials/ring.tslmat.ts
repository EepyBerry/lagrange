import { DoubleSide, MeshStandardNodeMaterial, Node, type DataTexture, type TextureNode } from 'three/webgpu'
import type { UniformNumberNode } from '../types'
import type { TSLMaterial } from './tsl-material'
import { float, Fn, length, positionLocal, texture, uniform, vec2, type ShaderNodeObject } from 'three/tsl'
import { clampToRange } from '../utils/math.tslutil'

export type RingData = {
  innerRadius: number
  outerRadius: number
  texture: DataTexture
}
export type RingUniforms = {
  innerRadius: UniformNumberNode
  outerRadius: UniformNumberNode
  texture: TextureNode
}
export class RingTSLMaterial implements TSLMaterial<MeshStandardNodeMaterial, RingData, RingUniforms> {
  public readonly uniforms: RingUniforms

  constructor(data: RingData) {
    this.uniforms = {
      innerRadius: uniform(data.innerRadius, 'float').setName('uInnerRadius'),
      outerRadius: uniform(data.outerRadius, 'float').setName('uOuterRadius'),
      texture: texture(data.texture).setName('uTexture'),
    }
  }

  buildMaterial(): MeshStandardNodeMaterial {
    const mainNode = Fn(([pos]: [ShaderNodeObject<Node>]) => {
      const distanceToCenter = length(pos.xy).toVar('distanceToCenter')
      const rampFactor = float(clampToRange(distanceToCenter, this.uniforms.innerRadius, this.uniforms.outerRadius)).toVar('rampFactor')
      const texCoord = vec2(rampFactor, 0.5).toVar('texCoord')
      return this.uniforms.texture.sample(texCoord);
    }).setLayout({
      name: 'mainNode',
      type: 'vec4',
      inputs: [
        { name: 'pos', type: 'vec3' }
      ],
    })

    // init material & set outputs
    const material = new MeshStandardNodeMaterial()
    material.colorNode = mainNode(positionLocal)
    // TODO: restore transparency when fixed in TSL
    material.transparent = false
    material.side = DoubleSide
    return material
  }

  buildBakeMaterial(): MeshStandardNodeMaterial {
    return new MeshStandardNodeMaterial()
  }
}
