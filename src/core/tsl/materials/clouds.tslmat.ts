import type { DataEventPayloadTypeMap } from '@core/editor/event/data-event.types.ts';
import type PlanetData from '@core/models/planet/planet-data.model.ts';
import { DataEventEndpoint } from '@core/editor/event/data-event-endpoint.ts';
import { EDITOR_WORKERS } from '@core/editor/state/editor.state.ts';
import { TEXTURE_SIZES } from '@core/globals.ts';
import { WorkerBoundDataTexture } from '@core/utils/texture/worker-bound-data-texture.ts';
import { flattenUV } from '@tsl/utils/vertex.tsl.ts';
import { EPSILON, float, min, positionGeometry, texture, uniform, uniformArray, uv, vec2, vec3, vec4 } from 'three/tsl';
import {
  Color,
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  Node,
  TextureNode,
  UniformArrayNode,
  Vector3,
  Vector4,
  UniformNode,
} from 'three/webgpu';
import { displace, warp } from '../features/lwd';
import { fbm3 } from '../noise/fbm3';
import { TSLMaterial } from './tsl-material';

export type CloudsUniforms = {
  flags: UniformArrayNode<'int'>;
  color: UniformNode<'color', Color>;
  noise: UniformNode<'vec4', Vector4>;
  warping: UniformNode<'vec3', Vector3>;
  displacement: {
    params: UniformNode<'vec3', Vector3>;
    noise: UniformNode<'vec4', Vector4>;
  };
  texture: TextureNode;
};
export class CloudsTSLMaterial extends TSLMaterial<MeshStandardNodeMaterial, CloudsUniforms> {
  public readonly dataEventEndpoint = new DataEventEndpoint<keyof DataEventPayloadTypeMap>('endpoint-clouds');
  public readonly workerBoundDataTexture: WorkerBoundDataTexture = new WorkerBoundDataTexture(
    TEXTURE_SIZES.CLOUDS,
    TEXTURE_SIZES.CLOUDS,
  );

  constructor(initData: PlanetData) {
    super();
    this.uniforms = this.initUniforms(initData);
    this.initTextures(initData);
    this.dataEventEndpoint.canProcess = (payload) => !payload.context || payload.context === 'clouds';
    this.dataEventEndpoint
      .on('cloudsShowWarping', (payload) => (this.uniforms.flags.array[0] = +payload.value))
      .on('cloudsShowDisplacement', (payload) => (this.uniforms.flags.array[1] = +payload.value))
      .on('fbmNoiseParametersUpdate', (payload) => {
        this.uniforms.warping.value.x = payload.value.warpFactor.x;
        this.uniforms.warping.value.y = payload.value.warpFactor.y;
        this.uniforms.warping.value.z = payload.value.warpFactor.z;
        this.uniforms.noise.value.x = payload.value.frequency;
        this.uniforms.noise.value.y = payload.value.amplitude;
        this.uniforms.noise.value.z = payload.value.lacunarity;
        this.uniforms.noise.value.w = payload.value.octaves;
      })
      .on('displacementParametersUpdate', (payload) => {
        this.uniforms.displacement.params.value.x = payload.value.factor;
        this.uniforms.displacement.params.value.y = payload.value.epsilon;
        this.uniforms.displacement.params.value.z = payload.value.multiplier;
        this.uniforms.displacement.noise.value.x = payload.value.frequency;
        this.uniforms.displacement.noise.value.y = payload.value.amplitude;
        this.uniforms.displacement.noise.value.z = payload.value.lacunarity;
        this.uniforms.displacement.noise.value.w = payload.value.octaves;
      })
      .on('cloudsColor', (payload) => (this.uniforms.color.value = payload.value))
      .on(
        'colorRampUpdate',
        async (payload) =>
          await this.workerBoundDataTexture.update(EDITOR_WORKERS.texture!, 'color-ramp', payload.value.steps),
      );
  }

  dispose(): void {
    super.dispose();
    this.workerBoundDataTexture.texture.dispose();
  }

  initUniforms(data: PlanetData): CloudsUniforms {
    return {
      flags: uniformArray([+data.cloudsShowWarping, +data.cloudsShowDisplacement], 'int'),
      color: uniform(data.cloudsColor),
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
      texture: texture(this.workerBoundDataTexture.texture),
    };
  }

  initTextures(initData: PlanetData): void {
    this.workerBoundDataTexture
      .update(EDITOR_WORKERS.texture!, 'color-ramp', initData.cloudsColorRamp.steps)
      .catch(console.error);
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
    const warpedVPos = vec3(warp(vPos, vec4(1, this.uniforms.warping), float(this.uniforms.flags.element(0)))).toVar(
      'warpedVPos',
    );
    return displace(
      warpedVPos,
      this.uniforms.displacement.params,
      this.uniforms.displacement.noise,
      float(this.uniforms.flags.element(1)),
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
