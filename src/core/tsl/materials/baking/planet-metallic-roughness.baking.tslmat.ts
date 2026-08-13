import type { SerializedPlanetData } from '@core/editor/workers/worker-serializer.types.ts';
import { applyXYZTransformations, layer } from '@tsl/features/lwd.ts';
import { TSLMaterial } from '@tsl/materials/tsl-material.ts';
import { flattenUV } from '@tsl/utils/vertex.tsl.ts';
import { step, vec4, mix, uv, positionLocal, uniform, uniformArray } from 'three/tsl';
import { MeshBasicNodeMaterial, UniformArrayNode, UniformNode, Vector3, Vector4 } from 'three/webgpu';

type BakingPlanetMetallicRoughnessUniforms = {
  flags: UniformArrayNode<'int'>;
  pbr: {
    waterLevel: UniformNode<'float', number>;
    metallicRoughness: UniformNode<'vec4', Vector4>;
  };
  surface: {
    noise: UniformNode<'vec4', Vector4>;
    warping: UniformNode<'vec4', Vector4>;
    displacement: {
      params: UniformNode<'vec3', Vector3>;
      noise: UniformNode<'vec4', Vector4>;
    };
  };
};
export class BakingPlanetMetallicRoughnessTSLMaterial extends TSLMaterial<
  MeshBasicNodeMaterial,
  BakingPlanetMetallicRoughnessUniforms
> {
  constructor(initData: SerializedPlanetData) {
    super();
    this.uniforms = this.initUniforms(initData);
  }

  initUniforms(data: SerializedPlanetData): BakingPlanetMetallicRoughnessUniforms {
    return {
      flags: uniformArray([+data.planetSurfaceShowWarping, +data.planetSurfaceShowDisplacement]),
      pbr: {
        waterLevel: uniform(data.planetWaterLevel),
        metallicRoughness: uniform(
          new Vector4(
            data.planetWaterRoughness,
            data.planetWaterMetalness,
            data.planetGroundRoughness,
            data.planetGroundMetalness,
          ),
        ),
      },
      surface: {
        noise: uniform(
          new Vector4(
            data.planetSurfaceNoise.frequency,
            data.planetSurfaceNoise.amplitude,
            data.planetSurfaceNoise.lacunarity,
            data.planetSurfaceNoise.octaves,
          ),
        ),
        warping: uniform(
          new Vector4(
            data.planetSurfaceNoise.layers,
            data.planetSurfaceNoise.warpFactor.x,
            data.planetSurfaceNoise.warpFactor.y,
            data.planetSurfaceNoise.warpFactor.z,
          ),
        ),
        displacement: {
          params: uniform(
            new Vector3(
              data.planetSurfaceDisplacement.factor,
              data.planetSurfaceDisplacement.epsilon,
              data.planetSurfaceDisplacement.multiplier,
            ),
          ),
          noise: uniform(
            new Vector4(
              data.planetSurfaceDisplacement.frequency,
              data.planetSurfaceDisplacement.amplitude,
              data.planetSurfaceDisplacement.lacunarity,
              data.planetSurfaceDisplacement.octaves,
            ),
          ),
        },
      },
    };
  }

  buildMaterial(): MeshBasicNodeMaterial {
    // XYZ Warping + displacement
    const vPos = applyXYZTransformations(
      positionLocal,
      this.uniforms.surface.warping,
      this.uniforms.flags.element(0),
      this.uniforms.surface.displacement.params,
      this.uniforms.surface.displacement.noise,
      this.uniforms.flags.element(1),
    );

    // Heightmap & global flags
    const height = layer(vPos, this.uniforms.surface.noise, this.uniforms.surface.warping.x).toVar();
    const FLAG_LAND = step(this.uniforms.pbr.waterLevel, height).toVar();

    // render PBR as green/blue mask
    const outRoughness = mix(this.uniforms.pbr.metallicRoughness.x, this.uniforms.pbr.metallicRoughness.z, FLAG_LAND);
    const outMetalness = mix(this.uniforms.pbr.metallicRoughness.y, this.uniforms.pbr.metallicRoughness.w, FLAG_LAND);

    // Init material & set outputs
    const material = new MeshBasicNodeMaterial();
    material.vertexNode = flattenUV(uv());
    material.colorNode = vec4(0, outRoughness, outMetalness, 1);
    return material;
  }
}
