// @ts-nocheck
// NOTE: @types/three types for post-processing nodes are completely borked...
// I had no choice but to entirely disable type-cheks for this file, sorry :c
import type { BaseRenderPipelineIdentifier } from '@core/tsl/rendering/base-render-pipeline.model.ts';
import { Camera, type Scene } from 'three';
import BloomNode, { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { chromaticAberration } from 'three/addons/tsl/display/ChromaticAberrationNode.js';
import { scanlines, vignette, colorBleeding, barrelUV } from 'three/addons/tsl/display/CRT.js';
import { fxaa } from 'three/addons/tsl/display/FXAANode.js';
import PixelationPassNode, { pixelationPass } from 'three/addons/tsl/display/PixelationPassNode.js';
import RetroPassNode, { retroPass } from 'three/addons/tsl/display/RetroPassNode.js';
import { rgbShift } from 'three/addons/tsl/display/RGBShiftNode.js';
import { circle } from 'three/addons/tsl/display/Shape.js';
import { smaa } from 'three/addons/tsl/display/SMAANode.js';
import { bayerDither } from 'three/addons/tsl/math/Bayer.js';
import { float, int, mix, pass, posterize, replaceDefaultUV, screenSize, select, uniform, vec2 } from 'three/tsl';
import { RenderPipeline, UniformNode, WebGPURenderer, Node, PassNode } from 'three/webgpu';

export type RenderPipelineUniformData = {
  baseRenderPipelineStr: BaseRenderPipelineIdentifier;
  baseRenderPipeline: number;
  basePixelation: {
    pixelSize: number;
    normalEdgeIntensity: number;
    depthEdgeIntensity: number;
  };
  baseRetro: {
    colorDepthSteps: number;
    colorBleeding: number;
    scanlineIntensity: number;
    scanlineDensity: number;
    scanlineSpeed: number;
    curvature: number;
  };
  effectRgbShift: {
    enabled: boolean;
    angle: number;
    amount: number;
  };
  effectChromaticAberration: {
    enabled: boolean;
    strength: number;
    scale: number;
  };
  effectBloom: {
    enabled: boolean;
    threshold: number;
    strength: number;
    radius: number;
  };
  effectVignette: {
    enabled: boolean;
    intensity: number;
    smoothness: number;
  };
  effectAntiAliasing: {
    enabled: boolean;
    mode: number;
  };
};
export type RenderPipelineUniforms = {
  baseRenderPipeline: UniformNode<'float', number>;
  basePixelation: {
    pixelSize: UniformNode<'float', number>;
    normalEdgeIntensity: UniformNode<'float', number>;
    depthEdgeIntensity: UniformNode<'float', number>;
  };
  baseRetro: {
    colorDepthSteps: UniformNode<'float', number>;
    colorBleeding: UniformNode<'float', number>;
    scanlineIntensity: UniformNode<'float', number>;
    scanlineDensity: UniformNode<'float', number>;
    scanlineSpeed: UniformNode<'float', number>;
    curvature: UniformNode<'float', number>;
  };
  effectRgbShift: {
    enabled: UniformNode<'float', number>;
    angle: UniformNode<'float', number>;
    amount: UniformNode<'float', number>;
  };
  effectChromaticAberration: {
    enabled: UniformNode<'float', number>;
    strength: UniformNode<'float', number>;
    scale: UniformNode<'float', number>;
  };
  effectBloom: {
    enabled: UniformNode<'float', number>;
    threshold: UniformNode<'float', number>;
    strength: UniformNode<'float', number>;
    radius: UniformNode<'float', number>;
  };
  effectVignette: {
    enabled: UniformNode<'float', number>;
    intensity: UniformNode<'float', number>;
    smoothness: UniformNode<'float', number>;
  };
  effectAntiAliasing: {
    enabled: UniformNode<'float', number>;
    mode: UniformNode<'float', number>;
  };
};
export default class TSLRenderPipeline {
  public readonly pipeline: RenderPipeline;
  public readonly uniforms: RenderPipelineUniforms;

  constructor(data: RenderPipelineUniformData, renderer: WebGPURenderer, scene: Scene, camera: Camera) {
    this.uniforms = {
      baseRenderPipeline: uniform(data.baseRenderPipeline),
      basePixelation: {
        pixelSize: uniform(data.basePixelation.pixelSize),
        normalEdgeIntensity: uniform(data.basePixelation.normalEdgeIntensity),
        depthEdgeIntensity: uniform(data.basePixelation.depthEdgeIntensity),
      },
      baseRetro: {
        colorDepthSteps: uniform(data.baseRetro.colorDepthSteps),
        colorBleeding: uniform(data.baseRetro.colorBleeding),
        scanlineIntensity: uniform(data.baseRetro.scanlineIntensity),
        scanlineDensity: uniform(data.baseRetro.scanlineDensity),
        scanlineSpeed: uniform(data.baseRetro.scanlineSpeed),
        curvature: uniform(data.baseRetro.curvature),
      },
      effectRgbShift: {
        enabled: uniform(+data.effectRgbShift.enabled),
        angle: uniform(data.effectRgbShift.angle),
        amount: uniform(data.effectRgbShift.amount),
      },
      effectChromaticAberration: {
        enabled: uniform(+data.effectChromaticAberration.enabled),
        strength: uniform(data.effectChromaticAberration.strength),
        scale: uniform(data.effectChromaticAberration.scale),
      },
      effectBloom: {
        enabled: uniform(+data.effectBloom.enabled),
        threshold: uniform(data.effectBloom.threshold),
        strength: uniform(data.effectBloom.strength),
        radius: uniform(data.effectBloom.radius),
      },
      effectVignette: {
        enabled: uniform(+data.effectVignette.enabled),
        intensity: uniform(data.effectVignette.intensity),
        smoothness: uniform(data.effectVignette.smoothness),
      },
      effectAntiAliasing: {
        enabled: uniform(+data.effectAntiAliasing.enabled),
        mode: uniform(data.effectAntiAliasing.mode),
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
    // prepare base pipelines
    let scenePass: PassNode;
    switch (brpId) {
      case 'none':
        scenePass = pass(scene, camera);
        break;
      case 'pixelation':
        scenePass = this.prepareBasePixelationPass(scene, camera);
        break;
      case 'retro':
        scenePass = this.prepareBaseRetroPass(scene, camera);
        break;
    }

    // ------------------------------------------------------------------------
    // Add extra effects (toggleable)

    // RGB Shift
    const rgbShiftNode = rgbShift(scenePass);
    rgbShiftNode.angle = this.uniforms.effectRgbShift.angle;
    rgbShiftNode.amount = this.uniforms.effectRgbShift.amount;
    scenePass = mix(scenePass, rgbShiftNode, this.uniforms.effectRgbShift.enabled);

    // Chromatic Aberration
    const chromaticAberrationNode = chromaticAberration(
      scenePass,
      this.uniforms.effectChromaticAberration.strength,
      vec2(0.5),
      this.uniforms.effectChromaticAberration.scale,
    );
    scenePass = mix(scenePass, chromaticAberrationNode, this.uniforms.effectChromaticAberration.enabled);

    // Bloom (needs special treatment via scenePass.add(...) to work properly)
    const bloomNode: BloomNode = bloom(scenePass);
    bloomNode.strength = this.uniforms.effectBloom.strength;
    bloomNode.radius = this.uniforms.effectBloom.radius;
    bloomNode.threshold = this.uniforms.effectBloom.threshold;
    scenePass = mix(scenePass, scenePass.add(bloomNode), this.uniforms.effectBloom.enabled);

    // Vignette
    const vignetteNode = vignette(
      scenePass,
      this.uniforms.effectVignette.intensity,
      this.uniforms.effectVignette.smoothness,
    );
    scenePass = mix(scenePass, vignetteNode, this.uniforms.effectVignette.enabled);

    // Anti-aliasing
    scenePass = mix(scenePass, this.computeAntiAliasingPass(scenePass), this.uniforms.effectAntiAliasing.enabled);
    return scenePass;
  }

  private prepareBasePixelationPass(scene: Scene, camera: Camera): PixelationPassNode {
    return pixelationPass(
      scene,
      camera,
      this.uniforms.basePixelation.pixelSize,
      this.uniforms.basePixelation.normalEdgeIntensity,
      this.uniforms.basePixelation.depthEdgeIntensity,
    );
  }

  private prepareBaseRetroPass(scene: Scene, camera: Camera): RetroPassNode {
    // Distort UV for curvature effect
    const distortedUV = barrelUV(this.uniforms.baseRetro.curvature);
    const distortedDelta = circle(this.uniforms.baseRetro.curvature.add(0.1).mul(10), 1)
      .mul(this.uniforms.baseRetro.curvature)
      .mul(0.05);
    // Build pass
    let pass: RetroPassNode = retroPass(scene, camera, { affineDistortion: float(0) });
    pass = replaceDefaultUV(distortedUV, pass);
    pass = colorBleeding(pass, this.uniforms.baseRetro.colorBleeding.add(distortedDelta));
    pass = bayerDither(pass, this.uniforms.baseRetro.colorDepthSteps);
    pass = posterize(pass, this.uniforms.baseRetro.colorDepthSteps);
    return scanlines(
      pass,
      this.uniforms.baseRetro.scanlineIntensity,
      screenSize.y.mul(this.uniforms.baseRetro.scanlineDensity),
      this.uniforms.baseRetro.scanlineSpeed,
    );
  }

  private computeAntiAliasingPass(renderPass: PassNode): PassNode {
    renderPass = select(int(this.uniforms.effectAntiAliasing.mode).lessThanEqual(0.5), fxaa(renderPass), renderPass);
    renderPass = select(int(this.uniforms.effectAntiAliasing.mode).greaterThanEqual(0.5), smaa(renderPass), renderPass);
    return renderPass;
  }
}
