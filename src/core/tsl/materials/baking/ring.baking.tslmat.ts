import type { SerializedRingParameters } from '@core/editor/workers/worker-serializer.types.ts';
import { TSLMaterial } from '@tsl/materials/tsl-material.ts';
import { flattenUV } from '@tsl/utils/vertex.tsl.ts';
import { float, length, positionGeometry, texture, uniform, uv, vec2 } from 'three/tsl';
import { DoubleSide, MeshBasicNodeMaterial, Node, Texture, UniformNode, type TextureNode } from 'three/webgpu';
import { clampToRange } from '../../utils/math.tsl';

export type BakingRingUniforms = {
  innerRadius: UniformNode<'float', number>;
  outerRadius: UniformNode<'float', number>;
  textures: {
    color: TextureNode;
  };
};
export class BakingRingTSLMaterial extends TSLMaterial<MeshBasicNodeMaterial, BakingRingUniforms> {
  constructor(initData: SerializedRingParameters, initTextures: Texture[]) {
    super();
    this.uniforms = this.initUniforms(initData, initTextures);
  }

  initUniforms(data: SerializedRingParameters, textures: Texture[]): BakingRingUniforms {
    return {
      innerRadius: uniform(data.innerRadius, 'float').setName('uInnerRadius'),
      outerRadius: uniform(data.outerRadius, 'float').setName('uOuterRadius'),
      textures: {
        color: texture(textures[0]).setName('uTexture'),
      },
    };
  }

  buildMaterial(): MeshBasicNodeMaterial {
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
      clampToRange(distanceToCenter, this.uniforms.innerRadius, this.uniforms.outerRadius),
    ).toVar('rampFactor');
    const texCoord = vec2(rampFactor, 0.5).toVar('texCoord');
    return this.uniforms.textures.color.sample(texCoord);
  }
}
