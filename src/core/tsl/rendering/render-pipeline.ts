import { Camera, type Scene } from 'three';
import BloomNode, { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { emissive, float, mrt, output, pass, uniform } from 'three/tsl';
import { RenderPipeline, UniformNode, WebGPURenderer, Node } from 'three/webgpu';

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
    strength: number;
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
    strength: UniformNode<'float', number>;
    radius: UniformNode<'float', number>;
  };
};
export default class TSLRenderPipeline {
  public readonly pipeline: RenderPipeline;
  public readonly uniforms: RenderPipelineUniforms;

  public readonly bloomNode!: BloomNode;

  constructor(data: RenderPipelineUniformData, renderer: WebGPURenderer, scene: Scene, camera: Camera) {
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
        strength: uniform(data.bloom.strength),
        radius: uniform(data.bloom.radius),
      },
    };
    this.pipeline = new RenderPipeline(renderer);
    this.pipeline.outputNode = this.composePipelinePasses(scene, camera);
    this.pipeline.needsUpdate = true;
  }

  private composePipelinePasses(scene: Scene, camera: Camera): Node {
    const scenePass = pass(scene, camera);
    scenePass.setMRT(
      mrt({
        output,
        emissive,
        bloomIntensity: float(0),
      }),
    );

    const outputPass = scenePass.getTextureNode();
    const bloomIntensityPass = scenePass.getTextureNode('bloomIntensity');
    // @ts-expect-error Bad @types/three typings
    this.bloomNode = bloom(
      outputPass.mul(bloomIntensityPass).mul(this.uniforms.bloom.enabled),
      this.uniforms.bloom.strength.value,
      this.uniforms.bloom.radius.value,
      this.uniforms.bloom.threshold.value,
    );
    return outputPass.add(this.bloomNode!).renderOutput();
  }
}
