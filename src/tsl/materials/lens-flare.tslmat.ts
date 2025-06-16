import type { Color, Vector3 } from 'three'
import { NodeMaterial } from 'three/webgpu'
import type { TSLMaterial } from './tsl-material'
import type { UniformColorNode, UniformNumberNode, UniformVector3Node } from '../types'
import { float, Fn, If, Loop, pow, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import { lensFlare, circle, rndf } from '../features/lens-flare'

export type LensFlareData = {
  position: Vector3
  colorGain: Color
  starPointsIntensity: number
  glareIntensity: number
  flareSize: number
  flareSpeed: number
  flareShape: number
  additionalStreaks: boolean
  streaksScale: number
}
export type LensFlareUniforms = {
  position: UniformVector3Node
  colorGain: UniformColorNode
  starPointsIntensity: UniformNumberNode
  glareIntensity: UniformNumberNode
  flareSize: UniformNumberNode
  flareShape: UniformNumberNode
  additionalStreaks: UniformNumberNode
  streaksScale: UniformNumberNode
}
export class RingTSLMaterial implements TSLMaterial<NodeMaterial, LensFlareData, LensFlareUniforms> {
  public readonly uniforms: LensFlareUniforms

  constructor(data: LensFlareData) {
    this.uniforms = {
      position: uniform(data.position, 'vec3').label('uPosition'),
      colorGain: uniform(data.colorGain, 'vec3').label('uColorGain'),
      starPointsIntensity: uniform(data.starPointsIntensity, 'float').label('uStarPointsIntensity'),
      glareIntensity: uniform(data.glareIntensity, 'float').label('uGlareIntensity'),
      flareSize: uniform(data.flareSize, 'float').label('uFlareSize'),
      flareShape: uniform(data.flareShape, 'float').label('uFlareShape'),
      additionalStreaks: uniform(+data.additionalStreaks, 'int').label('uAdditionalStreaks'),
      streaksScale: uniform(data.streaksScale, 'float').label('uStreakScale')
    }
  }

  buildMaterial(): NodeMaterial {
    const mainNode = Fn(() => {
      const lfUV = vec2(uv().sub(0.5)).toVar('lfUV')
      lfUV.y.mulAssign(iResolution.y.div(iResolution.x))
      const mouse = vec2(this.uniforms.position.mul(0.5)).toVar()
      mouse.y.mulAssign(iResolution.y.div(iResolution.x))
      const finalColor = vec3(lensFlare(lfUV, mouse).mul(20.0).mul(this.uniforms.colorGain).div(2)).toVar()

      If(this.uniforms.additionalStreaks.greaterThan(0), () => {
        const circColor = vec3(0.9, 0.2, 0.1).toVar()
        const circColor2 = vec3(0.3, 0.1, 0.9).toVar()

        Loop({ start: 0, end: 10, condition: '<' }, ({ i }) => {
          finalColor.addAssign(
            circle(
              lfUV,
              pow(rndf(float(i).mul(2000)).mul(2.8), 0.1).add(1.41),
              0.0,
              circColor.add(i),
              circColor2.add(i),
              rndf(float(i).mul(20))
                .mul(3)
                .add(0.2 - 0.5),
              this.uniforms.position,
            ),
          )
        })
      })

      return vec4(finalColor, 1.0)
    }).setLayout({
      name: 'mainNode',
      type: 'vec4',
      inputs: [],
    })

    // init material & set outputs
    const material = new NodeMaterial()
    material.fragmentNode = mainNode()
    return material
  }
}
