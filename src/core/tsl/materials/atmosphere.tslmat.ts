import {
  cameraPosition,
  Discard,
  Fn,
  If,
  int,
  min,
  modelWorldMatrix,
  normalize,
  PI,
  positionGeometry,
  positionWorld,
  uniform,
  vec2,
  vec3,
  vec4,
} from 'three/tsl';
import { Color, Node, NodeMaterial, UniformNode, type Vector3 } from 'three/webgpu';
import { applyInScatter, rayDirection, rayVsSphere } from '../utils/atmosphere-utils';
import { shiftHue, tintToMatrix, whitescale } from '../utils/color-utils';
import { TSLMaterial } from './tsl-material';

export type AtmosphereUniformsData = {
  sunlight: {
    position: Vector3;
    intensity: number;
  };
  transform: {
    radius: number;
    surfaceRadius: number;
  };
  render: {
    density: number;
    intensity: number;
    colorMode: number;
    hue: number;
    tint: Color;
    advanced: {
      mieScatteringConstant: number;
      rayleighDensityRatio: number;
      mieDensityRatio: number;
      opticalDensityRatio: number;
    };
  };
};
export type AtmosphereUniforms = {
  sunlight: {
    position: UniformNode<'vec3', Vector3>;
    intensity: UniformNode<'float', number>;
  };
  transform: {
    radius: UniformNode<'float', number>;
    surfaceRadius: UniformNode<'float', number>;
  };
  render: {
    density: UniformNode<'float', number>;
    intensity: UniformNode<'float', number>;
    colorMode: UniformNode<'float', number>;
    hue: UniformNode<'float', number>;
    tint: UniformNode<'color', Color>;
    advanced: {
      mieScatteringConstant: UniformNode<'float', number>;
      rayleighDensityRatio: UniformNode<'float', number>;
      mieDensityRatio: UniformNode<'float', number>;
      opticalDensityRatio: UniformNode<'float', number>;
    };
  };
};
export class AtmosphereTSLMaterial extends TSLMaterial<NodeMaterial, AtmosphereUniformsData, AtmosphereUniforms> {
  uniformize(data: AtmosphereUniformsData): AtmosphereUniforms {
    return {
      sunlight: {
        position: uniform(data.sunlight.position).setName('uLightPosition'),
        intensity: uniform(data.sunlight.intensity).setName('uLightIntensity'),
      },
      transform: {
        radius: uniform(data.transform.radius).setName('uRadius'),
        surfaceRadius: uniform(data.transform.surfaceRadius).setName('uSurfaceRadius'),
      },
      render: {
        density: uniform(data.render.density).setName('uDensity'),
        intensity: uniform(data.render.intensity).setName('uIntensity'),
        colorMode: uniform(data.render.colorMode).setName('uColorMode'),
        hue: uniform(data.render.hue).setName('uHue'),
        tint: uniform(data.render.tint).setName('uTint'),
        advanced: {
          mieScatteringConstant: uniform(data.render.advanced.mieScatteringConstant).setName('uMieScatteringConstant'),
          rayleighDensityRatio: uniform(data.render.advanced.rayleighDensityRatio).setName('uRayleighDensityRatio'),
          mieDensityRatio: uniform(data.render.advanced.mieDensityRatio).setName('uMieDensityRatio'),
          opticalDensityRatio: uniform(data.render.advanced.opticalDensityRatio).setName('uOpticalDensityRatio'),
        },
      },
    };
  }

  buildMaterial(): NodeMaterial {
    const fragmentNode = Fn(([posGeo, posWorld]: [Node<'vec3'>, Node<'vec3'>]) => {
      const eye = vec3(cameraPosition).toVar('eye');
      const rayDir = rayDirection(modelWorldMatrix, posGeo, eye).toVar('rayDir');
      const sunglightDir = vec3(normalize(this.uniforms.sunlight.position.sub(posWorld.xyz))).toVar('sunlightDir');

      const e = vec2(rayVsSphere(eye, rayDir, this.uniforms.transform.radius)).toVar('e');
      If(e.x.greaterThan(e.y), () => Discard());

      // find if the pixel is part of the surface
      const f = vec2(rayVsSphere(eye, rayDir, this.uniforms.transform.surfaceRadius)).toVar('f');
      e.y = min(e.y, f.x);

      // compute output values
      const I = vec4(
        applyInScatter(
          eye,
          rayDir,
          e,
          vec4(sunglightDir, this.uniforms.sunlight.intensity),
          vec3(this.uniforms.transform.radius, this.uniforms.transform.surfaceRadius, this.uniforms.render.density),
          vec4(
            this.uniforms.render.advanced.mieScatteringConstant,
            this.uniforms.render.advanced.rayleighDensityRatio,
            this.uniforms.render.advanced.mieDensityRatio,
            this.uniforms.render.advanced.opticalDensityRatio,
          ),
        ),
      ).toVar('I');
      //I.powAssign(vec4(1 / 2.2))
      const IShifted = vec4(shiftHue(I.xyz, this.uniforms.render.hue.mul(PI)), I.a).toVar('IShifted');
      const tint = vec4(this.uniforms.render.tint, 1).toVar('tint');

      const colorNode = vec4(0).toVar('colorNode');
      If(this.uniforms.render.colorMode.equal(int(0)), () => {
        colorNode.assign(IShifted.mul(this.uniforms.render.intensity));
      });
      If(this.uniforms.render.colorMode.equal(int(1)), () => {
        colorNode.assign(whitescale(I).mul(tintToMatrix(tint)).mul(this.uniforms.render.intensity));
      });
      If(this.uniforms.render.colorMode.equal(int(2)), () => {
        colorNode.assign(IShifted.mul(tint).mul(this.uniforms.render.intensity));
      });
      colorNode.a = colorNode.a.clamp(0, 1);
      return colorNode;
    }).setLayout({
      name: 'fragmentNode',
      type: 'vec4',
      inputs: [
        { name: 'posGeo', type: 'vec3' },
        { name: 'posWorld', type: 'vec3' },
      ],
    });

    // set colorNode depending on current color mode (realistic/direct/mixed)
    const material = new NodeMaterial();
    material.transparent = true;
    material.depthWrite = false;
    material.fragmentNode = fragmentNode(positionGeometry, positionWorld);
    return material;
  }
}
