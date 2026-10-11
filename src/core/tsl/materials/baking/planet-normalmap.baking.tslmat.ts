import type { SerializedPlanetData } from '@core/editor/workers/worker-serializer.types.ts';
import { TSLMaterial } from '@tsl/materials/tsl-material.ts';
import { sampleSobel, sobel } from '@tsl/utils/sobel.tsl.ts';
import { flattenUV } from '@tsl/utils/vertex.tsl.ts';
import { vec4, uv, uniform, uniformArray, vec3, texture, float } from 'three/tsl';
import { MeshBasicNodeMaterial, Texture, TextureNode, UniformArrayNode, UniformNode } from 'three/webgpu';

type BakingPlanetNormalMapUniforms = {
  flags: UniformArrayNode<'int'>;
  bump: {
    offset: UniformNode<'float', number>;
    strength: UniformNode<'float', number>;
  };
  textures: {
    heightMap: TextureNode;
  };
};
export class BakingPlanetNormalMapTSLMaterial extends TSLMaterial<
  MeshBasicNodeMaterial,
  BakingPlanetNormalMapUniforms
> {
  constructor(initData: SerializedPlanetData, initTextures: Texture[]) {
    super();
    this.uniforms = this.initUniforms(initData, initTextures);
  }

  initUniforms(data: SerializedPlanetData, textures: Texture[]): BakingPlanetNormalMapUniforms {
    return {
      flags: uniformArray([+data.planetSurfaceShowWarping, +data.planetSurfaceShowDisplacement]),
      bump: {
        offset: uniform(data.planetSurfaceBumpOffset),
        strength: uniform(data.planetSurfaceBumpStrength),
      },
      textures: {
        heightMap: texture(textures[0]),
      },
    };
  }

  buildMaterial(): MeshBasicNodeMaterial {
    const texNode = this.uniforms.textures.heightMap;
    const offset = vec3(-1 / texNode.value.width, 0, 1 / texNode.value.height).toVar('offset');

    // Sample height-map at 8 points around the current position
    const sobelMat = sampleSobel(texNode, uv(), offset).toVar('sobelMat');
    const normal = sobel(sobelMat, float(texNode.value.width).mul(this.uniforms.bump.strength)).toVar('N');

    const material = new MeshBasicNodeMaterial();
    material.vertexNode = flattenUV(uv());
    material.colorNode = vec4(normal, 1);
    return material;
  }
}
