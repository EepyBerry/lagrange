import type { Color, Vector3 } from 'three'
import { AdditiveBlending, NodeMaterial, Vector2 } from 'three/webgpu'
import type { TSLMaterial } from './tsl-material'
import type { UniformColorNode, UniformNumberNode, UniformVector2Node, UniformVector3Node } from '../types'
import { float, Fn, If, Loop, pow, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import { lensFlare, circle, rndf } from '../features/lens-flare'

export type LensFlareData = {
  position: Vector3
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
  position: UniformVector3Node
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
      position: uniform(data.position, 'vec3').label('uPosition'),
      colorGain: uniform(data.colorGain, 'vec3').label('uColorGain'),
      starPoints: uniform(2, 'float').label('uStarPoints'),
      starPointsIntensity: uniform(data.starPointsIntensity, 'float').label('uStarPointsIntensity'),
      glareSize: uniform(0.025, 'float').label('uGlareSize'),
      glareIntensity: uniform(data.glareIntensity, 'float').label('uGlareIntensity'),
      flareShape: uniform(data.flareShape, 'float').label('uFlareShape'),
      flareSize: uniform(data.flareSize, 'float').label('uFlareSize'),
      additionalStreaks: uniform(+data.additionalStreaks, 'int').label('uAdditionalStreaks'),
      streaksScale: uniform(data.streaksScale, 'float').label('uStreakScale')
    }
  }

  buildMaterial(): NodeMaterial {
    const mainNode = Fn(() => {
      const localUv = vec2(uv().sub(0.5)).toVar('lfUV')
      localUv.y.mulAssign(this.uniforms.resolution.y.div(this.uniforms.resolution.x))
      const mouse = vec2(this.uniforms.position.mul(0.5)).toVar('mouse')
      mouse.y.mulAssign(float(this.uniforms.resolution.y).div(this.uniforms.resolution.x))

      const flareParams = vec2(this.uniforms.flareShape, this.uniforms.flareSize).toVar('flareParams')
      const glareParams = vec2(this.uniforms.glareSize, this.uniforms.glareIntensity).toVar('glareParams')
      const starPointsparams = vec2(this.uniforms.starPoints, this.uniforms.starPointsIntensity).toVar(
        'starPointsParams',
      )
      const finalColor = vec3(
        lensFlare(localUv, mouse, flareParams, glareParams, starPointsparams)
          .mul(20.0)
          .mul(this.uniforms.colorGain)
          .div(2),
      ).toVar('finalColor')

      If(this.uniforms.additionalStreaks.greaterThan(0), () => {
        const circColor = vec3(0.9, 0.2, 0.1).toVar('circColor')
        const circColor2 = vec3(0.3, 0.1, 0.9).toVar('circColor2')

        Loop({ start: 0, end: 10, condition: '<' }, ({ i }) => {
          finalColor.addAssign(
            circle(
              localUv,
              pow(rndf(float(i).mul(2000)).mul(2.8), 0.1).add(1.41),
              0.0,
              circColor.add(i),
              circColor2.add(i),
              rndf(float(i).mul(20))
                .mul(3)
                .add(0.2 - 0.5),
              this.uniforms.streaksScale,
              this.uniforms.colorGain,
            ),
          )
        })
      })
      return vec4(finalColor, this.uniforms.opacity)
    }).setLayout({
      name: 'mainNode',
      type: 'vec4',
      inputs: [],
    })

    // init material & set outputs
    const material = new NodeMaterial()
    material.fragmentNode = mainNode()
    material.transparent = true
    material.depthTest = false
    material.depthWrite = false
    material.blending = AdditiveBlending
    material.name = 'LensFlareShader'
    return material
  }
}
