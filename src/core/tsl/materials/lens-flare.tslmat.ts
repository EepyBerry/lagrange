import type { Color, Vector3 } from 'three'
import { AdditiveBlending, NodeMaterial, Vector2 } from 'three/webgpu'
import type { TSLMaterial } from './tsl-material'
import type { UniformColorNode, UniformNumberNode, UniformVector2Node, UniformVector3Node } from '../types'
import { float, Fn, If, Loop, positionGeometry, pow, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import { circle, lensFlare, rndf } from '../features/lens-flare'

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
      resolution: uniform(new Vector2(window.innerWidth, window.innerHeight), 'vec2').setName('uResolution'),
      opacity: uniform(1, 'float').setName('uOpacity'),
      lensPosition: uniform(data.lensPosition.clone(), 'vec2').setName('uPosition'),
      colorGain: uniform(data.colorGain).setName('uColorGain'),
      starPoints: uniform(2, 'float').setName('uStarPoints'),
      starPointsIntensity: uniform(data.starPointsIntensity, 'float').setName('uStarPointsIntensity'),
      glareSize: uniform(0.025, 'float').setName('uGlareSize'),
      glareIntensity: uniform(data.glareIntensity, 'float').setName('uGlareIntensity'),
      flareShape: uniform(data.flareShape, 'float').setName('uFlareShape'),
      flareSize: uniform(data.flareSize, 'float').setName('uFlareSize'),
      additionalStreaks: uniform(+data.additionalStreaks, 'int').setName('uAdditionalStreaks'),
      streaksScale: uniform(data.streaksScale, 'float').setName('uStreakScale'),
    }
  }

  buildMaterial(): NodeMaterial {
    // Precompute UV
    const mainNode = Fn(([vUv]: [UniformVector2Node]) => {
      const localUv = vUv.sub(0.5).toVar('lfUV')
      localUv.y.mulAssign(this.uniforms.resolution.y.div(this.uniforms.resolution.x))

      // Get mouse coords from lens position
      const mouse = this.uniforms.lensPosition.mul(0.5).toVar('mouse')
      mouse.y.mulAssign(float(this.uniforms.resolution.y).div(this.uniforms.resolution.x))

      const flareParams = vec2(this.uniforms.flareShape, this.uniforms.flareSize).toVar('flareParams')
      const glareParams = vec2(this.uniforms.glareSize, this.uniforms.glareIntensity).toVar('glareParams')
      const starPointsParams = vec2(this.uniforms.starPoints, this.uniforms.starPointsIntensity).toVar(
        'starPointsParams',
      )
      const finalColor = vec3(
        lensFlare(localUv, mouse, flareParams, glareParams, starPointsParams)
          .mul(20.0)
          .mul(this.uniforms.colorGain)
          .div(2),
      ).toVar('finalColor')

      If(this.uniforms.additionalStreaks.greaterThan(0), () => {
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
      })

      return vec4(finalColor, this.uniforms.opacity)
    })

    // init material & set outputs
    const material = new NodeMaterial()
    material.vertexNode = Fn(() => vec4(positionGeometry, 1.0))()
    material.fragmentNode = mainNode(uv())
    material.transparent = true
    material.depthWrite = false
    material.depthTest = false
    material.blending = AdditiveBlending
    material.name = 'LensFlareShader'
    return material
  }
}
