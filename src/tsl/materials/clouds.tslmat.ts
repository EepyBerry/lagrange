import { DataTexture, MeshStandardNodeMaterial, TextureNode, UniformArrayNode, Vector3, Vector4 } from 'three/webgpu'
import { Fn, positionLocal, texture, uniform, uniformArray, vec2, vec3, vec4 } from 'three/tsl'
import { type TSLMaterial } from './tsl-material'
import type PlanetData from '@/core/models/planet-data.model'
import { displace, warp } from '../features/lwd'
import { fbm3 } from '../noise/fbm3'
import type { UniformColorNode, UniformVector3Node, UniformVector4Node } from '../types'

export type CloudsUniforms = {
  flags: UniformArrayNode
  color: UniformColorNode
  noise: UniformVector4Node
  warping: UniformVector4Node
  displacement: {
    params: UniformVector3Node
    noise: UniformVector4Node
  }
  textures: TextureNode[]
}
export class CloudsTSLMaterial implements TSLMaterial<MeshStandardNodeMaterial, CloudsUniforms> {
  public readonly uniforms: CloudsUniforms

  constructor(data: PlanetData, textures: DataTexture[]) {
    this.uniforms = {
      flags: uniformArray([+data.cloudsShowWarping, +data.cloudsShowDisplacement]),
      color: uniform(data.cloudsColor),
      noise: uniform(
        new Vector4(
          data.cloudsNoise.frequency,
          data.cloudsNoise.amplitude,
          data.cloudsNoise.lacunarity,
          data.cloudsNoise.octaves,
        ),
        'vec4',
      ),
      warping: uniform(
        new Vector4(
          data.cloudsNoise.layers,
          data.cloudsNoise.xWarpFactor,
          data.cloudsNoise.yWarpFactor,
          data.cloudsNoise.zWarpFactor,
        ),
        'vec4',
      ),
      displacement: {
        params: uniform(
          new Vector3(
            data.cloudsDisplacement.factor,
            data.cloudsDisplacement.epsilon,
            data.cloudsDisplacement.multiplier,
          ),
          'vec3',
        ),
        noise: uniform(
          new Vector4(
            data.cloudsDisplacement.frequency,
            data.cloudsDisplacement.amplitude,
            data.cloudsDisplacement.lacunarity,
            data.cloudsDisplacement.octaves,
          ),
          'vec4',
        ),
      },
      textures: [texture(textures[0])],
    }
  }

  buildMaterial(): MeshStandardNodeMaterial {
    const mainNode = Fn(() => {
      // Constants
      const DVEC_A = vec3(0.1, 0.1, 0.0).toVar('DVEC_A')
      const DVEC_B = vec3(0.2, 0.2, 0.0).toVar('DVEC_B')

      // XYZ warping + displacement
      const vPos = vec3(warp(positionLocal, this.uniforms.warping, this.uniforms.flags.element(0))).toVar('vPos')
      vPos.assign(
        displace(
          vPos,
          this.uniforms.displacement.params,
          this.uniforms.displacement.noise,
          this.uniforms.flags.element(1),
        ),
      )

      // Clouds
      const fOpacity = vec3(
        fbm3(vPos, this.uniforms.noise),
        fbm3(vPos.add(DVEC_A), this.uniforms.noise),
        fbm3(vPos.add(DVEC_B), this.uniforms.noise),
      ).toVar('fOpacity')
      const opacity = vec3(fbm3(vPos.add(fOpacity), this.uniforms.noise)).toVar('opacity')
      opacity.assign(this.uniforms.textures[0].sample(vec2(opacity.x, 0.5)).xyz)
      return vec4(this.uniforms.color, opacity.x)
    }).setLayout({
      name: 'mainNode',
      type: 'vec4',
      inputs: [],
    })

    // init material & set outputs
    const material = new MeshStandardNodeMaterial()
    material.roughness = 1
    material.metalness = 0.5
    material.transparent = true
    material.colorNode = mainNode()
    return material
  }
}
