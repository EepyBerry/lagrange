import { Node, NodeMaterial, type Vector3 } from 'three/webgpu'
import type { TSLMaterial } from './tsl-material'
import type { UniformColorNode, UniformNumberNode, UniformVector3Node } from '../types'
import type PlanetData from '@/core/models/planet-data.model'
import {
  cameraProjectionMatrix,
  cameraProjectionMatrixInverse,
  cameraViewMatrix,
  div,
  Fn,
  If,
  min,
  modelViewMatrix,
  normalize,
  PI,
  positionLocal,
  positionWorld,
  pow,
  uniform,
  vec2,
  vec3,
  vec4,
} from 'three/tsl'
import { type ShaderNodeObject } from 'three/src/nodes/TSL.js'
import { applyInScatter, rayVsSphere } from '../utils/atmosphere.tslutil'
import { inverseMat4 } from '../utils/math.tslutil'
import { shiftHue, tintToMatrix, whitescale } from '../utils/color.tslutil'

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
export class AtmosphereTSLMaterial implements TSLMaterial<NodeMaterial, AtmosphereUniforms> {
  public readonly uniforms: AtmosphereUniforms

  constructor(data: PlanetData, sunPosition: Vector3, heightDivider: number) {
    this.uniforms = {
      sunlight: {
        position: uniform(sunPosition, 'vec3'),
        intensity: uniform(data.sunLightIntensity, 'float'),
      },
      transform: {
        radius: uniform(1.0 + data.atmosphereHeight / heightDivider),
        surfaceRadius: uniform(data.planetRadius),
      },
      render: {
        density: uniform(data.atmosphereDensityScale / heightDivider),
        intensity: uniform(data.atmosphereIntensity),
        colorMode: uniform(data.atmosphereColorMode, 'int'),
        hue: uniform(data.atmosphereHue),
        tint: uniform(data.atmosphereTint),
      },
    }
  }

  build(): NodeMaterial {
    const buildFragmentNode = Fn(([i_localpos, i_worldpos]: ShaderNodeObject<Node>[]) => {
      // ---------------- VERTEX STAGE ----------------
      const clipSpacePos = cameraProjectionMatrix.mul(modelViewMatrix).mul(vec4(i_localpos, 1.0)).toVar('clipSpacePos')
      const ndc = div(clipSpacePos.xyz, clipSpacePos.w).toVar('ndc')
      const clipRay = vec4(ndc.x, ndc.y, -1.0, 1.0).toVar('clipRay')
      const inverseRay = cameraProjectionMatrixInverse.mul(clipRay).toVar('inverseRay')
      const viewRay = vec3(inverseRay.x, inverseRay.y, -1.0).toVar('viewRay')

      // --------------- FRAGMENT STAGE ---------------
      const worldRay = vec4(inverseMat4(cameraViewMatrix).mul(vec4(viewRay, 0.0))).toVar('worldRay')
      const rayDir = vec3(normalize(worldRay.xyz)).toVar()
      const eye = vec3(i_worldpos.xyz).toVar()
      const sunglightDir = vec3(normalize(this.uniforms.sunlight.position.sub(i_worldpos.xyz))).toVar()
      const e = vec2(rayVsSphere(eye, rayDir, this.uniforms.transform.radius)).toVar()

      // if e.X > e.Y, something went horribly wrong so exit early
      //e.x.greaterThan(e.y).discard()

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
      const I_gamma = vec4(pow(I, vec4(1.0 / 2.2))).toVar('I_gamma')
      const I_shifted = vec4(shiftHue(I_gamma.xyz, this.uniforms.render.hue.mul(PI)), I_gamma.a).toVar('I_shifted')
      const tint = vec4(this.uniforms.render.tint, 1.0).toVar('tint')

      let colorNode = vec4(0.0)
      If(this.uniforms.render.colorMode.equal(0), () => {
        colorNode = I_shifted.mul(this.uniforms.render.intensity)
      })
      .ElseIf(this.uniforms.render.colorMode.equal(1), () => {
        colorNode = whitescale(I_gamma).mul(tintToMatrix(tint)).mul(this.uniforms.render.intensity)
      })
      .Else(() => {
        colorNode = I_shifted.mul(tint).mul(this.uniforms.render.intensity)
      })
      return colorNode
    }).setLayout({
      name: 'buildFragmentNode',
      inputs: [{ type: 'vec3', name: 'i_localpos' }, { type: 'vec3', name: 'i_worldpos' }],
      type: 'vec4'
    })
    
    // set colorNode depending on current color mode (realistic/direct/mixed)
    const material = new NodeMaterial()
    material.transparent = true
    material.depthWrite = false
    material.fragmentNode = buildFragmentNode(positionLocal, positionWorld)
    return material
  }
}
