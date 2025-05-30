import { DoubleSide, MeshStandardNodeMaterial, type DataTexture, type TextureNode } from 'three/webgpu'
import type { UniformNumberNode } from '../types'
import type { TSLMaterial } from './tsl-material'
import { float, Fn, length, positionLocal, texture, uniform, vec2 } from 'three/tsl'
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
      innerRadius: uniform(data.innerRadius, 'float').label('uInnerRadius'),
      outerRadius: uniform(data.outerRadius, 'float').label('uOuterRadius'),
      texture: texture(data.texture).label('uTexture'),
    }
  }

  buildMaterial(): MeshStandardNodeMaterial {
    const mainNode = Fn(() => {
      const distanceToCenter = length(positionLocal.xy).toVar('distanceToCenter')
      const rampFactor = float(clampToRange(distanceToCenter, this.uniforms.innerRadius, this.uniforms.outerRadius)).toVar('rampFactor')
      const texCoord = vec2(rampFactor, 0.5).toVar('texCoord')
      return this.uniforms.texture.sample(texCoord);
    }).setLayout({
      name: 'mainNode',
      type: 'vec4',
      inputs: [],
    })

    // init material & set outputs
    const material = new MeshStandardNodeMaterial()
    material.colorNode = mainNode()
    // FIXME: restore transparency when fixed in TSL
    material.transparent = false
    material.side = DoubleSide
    return material
  }
}
