import type { RingParameters } from '@core/models/planet/ring-parameters.model.ts';
import { EDITOR_WORKERS } from '@core/editor/state/editor.state.ts';
import { TEXTURE_SIZES } from '@core/globals.ts';
import { WorkerBoundDataTexture } from '@core/utils/texture/worker-bound-data-texture.ts';
import { positionGeometry, texture, uniform } from 'three/tsl';
import { DoubleSide, MeshStandardNodeMaterial, UniformNode, type TextureNode } from 'three/webgpu';
import { sampleRampTexture } from '../features/rings';
import { TSLMaterial } from './tsl-material';

export type RingUniforms = {
  innerRadius: UniformNode<'float', number>;
  outerRadius: UniformNode<'float', number>;
  texture: TextureNode;
};
export class RingTSLMaterial extends TSLMaterial<MeshStandardNodeMaterial, RingUniforms> {
  public readonly ringInstanceId: string;
  public readonly workerBoundDataTexture: WorkerBoundDataTexture = new WorkerBoundDataTexture(
    TEXTURE_SIZES.RING,
    TEXTURE_SIZES.RING,
  );

  constructor(initData: RingParameters) {
    super();
    this.uniforms = this.initUniforms(initData);
    this.initTextures(initData);
    this.ringInstanceId = initData.id;
    this.dataEventEndpoint.canProcess = (payload) =>
      payload.instanceId === this.ringInstanceId && (!payload.context || payload.context === 'ring');
    this.dataEventEndpoint
      .on('ringParametersUpdate', (evt) => {
        this.uniforms.innerRadius.value = evt.value.innerRadius;
        this.uniforms.outerRadius.value = evt.value.outerRadius;
      })
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

  initUniforms(data: RingParameters): RingUniforms {
    return {
      innerRadius: uniform(data.innerRadius, 'float').setName('uInnerRadius'),
      outerRadius: uniform(data.outerRadius, 'float').setName('uOuterRadius'),
      texture: texture(this.workerBoundDataTexture.texture).setName('uTexture'),
    };
  }

  initTextures(initData: RingParameters): void {
    this.workerBoundDataTexture
      .update(EDITOR_WORKERS.texture!, 'color-ramp', initData.colorRamp.steps)
      .catch(console.error);
  }

  buildMaterial(): MeshStandardNodeMaterial {
    const material = new MeshStandardNodeMaterial();
    material.colorNode = sampleRampTexture(
      positionGeometry,
      this.uniforms.innerRadius,
      this.uniforms.outerRadius,
      this.uniforms.texture,
    );
    material.transparent = true;
    material.side = DoubleSide;
    return material;
  }
}
