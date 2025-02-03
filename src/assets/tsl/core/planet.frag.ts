import type { TSLFragmentShader } from '@/core/helpers/tsl.helper';
import { LG_PLANET_DATA } from '@/core/services/planet-editor.service';
import { float, int, struct, uniform, vec3 } from 'three/tsl'
import type { DataTexture, MeshStandardNodeMaterial } from 'three/webgpu';
import { fbm3 } from '../functions/fbm.func';

/* const StructDisplacement = struct({
  factor: 'float',
  epsilon: 'float',
  multiplier: 'float',

  frequency: 'float',
  amplitude: 'float',
  lacunarity: 'float',
  octaves: 'int'
}) */
const StructNoise = struct({
  frequency: 'float',
  amplitude: 'float',
  lacunarity: 'float',
  octaves: 'int',

  layers: 'int',
  warpFactor: 'vec3',
}, 'structNoise')

export class TSLPlanetFragment implements TSLFragmentShader {

  // Size & PBR uniforms
  private uRadius = uniform(LG_PLANET_DATA.value.planetRadius)
  private uPBRParams = uniform({
    waterLevel: LG_PLANET_DATA.value.planetWaterLevel,
    waterRoughness: LG_PLANET_DATA.value.planetWaterRoughness,
    waterMetalness: LG_PLANET_DATA.value.planetWaterMetalness,
    groundRoughness: LG_PLANET_DATA.value.planetGroundRoughness,
    groundMetalness: LG_PLANET_DATA.value.planetGroundMetalness,
  })
  private uSurfaceNoise = uniform(StructNoise([
    float(LG_PLANET_DATA.value.planetSurfaceNoise.frequency),
    float(LG_PLANET_DATA.value.planetSurfaceNoise.amplitude),
    float(LG_PLANET_DATA.value.planetSurfaceNoise.lacunarity),
    float(LG_PLANET_DATA.value.planetSurfaceNoise.octaves),
    int(LG_PLANET_DATA.value.planetSurfaceNoise.layers),
    vec3(LG_PLANET_DATA.value.planetSurfaceNoise.warpFactor)
  ]))

  /* // Noise uniforms
  private uWarp = uniform(LG_PLANET_DATA.value.planetSurfaceShowWarping)
  private uDisplace = uniform(LG_PLANET_DATA.value.planetSurfaceShowDisplacement)
  private uSurfaceDisplacement = uniform(LG_PLANET_DATA.value.planetSurfaceDisplacement)
  private uSurfaceNoise = uniform(LG_PLANET_DATA.value.planetSurfaceNoise)
  
  // Bump uniforms
  private uBump = uniform(LG_PLANET_DATA.value.planetSurfaceShowBumps)
  private uBumpStrength = uniform(LG_PLANET_DATA.value.planetSurfaceBumpStrength)
  private uBumpOffset = uniform(0.005)
  
  // Biome uniforms
  private uBiomes = uniform(LG_PLANET_DATA.value.biomesEnabled)
  private uTempNoise = uniform(LG_PLANET_DATA.value.biomesTemperatureNoise)
  private uHumiNoise = uniform(LG_PLANET_DATA.value.biomesHumidityNoise) */
  private uBiomesTex: DataTexture

  /* private applyBiomes: ShaderNodeFn<TSLFnParams> = Fn<TSLFnParams>(([i_temp, i_humi, i_color]) => {
    const color = vec3( i_color ).toVar()
    const h = float( i_humi ).toVar()
    const t = float( i_temp ).toVar()
    const biomeColor = vec3( color ).toVar()
    const texCoord = vec2( h, t ).toVar()
    const texel = vec4( texture( this.uBiomesTex, texCoord ) ).toVar()
    biomeColor.assign( mix( color, texel.xyz, texel.w ) )
  
    return biomeColor
  }) */

  constructor(biomesTex: DataTexture) {
    this.uBiomesTex = biomesTex
  }

  runFragment(mat: MeshStandardNodeMaterial): void {
    //const height = fbm3(vPos, this.uRadius, noise.amp, noise.lac, noise.oct)
  }
}