import { Camera, type Scene } from 'three';
import { pass, uniform } from 'three/tsl';
import { PassNode, RenderPipeline, UniformNode, WebGPURenderer } from 'three/webgpu';

export type RenderPipelineUniformData = {
  pixelation: {
    enabled: boolean;
    pixelSize: number;
    normalEdgeIntensity: number;
    depthEdgeIntensity: number;
  };
  bloom: {
    enabled: boolean;
    threshold: number;
    intensity: number;
    radius: number;
  };
};
export type RenderPipelineUniforms = {
  pixelation: {
    enabled: UniformNode<'float', number>;
    pixelSize: UniformNode<'float', number>;
    normalEdgeIntensity: UniformNode<'float', number>;
    depthEdgeIntensity: UniformNode<'float', number>;
  };
  bloom: {
    enabled: UniformNode<'float', number>;
    threshold: UniformNode<'float', number>;
    intensity: UniformNode<'float', number>;
    radius: UniformNode<'float', number>;
  };
};
export default class TSLRenderPipeline {
  public readonly pipeline: RenderPipeline;
  public readonly uniforms: RenderPipelineUniforms;

  constructor(data: RenderPipelineUniformData, renderer: WebGPURenderer) {
    this.pipeline = new RenderPipeline(renderer);
    this.uniforms = {
      pixelation: {
        enabled: uniform(+data.pixelation.enabled),
        pixelSize: uniform(data.pixelation.pixelSize),
        normalEdgeIntensity: uniform(data.pixelation.normalEdgeIntensity),
        depthEdgeIntensity: uniform(data.pixelation.depthEdgeIntensity),
      },
      bloom: {
        enabled: uniform(+data.bloom.enabled),
        threshold: uniform(data.bloom.threshold),
        intensity: uniform(data.bloom.intensity),
        radius: uniform(data.bloom.radius),
      },
    };
  }

  public updateOutputNode(scene: Scene, camera: Camera) {
    this.pipeline.outputNode = this.composePipelinePasses(scene, camera);
    this.pipeline.needsUpdate = true;
  }

  private composePipelinePasses(scene: Scene, camera: Camera): PassNode {
    const composedPass: PassNode = pass(scene, camera);

    return composedPass;
  }
}
