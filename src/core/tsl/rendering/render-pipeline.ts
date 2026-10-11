import type { DataEventPayloadTypeMap } from '@core/editor/event/data-event.types.ts';
import type { BaseRenderPipelineIdentifier } from '@core/models/renderpipeline/base-render-pipeline.model.ts';
import type RenderPipelineData from '@core/models/renderpipeline/render-pipeline-data.model.ts';
import { DataEventEndpoint } from '@core/editor/event/data-event-endpoint.ts';
import { EDITOR_SCENE_DATA } from '@core/editor/state/editor.state.ts';
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
import { degToRad } from 'three/src/math/MathUtils.js';
import { float, int, mix, pass, posterize, replaceDefaultUV, screenSize, select, uniform, vec2 } from 'three/tsl';
import { RenderPipeline, UniformNode, WebGPURenderer, Node, PassNode } from 'three/webgpu';

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
  public readonly dataEventEndpoint = new DataEventEndpoint<keyof DataEventPayloadTypeMap>();

  constructor(data: RenderPipelineData, renderer: WebGPURenderer, scene: Scene, camera: Camera) {
    this.uniforms = {
      baseRenderPipeline: uniform(this.convertBaseRenderPipelineIdentifier(data.basePipelineIdentifier)),
      basePixelation: {
        pixelSize: uniform(data.basePipelinePixelation.pixelSize),
        normalEdgeIntensity: uniform(data.basePipelinePixelation.normalEdgeIntensity),
        depthEdgeIntensity: uniform(data.basePipelinePixelation.depthEdgeIntensity),
      },
      baseRetro: {
        colorDepthSteps: uniform(data.basePipelineRetro.colorDepthSteps),
        colorBleeding: uniform(data.basePipelineRetro.colorBleeding),
        scanlineIntensity: uniform(data.basePipelineRetro.scanlineIntensity),
        scanlineDensity: uniform(data.basePipelineRetro.scanlineDensity),
        scanlineSpeed: uniform(data.basePipelineRetro.scanlineSpeed),
        curvature: uniform(data.basePipelineRetro.curvature),
      },
      effectRgbShift: {
        enabled: uniform(+data.rgbShiftEnabled),
        angle: uniform(data.rgbShiftAngle),
        amount: uniform(data.rgbShiftAmount),
      },
      effectChromaticAberration: {
        enabled: uniform(+data.chromaticAberrationEnabled),
        strength: uniform(data.chromaticAberrationStrength),
        scale: uniform(data.chromaticAberrationScale),
      },
      effectBloom: {
        enabled: uniform(+data.bloomEnabled),
        threshold: uniform(data.bloomThreshold),
        strength: uniform(data.bloomStrength),
        radius: uniform(data.bloomRadius),
      },
      effectVignette: {
        enabled: uniform(+data.vignetteEnabled),
        intensity: uniform(data.vignetteIntensity),
        smoothness: uniform(data.vignetteSmoothness),
      },
      effectAntiAliasing: {
        enabled: uniform(+data.antiAliasingEnabled),
        mode: uniform(data.antiAliasingMode),
      },
    };
    this.pipeline = new RenderPipeline(renderer);
    this.pipeline.outputNode = this.composePipelinePasses(data.basePipelineIdentifier, scene, camera);
    this.pipeline.needsUpdate = true;

    this.initDataEventEndpoint();
  }

  private initDataEventEndpoint() {
    this.dataEventEndpoint.canProcess = (payload) => !payload.context || payload.context === 'render-pipeline';
    this.dataEventEndpoint
      .on('renderBasePipeline', (payload) =>
        this.updatePipelinePasses(payload.value, EDITOR_SCENE_DATA.scene!, EDITOR_SCENE_DATA.camera!),
      )
      .on('renderPipelinePixelation', (payload) => {
        this.uniforms.basePixelation.pixelSize.value = payload.value.pixelSize;
        this.uniforms.basePixelation.normalEdgeIntensity.value = payload.value.normalEdgeIntensity;
        this.uniforms.basePixelation.depthEdgeIntensity.value = payload.value.depthEdgeIntensity;
      })
      .on('renderPipelineRetro', (payload) => {
        this.uniforms.baseRetro.colorDepthSteps.value = payload.value.colorDepthSteps;
        this.uniforms.baseRetro.colorBleeding.value = payload.value.colorBleeding;
        this.uniforms.baseRetro.scanlineIntensity.value = payload.value.scanlineIntensity;
        this.uniforms.baseRetro.scanlineDensity.value = payload.value.scanlineDensity;
        this.uniforms.baseRetro.scanlineSpeed.value = payload.value.scanlineSpeed;
        this.uniforms.baseRetro.curvature.value = payload.value.curvature;
      })
      .on('renderEffectRgbShift', (payload) => {
        this.uniforms.effectRgbShift.enabled.value = +payload.value.enabled;
        this.uniforms.effectRgbShift.angle.value = degToRad(payload.value.angle);
        this.uniforms.effectRgbShift.amount.value = payload.value.amount;
      })
      .on('renderEffectChromaticAberration', (payload) => {
        this.uniforms.effectChromaticAberration.enabled.value = +payload.value.enabled;
        this.uniforms.effectChromaticAberration.strength.value = payload.value.strength;
        this.uniforms.effectChromaticAberration.scale.value = payload.value.scale;
      })
      .on('renderEffectBloom', (payload) => {
        this.uniforms.effectBloom.enabled.value = +payload.value.enabled;
        this.uniforms.effectBloom.threshold.value = payload.value.threshold;
        this.uniforms.effectBloom.strength.value = payload.value.strength;
        this.uniforms.effectBloom.radius.value = payload.value.radius;
      })
      .on('renderEffectVignette', (payload) => {
        this.uniforms.effectVignette.enabled.value = +payload.value.enabled;
        this.uniforms.effectVignette.intensity.value = payload.value.intensity;
        this.uniforms.effectVignette.smoothness.value = payload.value.smoothness;
      })
      .on('renderEffectAntiAliasing', (payload) => {
        this.uniforms.effectAntiAliasing.enabled.value = +payload.value.enabled;
        this.uniforms.effectAntiAliasing.mode.value = payload.value.mode;
      });
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
    // @ts-expect-error borked typedefs
    scenePass = mix(scenePass, rgbShiftNode, this.uniforms.effectRgbShift.enabled);

    // Chromatic Aberration
    const chromaticAberrationNode = chromaticAberration(
      scenePass,
      this.uniforms.effectChromaticAberration.strength,
      vec2(0.5),
      this.uniforms.effectChromaticAberration.scale,
    );
    // @ts-expect-error borked typedefs
    scenePass = mix(scenePass, chromaticAberrationNode, this.uniforms.effectChromaticAberration.enabled);

    // Bloom (needs special treatment via scenePass.add(...) to work properly)
    const bloomNode: BloomNode = bloom(scenePass);
    bloomNode.strength = this.uniforms.effectBloom.strength;
    bloomNode.radius = this.uniforms.effectBloom.radius;
    bloomNode.threshold = this.uniforms.effectBloom.threshold;
    // @ts-expect-error borked typedefs
    scenePass = mix(scenePass, scenePass.add(bloomNode), this.uniforms.effectBloom.enabled);

    // Vignette
    const vignetteNode = vignette(
      // @ts-expect-error borked typedefs
      scenePass,
      this.uniforms.effectVignette.intensity,
      this.uniforms.effectVignette.smoothness,
    );
    // @ts-expect-error borked typedefs
    scenePass = mix(scenePass, vignetteNode, this.uniforms.effectVignette.enabled);

    // Anti-aliasing
    // @ts-expect-error borked typedefs
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
    let pass = retroPass(scene, camera, { affineDistortion: float(0) });
    // @ts-expect-error borked typedefs
    pass = replaceDefaultUV(distortedUV, pass);
    // @ts-expect-error borked typedefs
    pass = colorBleeding(pass, this.uniforms.baseRetro.colorBleeding.add(distortedDelta));
    // @ts-expect-error borked typedefs
    pass = bayerDither(pass, this.uniforms.baseRetro.colorDepthSteps);
    // @ts-expect-error borked typedefs
    pass = posterize(pass, this.uniforms.baseRetro.colorDepthSteps);
    // @ts-expect-error borked typedefs
    return scanlines(
      // @ts-expect-error borked typedefs
      pass,
      this.uniforms.baseRetro.scanlineIntensity,
      screenSize.y.mul(this.uniforms.baseRetro.scanlineDensity),
      this.uniforms.baseRetro.scanlineSpeed,
    );
  }

  private computeAntiAliasingPass(renderPass: PassNode): PassNode {
    // @ts-expect-error borked typedefs
    renderPass = select(int(this.uniforms.effectAntiAliasing.mode).lessThanEqual(0.5), fxaa(renderPass), renderPass);
    // @ts-expect-error borked typedefs
    renderPass = select(int(this.uniforms.effectAntiAliasing.mode).greaterThanEqual(0.5), smaa(renderPass), renderPass);
    return renderPass;
  }

  private convertBaseRenderPipelineIdentifier(id: BaseRenderPipelineIdentifier): number {
    switch (id) {
      case 'none':
        return 0;
      case 'pixelation':
        return 1;
      case 'retro':
        return 2;
    }
  }
}
