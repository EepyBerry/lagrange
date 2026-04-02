import type { Color, Vector3 } from 'three';
import { float, Fn, If, Loop, positionGeometry, pow, uniform, uv, vec2, vec3, vec4 } from 'three/tsl';
import { AdditiveBlending, Node, NodeMaterial, UniformNode, Vector2 } from 'three/webgpu';
import { circle, lensFlare, rndf } from '../features/lens-flare';
import { TSLMaterial } from './tsl-material';

export type LensFlareData = {
  lensPosition: Vector3;
  colorGain: Color;
  starPoints: number;
  starPointsIntensity: number;
  glareSize: number;
  glareIntensity: number;
  flareShape: number;
  flareSize: number;
  additionalStreaks: boolean;
  streaksScale: number;
};
export type LensFlareUniforms = {
  resolution: UniformNode<'vec2', Vector2>;
  opacity: UniformNode<'float', number>;
  lensPosition: UniformNode<'vec3', Vector3>;
  colorGain: UniformNode<'color', Color>;
  starPoints: UniformNode<'float', number>;
  starPointsIntensity: UniformNode<'float', number>;
  glareSize: UniformNode<'float', number>;
  glareIntensity: UniformNode<'float', number>;
  flareShape: UniformNode<'float', number>;
  flareSize: UniformNode<'float', number>;
  additionalStreaks: UniformNode<'float', number>;
  streaksScale: UniformNode<'float', number>;
};
export class LensFlareTSLMaterial extends TSLMaterial<NodeMaterial, LensFlareData, LensFlareUniforms> {
  uniformize(data: LensFlareData): LensFlareUniforms {
    return {
      resolution: uniform(new Vector2(window.innerWidth, window.innerHeight)).setName('uResolution'),
      opacity: uniform(1).setName('uOpacity'),
      lensPosition: uniform(data.lensPosition.clone()).setName('uPosition'),
      colorGain: uniform(data.colorGain).setName('uColorGain'),
      starPoints: uniform(2).setName('uStarPoints'),
      starPointsIntensity: uniform(data.starPointsIntensity, 'float').setName('uStarPointsIntensity'),
      glareSize: uniform(0.025).setName('uGlareSize'),
      glareIntensity: uniform(data.glareIntensity).setName('uGlareIntensity'),
      flareShape: uniform(data.flareShape).setName('uFlareShape'),
      flareSize: uniform(data.flareSize).setName('uFlareSize'),
      additionalStreaks: uniform(+data.additionalStreaks).setName('uAdditionalStreaks'),
      streaksScale: uniform(data.streaksScale).setName('uStreakScale'),
    };
  }

  buildMaterial(): NodeMaterial {
    // Precompute UV
    const mainNode = Fn(([vUv]: [Node<'vec2'>]) => {
      const localUv = vUv.sub(0.5).toVar('lfUV');
      localUv.y.mulAssign(this.uniforms.resolution.y.div(this.uniforms.resolution.x));

      // Get mouse coords from lens position
      const mouse = this.uniforms.lensPosition.mul(0.5).toVar('mouse');
      mouse.y.mulAssign(float(this.uniforms.resolution.y).div(this.uniforms.resolution.x));

      const flareParams = vec2(this.uniforms.flareShape, this.uniforms.flareSize).toVar('flareParams');
      const glareParams = vec2(this.uniforms.glareSize, this.uniforms.glareIntensity).toVar('glareParams');
      const starPointsParams = vec2(this.uniforms.starPoints, this.uniforms.starPointsIntensity).toVar(
        'starPointsParams',
      );
      const finalColor = vec3(
        lensFlare(localUv, mouse, flareParams, glareParams, starPointsParams)
          .mul(20)
          .mul(this.uniforms.colorGain)
          .div(2),
      ).toVar('finalColor');

      If(this.uniforms.additionalStreaks.greaterThan(0), () => {
        const circColor = vec3(0.9, 0.2, 0.1).toVar('circColor');
        Loop({ start: 0, end: 10, condition: '<' }, ({ i }) => {
          finalColor.addAssign(
            circle(
              localUv,
              pow(rndf(float(i).mul(2000)).mul(2.8), 0.1).add(1.41),
              0,
              circColor.add(vec3(i)),
              rndf(float(i).mul(20))
                .mul(3)
                .add(0.2 - 0.5),
              this.uniforms.lensPosition.xy,
              this.uniforms.streaksScale,
              this.uniforms.colorGain,
            ),
          );
        });
      });

      return vec4(finalColor, this.uniforms.opacity);
    });

    // init material & set outputs
    const material = new NodeMaterial();
    material.vertexNode = Fn(() => vec4(positionGeometry, 1))();
    material.colorNode = mainNode(uv());
    material.transparent = true;
    material.depthWrite = false;
    material.depthTest = false;
    material.blending = AdditiveBlending;
    material.name = 'LensFlareShader';
    return material;
  }
}
