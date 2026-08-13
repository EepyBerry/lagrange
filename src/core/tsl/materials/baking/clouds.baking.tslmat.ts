import type { SerializedPlanetData } from '@core/editor/workers/worker-serializer.types.ts';
import { calculateCloudsOpacity } from '@tsl/features/clouds.ts';
import { applyXYZTransformations } from '@tsl/features/lwd.ts';
import { TSLMaterial } from '@tsl/materials/tsl-material.ts';
import { flattenUV } from '@tsl/utils/vertex.tsl.ts';
import { vec4, uv, uniform, uniformArray, positionGeometry, texture } from 'three/tsl';
import {
  Texture,
  MeshBasicNodeMaterial,
  TextureNode,
  UniformArrayNode,
  UniformNode,
  Vector3,
  Vector4,
} from 'three/webgpu';

type BakingCloudsUniforms = {
  flags: UniformArrayNode<'int'>;
  color: UniformNode<'vec3', Vector3>;
  noise: UniformNode<'vec4', Vector4>;
  warping: UniformNode<'vec3', Vector3>;
  displacement: {
    params: UniformNode<'vec3', Vector3>;
    noise: UniformNode<'vec4', Vector4>;
  };
  textures: {
    opacity: TextureNode;
  };
};
export class BakingCloudsTSLMaterial extends TSLMaterial<MeshBasicNodeMaterial, BakingCloudsUniforms> {
  constructor(initData: SerializedPlanetData, initTextures: Texture[]) {
    super();
    this.uniforms = this.initUniforms(initData, initTextures);
  }

  initUniforms(data: SerializedPlanetData, textures: Texture[]): BakingCloudsUniforms {
    return {
      flags: uniformArray([+data.cloudsShowWarping, +data.cloudsShowDisplacement], 'int'),
      color: uniform(new Vector3(data.cloudsColor.r, data.cloudsColor.g, data.cloudsColor.b)),
      noise: uniform(
        new Vector4(
          data.cloudsNoise.frequency,
          data.cloudsNoise.amplitude,
          data.cloudsNoise.lacunarity,
          data.cloudsNoise.octaves,
        ),
      ),
      warping: uniform(
        new Vector3(data.cloudsNoise.warpFactor.x, data.cloudsNoise.warpFactor.y, data.cloudsNoise.warpFactor.z),
      ),
      displacement: {
        params: uniform(
          new Vector3(
            data.cloudsDisplacement.factor,
            data.cloudsDisplacement.epsilon,
            data.cloudsDisplacement.multiplier,
          ),
        ),
        noise: uniform(
          new Vector4(
            data.cloudsDisplacement.frequency,
            data.cloudsDisplacement.amplitude,
            data.cloudsDisplacement.lacunarity,
            data.cloudsDisplacement.octaves,
          ),
        ),
      },
      textures: {
        opacity: texture(textures[0]),
      },
    };
  }

  buildMaterial(): MeshBasicNodeMaterial {
    const vPos = applyXYZTransformations(
      positionGeometry,
      vec4(1, this.uniforms.warping),
      this.uniforms.flags.element(0),
      this.uniforms.displacement.params,
      this.uniforms.displacement.noise,
      this.uniforms.flags.element(1),
    );
    const opacity = calculateCloudsOpacity(vPos, this.uniforms.noise, this.uniforms.textures.opacity);

    // init material & set outputs
    const material = new MeshBasicNodeMaterial();
    material.transparent = true;
    material.vertexNode = flattenUV(uv());
    material.colorNode = vec4(this.uniforms.color, opacity.x);
    return material;
  }
}
