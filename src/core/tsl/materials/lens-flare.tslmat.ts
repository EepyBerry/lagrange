import type { Color, Vector3 } from 'three'
import { AdditiveBlending, NodeMaterial, Vector2 } from 'three/webgpu'
import type { TSLMaterial } from './tsl-material'
import type { UniformColorNode, UniformNumberNode, UniformVector2Node, UniformVector3Node } from '../types'
import {
  float,
  Fn,
  positionGeometry,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
} from 'three/tsl'
import { lensFlare } from '../features/lens-flare'

export type LensFlareData = {
  lensPosition: Vector3
  colorGain: Color
  starPoints: number
  starPointsIntensity: number
  glareSize: number
  glareIntensity: number
  flareShape: number
  flareSize: number
  additionalStreaks: boolean
  streaksScale: number
}
export type LensFlareUniforms = {
  resolution: UniformVector2Node
  opacity: UniformNumberNode
  lensPosition: UniformVector3Node
  colorGain: UniformColorNode
  starPoints: UniformNumberNode
  starPointsIntensity: UniformNumberNode
  glareSize: UniformNumberNode
  glareIntensity: UniformNumberNode
  flareShape: UniformNumberNode
  flareSize: UniformNumberNode
  additionalStreaks: UniformNumberNode
  streaksScale: UniformNumberNode
}
export class LensFlareTSLMaterial implements TSLMaterial<NodeMaterial, LensFlareData, LensFlareUniforms> {
  public readonly uniforms: LensFlareUniforms

  constructor(data: LensFlareData) {
    this.uniforms = {
      resolution: uniform(new Vector2(window.innerWidth, window.innerHeight), 'vec2').label('uResolution'),
      opacity: uniform(1, 'float').label('uOpacity'),
      lensPosition: uniform(data.lensPosition.clone(), 'vec2').label('uPosition'),
      colorGain: uniform(data.colorGain, 'vec3').label('uColorGain'),
      starPoints: uniform(2, 'float').label('uStarPoints'),
      starPointsIntensity: uniform(data.starPointsIntensity, 'float').label('uStarPointsIntensity'),
      glareSize: uniform(0.025, 'float').label('uGlareSize'),
      glareIntensity: uniform(data.glareIntensity, 'float').label('uGlareIntensity'),
      flareShape: uniform(data.flareShape, 'float').label('uFlareShape'),
      flareSize: uniform(data.flareSize, 'float').label('uFlareSize'),
      additionalStreaks: uniform(+data.additionalStreaks, 'int').label('uAdditionalStreaks'),
      streaksScale: uniform(data.streaksScale, 'float').label('uStreakScale'),
    }
  }

  buildMaterial(): NodeMaterial {
    // Precompute UV
    const uvReduced = uv().sub(0.5).toVar('uvReduced')
    const localUv = vec2(
      uvReduced.x,
      uvReduced.y.mul(this.uniforms.resolution.y.div(this.uniforms.resolution.x)),
    ).toVar('lfUV')

    // Get mouse coords from lens position
    const halfLensPos = this.uniforms.lensPosition.mul(0.5).toVar('halfLensPos')
    const mouse = vec2(
      halfLensPos.x,
      halfLensPos.y.mul(float(this.uniforms.resolution.y).div(this.uniforms.resolution.x)),
    ).toVar('mouse')

    const flareParams = vec2(this.uniforms.flareShape, this.uniforms.flareSize).toVar('flareParams')
    const glareParams = vec2(this.uniforms.glareSize, this.uniforms.glareIntensity).toVar('glareParams')
    const starPointsparams = vec2(this.uniforms.starPoints, this.uniforms.starPointsIntensity).toVar('starPointsParams')
    const finalColor = vec3(
      lensFlare(localUv, mouse, flareParams, glareParams, starPointsparams)
        .mul(20.0)
        .mul(this.uniforms.colorGain)
        .div(2),
    ).toVar('finalColor')

    /* if (this.uniforms.additionalStreaks.value > 0) {
      const circColor = vec3(0.9, 0.2, 0.1).toVar('circColor')

      Loop({ start: 0, end: 10, condition: '<' }, ({ i }) => {
        finalColor.addAssign(
          circle(
            localUv,
            pow(rndf(float(i).mul(2000)).mul(2.8), 0.1).add(1.41),
            0.0,
            circColor.add(i),
            rndf(float(i).mul(20))
              .mul(3)
              .add(0.2 - 0.5),
            this.uniforms.lensPosition.xy,
            this.uniforms.streaksScale,
            this.uniforms.colorGain,
          ),
        )
      })
    } */

    // init material & set outputs
    const material = new NodeMaterial()
    material.vertexNode = Fn(() => vec4(positionGeometry, 1.0))()
    material.colorNode = vec4(finalColor, this.uniforms.opacity)
    material.transparent = true
    material.depthWrite = false
    material.depthTest = false
    material.blending = AdditiveBlending
    material.name = 'LensFlareShader'
    return material
  }
}
