import { float, length, mrt, positionGeometry, texture, uniform, uv, vec2 } from 'three/tsl';
import {
  DoubleSide,
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  Node,
  Texture,
  UniformNode,
  type TextureNode,
} from 'three/webgpu';
import { flattenUV } from '../utils/vertex-utils';
import { TSLMaterial } from './tsl-material';

export type RingUniformData = {
  innerRadius: number;
  outerRadius: number;
  texture: Texture;
};
export type RingUniforms = {
  innerRadius: UniformNode<'float', number>;
  outerRadius: UniformNode<'float', number>;
  texture: TextureNode;
};
export class RingTSLMaterial extends TSLMaterial<MeshStandardNodeMaterial, RingUniformData, RingUniforms> {
  uniformize(data: RingUniformData): RingUniforms {
    return {
      innerRadius: uniform(data.innerRadius, 'float').setName('uInnerRadius'),
      outerRadius: uniform(data.outerRadius, 'float').setName('uOuterRadius'),
      texture: texture(data.texture).setName('uTexture'),
    };
  }

  buildMaterial(): MeshStandardNodeMaterial {
    const material = new MeshStandardNodeMaterial();
    material.colorNode = this.sampleRampTexture(positionGeometry);
    material.transparent = true;
    material.side = DoubleSide;

    // Connect MRT data
    material.mrtNode = mrt({ bloomIntensity: uniform(1.0) });
    return material;
  }

  buildBakeMaterial(): MeshBasicNodeMaterial {
    const material = new MeshBasicNodeMaterial();
    material.vertexNode = flattenUV(uv());
    material.colorNode = this.sampleRampTexture(positionGeometry);
    material.transparent = true;
    material.side = DoubleSide;
    return material;
  }

  // --------------------------------------------------------------------------

  private sampleRampTexture(pos: Node<'vec3'>): Node<'vec4'> {
    const distanceToCenter = length(pos.xy).toVar('distanceToCenter');
    const rampFactor = float(
      this.clampToRange(distanceToCenter, this.uniforms.innerRadius, this.uniforms.outerRadius),
    ).toVar('rampFactor');
    const texCoord = vec2(rampFactor, 0.5).toVar('texCoord');
    return this.uniforms.texture.sample(texCoord);
  }

  private clampToRange(i_v: Node<'float'>, i_min: Node<'float'>, i_max: Node<'float'>): Node<'float'> {
    return i_v.sub(i_min).div(i_max.sub(i_min));
  }
}
