import { NodeMaterial, type Vector3 } from 'three/webgpu'
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
  int,
  min,
  modelViewMatrix,
  normalize,
  PI,
  positionGeometry,
  positionWorld,
  uniform,
  vec2,
  vec3,
  vec4,
} from 'three/tsl'
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
        position: uniform(sunPosition, 'vec3').label('uLightPosition'),
        intensity: uniform(data.sunLightIntensity, 'float').label('uLightIntensity'),
      },
      transform: {
        radius: uniform(1.0 + (data.atmosphereHeight / heightDivider)).label('uRadius'),
        surfaceRadius: uniform(data.planetRadius).label('uSurfaceRadius'),
      },
      render: {
        density: uniform(data.atmosphereDensityScale / heightDivider).label('uDensity'),
        intensity: uniform(data.atmosphereIntensity).label('uIntensity'),
        colorMode: uniform(data.atmosphereColorMode, 'int').label('uColorMode'),
        hue: uniform(data.atmosphereHue).label('uHue'),
        tint: uniform(data.atmosphereTint).label('uTint'),
      },
    }
  }

  buildMaterial(): NodeMaterial {
    const fragmentNode = Fn(() => {
      // ---------------- VERTEX STAGE ----------------
      const clipSpacePos = cameraProjectionMatrix
        .mul(modelViewMatrix)
        .mul(vec4(positionGeometry, 1.0))
        .toVar('clipSpacePos')
      const ndc = div(clipSpacePos.xyz, clipSpacePos.w).toVar('ndc')
      const clipRay = vec4(ndc.x, ndc.y, -1.0, 1.0).toVar('clipRay')
      const inverseRay = cameraProjectionMatrixInverse.mul(clipRay).toVar('inverseRay')
      const viewRay = vec3(inverseRay.x, inverseRay.y, -1.0).toVar('viewRay')

      // --------------- FRAGMENT STAGE ---------------
      const worldRay = vec4(inverseMat4(cameraViewMatrix).mul(vec4(viewRay, 0.0))).toVar('worldRay')
      const rayDir = vec3(normalize(worldRay.xyz)).toVar('rayDir')
      const eye = vec3(positionWorld.xyz).toVar('eye')
      const sunglightDir = vec3(normalize(this.uniforms.sunlight.position.sub(positionWorld.xyz))).toVar('sunlightDir')
      const e = vec2(rayVsSphere(eye, rayDir, this.uniforms.transform.radius)).toVar('e')

      // if e.X > e.Y, something went horribly wrong so exit early
      If(e.x.greaterThan(e.y), () => vec4(0.0))

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
      //return vec4(linearToSRGB(colorNode.rgb), colorNode.a)
      return colorNode
    }).setLayout({
      name: 'fragmentNode',
      type: 'vec4',
      inputs: [],
    })

    // set colorNode depending on current color mode (realistic/direct/mixed)
    const material = new NodeMaterial()
    material.transparent = true
    material.depthWrite = false
    material.fragmentNode = fragmentNode()
    return material
  }
}
