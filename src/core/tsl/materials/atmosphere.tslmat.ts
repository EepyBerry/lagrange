import { Color, NodeMaterial, type Vector3 } from 'three/webgpu'
import type { TSLMaterial } from './tsl-material'
import type { UniformColorNode, UniformNumberNode, UniformVector3Node } from '../tsl-types'
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
} from 'three/tsl'
import { applyInScatter, rayDirection, rayVsSphere } from '../utils/atmosphere-utils'
import { shiftHue, tintToMatrix, whitescale } from '../utils/color-utils'

export type AtmosphereData = {
  sunlight: {
    position: Vector3
    intensity: number
  }
  transform: {
    radius: number
    surfaceRadius: number
  }
  render: {
    density: number
    intensity: number
    colorMode: number
    hue: number
    tint: Color
  }
}
export type AtmosphereUniforms = {
  sunlight: {
    position: UniformVector3Node
    intensity: UniformNumberNode
  }
  transform: {
    radius: UniformNumberNode
    surfaceRadius: UniformNumberNode
  }
  render: {
    density: UniformNumberNode
    intensity: UniformNumberNode
    colorMode: UniformNumberNode
    hue: UniformNumberNode
    tint: UniformColorNode
  }
}
export class AtmosphereTSLMaterial implements TSLMaterial<NodeMaterial, AtmosphereData, AtmosphereUniforms> {
  public readonly uniforms: AtmosphereUniforms

  constructor(data: AtmosphereData) {
    this.uniforms = {
      sunlight: {
        position: uniform(data.sunlight.position, 'vec3').setName('uLightPosition'),
        intensity: uniform(data.sunlight.intensity, 'float').setName('uLightIntensity'),
      },
      transform: {
        radius: uniform(data.transform.radius).setName('uRadius'),
        surfaceRadius: uniform(data.transform.surfaceRadius).setName('uSurfaceRadius'),
      },
      render: {
        density: uniform(data.render.density).setName('uDensity'),
        intensity: uniform(data.render.intensity).setName('uIntensity'),
        colorMode: uniform(data.render.colorMode, 'int').setName('uColorMode'),
        hue: uniform(data.render.hue).setName('uHue'),
        tint: uniform(data.render.tint).setName('uTint'),
      },
    }
  }

  buildMaterial(): NodeMaterial {
    const fragmentNode = Fn(([posGeo, posWorld]: [UniformVector3Node, UniformVector3Node]) => {
      const eye = vec3(cameraPosition).toVar('eye')
      const rayDir = rayDirection(modelWorldMatrix, posGeo, eye).toVar('rayDir')
      const sunglightDir = vec3(normalize(this.uniforms.sunlight.position.sub(posWorld.xyz))).toVar('sunlightDir')
      
      const e = vec2(rayVsSphere(eye, rayDir, this.uniforms.transform.radius)).toVar('e')
      If(e.x.greaterThan(e.y), () => Discard())

      // find if the pixel is part of the surface
      const f = vec2(rayVsSphere(eye, rayDir, this.uniforms.transform.surfaceRadius)).toVar('f')
      e.y = min(e.y, f.x)

      // compute output values
      const I = vec4(
        applyInScatter(
          eye,
          rayDir,
          e,
          sunglightDir,
          this.uniforms.sunlight.intensity,
          vec3(this.uniforms.transform.radius, this.uniforms.transform.surfaceRadius, this.uniforms.render.density),
        ),
      ).toVar('I')
      //I.powAssign(vec4(1.0 / 2.2))
      const IShifted = vec4(shiftHue(I.xyz, this.uniforms.render.hue.mul(PI)), I.a).toVar('IShifted')
      const tint = vec4(this.uniforms.render.tint, 1.0).toVar('tint')

      const colorNode = vec4(0.0).toVar('colorNode')
      If(this.uniforms.render.colorMode.equal(int(0)), () => {
        colorNode.assign(IShifted.mul(this.uniforms.render.intensity))
      })
      If(this.uniforms.render.colorMode.equal(int(1)), () => {
        colorNode.assign(whitescale(I).mul(tintToMatrix(tint)).mul(this.uniforms.render.intensity))
      })
      If(this.uniforms.render.colorMode.equal(int(2)), () => {
        colorNode.assign(IShifted.mul(tint).mul(this.uniforms.render.intensity))
      })
      colorNode.a.clampAssign(0.0, 1.0)
      return colorNode
    }).setLayout({
      name: 'fragmentNode',
      type: 'vec4',
      inputs: [
        { name: 'posGeo', type: 'vec3' },
        { name: 'posWorld', type: 'vec3' },
      ],
    })

    // set colorNode depending on current color mode (realistic/direct/mixed)
    const material = new NodeMaterial()
    material.transparent = true
    material.depthWrite = false
    material.fragmentNode = fragmentNode(positionGeometry, positionWorld)
    return material
  }
}
