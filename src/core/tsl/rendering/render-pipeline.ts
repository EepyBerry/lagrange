import type { BaseRenderPipelineIdentifier } from '@core/tsl/rendering/base-render-pipeline.model.ts';
import { Camera, type Scene } from 'three';
import BloomNode, { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { pixelationPass } from 'three/addons/tsl/display/PixelationPassNode.js';
import { pass, uniform } from 'three/tsl';
import { RenderPipeline, UniformNode, WebGPURenderer, Node, TextureNode, PassNode } from 'three/webgpu';

export type RenderPipelineUniformData = {
  baseRenderPipelineStr: BaseRenderPipelineIdentifier;
  baseRenderPipeline: number;
  pixelation: {
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
  baseRenderPipeline: UniformNode<'float', number>;
  pixelation: {
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
      baseRenderPipeline: uniform(data.baseRenderPipeline),
      pixelation: {
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
    this.pipeline.outputNode = this.composePipelinePasses(data.baseRenderPipelineStr, scene, camera);
    this.pipeline.needsUpdate = true;
  }

  public updatePipelinePasses(brpId: BaseRenderPipelineIdentifier, scene: Scene, camera: Camera) {
    this.pipeline.outputNode = this.composePipelinePasses(brpId, scene, camera);
    this.pipeline.needsUpdate = true;
  }

  private composePipelinePasses(brpId: BaseRenderPipelineIdentifier, scene: Scene, camera: Camera): Node {
    // ------------------------------------------------------------------------
    // prepare base pipelines

    let scenePass: PassNode;
    switch (brpId) {
      case 'none':
        scenePass = pass(scene, camera);
        break;
      case 'pixelation':
        scenePass = pixelationPass(
          scene,
          camera,
          this.uniforms.pixelation.pixelSize,
          this.uniforms.pixelation.normalEdgeIntensity,
          this.uniforms.pixelation.depthEdgeIntensity,
        );
        break;
      case 'retro':
        // TODO implement retroPass here (threejs example -> webgpu_postprocessing_retro)
        scenePass = pass(scene, camera);
        break;
    }
    let outputPass = scenePass.getTextureNode('output');

    // ------------------------------------------------------------------------
    // Add extra effects (toggleable)

    const bloomNode = bloom(outputPass.mul(this.uniforms.bloom.enabled));
    bloomNode.strength = this.uniforms.bloom.strength;
    bloomNode.radius = this.uniforms.bloom.radius;
    bloomNode.threshold = this.uniforms.bloom.threshold;
    outputPass = outputPass.add(bloomNode) as TextureNode;

    // TODO add more effects here (rgbShift, chromaticAberration & others?)

    return outputPass.renderOutput();
  }
}
