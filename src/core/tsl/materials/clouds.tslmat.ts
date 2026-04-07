import {
  EPSILON,
  float,
  int,
  min,
  positionGeometry,
  texture,
  uniform,
  uniformArray,
  uv,
  Var,
  vec2,
  vec3,
  vec4,
} from 'three/tsl';
import {
  Color,
  Texture,
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  Node,
  TextureNode,
  UniformArrayNode,
  Vector3,
  Vector4,
  UniformNode,
} from 'three/webgpu';
import type { DisplacementData, NoiseData, WarpingData } from '../tsl-commons';
import { displace, warp } from '../features/lwd';
import { fbm3 } from '../noise/fbm3';
import { flattenUV } from '../utils/vertex-utils';
import { TSLMaterial } from './tsl-material';

export type CloudsUniformData = {
  flags: {
    showWarping: boolean;
    showDisplacement: boolean;
  };
  color: Color;
  noise: NoiseData;
  warping: WarpingData;
  displacement: {
    params: DisplacementData;
    noise: NoiseData;
  };
  texture: Texture;
};
export type CloudsUniforms = {
  flags: UniformArrayNode<'int'>;
  color: UniformNode<'color', Color>;
  noise: UniformNode<'vec4', Vector4>;
  warping: UniformNode<'vec4', Vector4>;
  displacement: {
    params: UniformNode<'vec3', Vector3>;
    noise: UniformNode<'vec4', Vector4>;
  };
  texture: TextureNode;
};
export class CloudsTSLMaterial extends TSLMaterial<MeshStandardNodeMaterial, CloudsUniformData, CloudsUniforms> {
  uniformize(data: CloudsUniformData): CloudsUniforms {
    return {
      flags: uniformArray([+data.flags.showWarping, +data.flags.showDisplacement], 'int'),
      color: uniform(data.color),
      noise: uniform(
        new Vector4(data.noise.frequency, data.noise.amplitude, data.noise.lacunarity, data.noise.octaves),
      ),
      warping: uniform(
        new Vector4(
          data.warping.layers,
          data.warping.warpFactor.x,
          data.warping.warpFactor.y,
          data.warping.warpFactor.z,
        ),
      ),
      displacement: {
        params: uniform(
          new Vector3(
            data.displacement.params.factor,
            data.displacement.params.epsilon,
            data.displacement.params.multiplier,
          ),
        ),
        noise: uniform(
          new Vector4(
            data.displacement.noise.frequency,
            data.displacement.noise.amplitude,
            data.displacement.noise.lacunarity,
            data.displacement.noise.octaves,
          ),
        ),
      },
      texture: texture(data.texture),
    };
  }

  buildMaterial(): MeshStandardNodeMaterial {
    const vPos = this.applyXYZTransformations(positionGeometry);
    const opacity = this.calculateOpacity(vPos);

    // init material & set outputs
    const material = new MeshStandardNodeMaterial();
    material.roughness = 1;
    material.metalness = 0.5;
    material.transparent = true;
    material.colorNode = vec4(this.uniforms.color, opacity.x);

    return material;
  }

  buildBakeMaterial(): MeshBasicNodeMaterial {
    const vPos = this.applyXYZTransformations(positionGeometry);
    const opacity = this.calculateOpacity(vPos);

    // init material & set outputs
    const material = new MeshBasicNodeMaterial();
    material.transparent = true;
    material.vertexNode = flattenUV(uv());
    material.colorNode = vec4(this.uniforms.color, opacity.x);
    return material;
  }

  // --------------------------------------------------------------------------

  private applyXYZTransformations(vPos: Node<'vec3'>): Node<'vec3'> {
    const warpedVPos = Var(vec3(warp(vPos, this.uniforms.warping, this.uniforms.flags.element(int(0)))), 'warpedVPos');
    return displace(
      warpedVPos,
      this.uniforms.displacement.params,
      this.uniforms.displacement.noise,
      this.uniforms.flags.element(int(1)),
    );
  }

  private calculateOpacity(vPos: Node<'vec3'>) {
    const DVEC_A = vec3(0.1, 0.1, 0).toVar('DVEC_A');
    const DVEC_B = vec3(0.2, 0.2, 0).toVar('DVEC_B');

    const fOpacity = vec3(
      fbm3(vPos, this.uniforms.noise),
      fbm3(vPos.add(DVEC_A), this.uniforms.noise),
      fbm3(vPos.add(DVEC_B), this.uniforms.noise),
    ).toVar('fOpacity');
    const opacity = vec3(fbm3(vPos.add(fOpacity), this.uniforms.noise)).toVar('opacity');
    const texCoords = vec2(min(float(1).sub(EPSILON), opacity.x)).toVar('texCoords');
    return this.uniforms.texture.sample(texCoords).xyz;
  }
}
