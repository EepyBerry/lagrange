import { voronoi3 } from '@tsl/noise/voronoi3.ts';
import { sampleSobel, sobel } from '@tsl/utils/sobel.tsl.ts';
import { flattenUV } from '@tsl/utils/vertex.tsl.ts';
import {
  bitangentLocal,
  EPSILON,
  float,
  Fn,
  If,
  int,
  min,
  mix,
  mul,
  normalLocal,
  positionLocal,
  remapClamp,
  step,
  tangentLocal,
  texture,
  transformNormalToView,
  uniform,
  uniformArray,
  uv,
  vec2,
  vec3,
  vec4,
} from 'three/tsl';
import {
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  Node,
  Texture,
  TextureNode,
  UniformArrayNode,
  UniformNode,
  Vector2,
  Vector3,
  Vector4,
} from 'three/webgpu';
import type { VoronoiNoiseData, DisplacementData, FbmNoiseData, WarpingData } from '../tsl-commons';
import { computeHumidity, computeTemperature, sampleBiomeTexture } from '../features/biomes';
import { applyBump } from '../features/bump';
import { displace, layer, warp } from '../features/lwd';
import { TSLMaterial } from './tsl-material';

export type PlanetUniformData = {
  radius: number;
  bumpStrength: number;
  flags: {
    showWarping: boolean;
    showDisplacement: boolean;
    showBumps: boolean;
    showBiomes: boolean;
    showCracks: boolean;
    showEmissive: boolean;
  };
  pbr: {
    waterLevel: number;
    metallicRoughness: {
      waterRoughness: number;
      waterMetalness: number;
      groundRoughness: number;
      groundMetalness: number;
    };
    emissive: {
      waterEmissiveIntensity: number;
      groundEmissiveIntensity: number;
    };
  };
  surface: {
    baseTexture?: Texture;
    noise: FbmNoiseData;
    warping: WarpingData;
    displacement: {
      params: DisplacementData;
      noise: FbmNoiseData;
    };
  };
  features: {
    cracks: {
      baseTexture?: Texture;
      distanceToEdge: number;
      emissiveIntensity: number;
      baseNoise: VoronoiNoiseData;
      detailNoise: FbmNoiseData;
      limiterTexture?: Texture;
      limiterNoise: FbmNoiseData;
      colorNoise: FbmNoiseData;
    };
    biomes: {
      baseTexture?: Texture;
      emissiveTexture?: Texture;
      temperatureMode: number;
      temperatureNoise: FbmNoiseData;
      humidityMode: number;
      humidityNoise: FbmNoiseData;
    };
  };
  // uniforms used for baking only
  baking: {
    heightMapTexture?: Texture;
  };
};
export type PlanetUniforms = {
  radius: UniformNode<'float', number>;
  bumpStrength: UniformNode<'float', number>;
  flags: UniformArrayNode<'int'>;
  pbr: {
    waterLevel: UniformNode<'float', number>;
    metallicRoughness: UniformNode<'vec4', Vector4>;
    emissive: UniformNode<'vec2', Vector2>;
  };
  surface: {
    baseTexture?: TextureNode;
    noise: UniformNode<'vec4', Vector4>;
    warping: UniformNode<'vec4', Vector4>;
    displacement: {
      params: UniformNode<'vec3', Vector3>;
      noise: UniformNode<'vec4', Vector4>;
    };
  };
  features: {
    cracks: {
      baseTexture?: TextureNode;
      distanceToEdge: UniformNode<'float', number>;
      emissiveIntensity: UniformNode<'float', number>;
      baseNoise: UniformNode<'vec3', Vector3>;
      detailNoise: UniformNode<'vec4', Vector4>;
      limiterNoise: UniformNode<'vec4', Vector4>;
      colorNoise: UniformNode<'vec4', Vector4>;
    };
    biomes: {
      baseTexture?: TextureNode;
      emissiveTexture?: TextureNode;
      temperatureMode: UniformNode<'float', number>;
      temperatureNoise: UniformNode<'vec4', Vector4>;
      humidityMode: UniformNode<'float', number>;
      humidityNoise: UniformNode<'vec4', Vector4>;
    };
  };
  // uniforms used for baking only
  baking: {
    heightMapTexture?: TextureNode;
  };
};
export class PlanetTSLMaterial extends TSLMaterial<MeshStandardNodeMaterial, PlanetUniformData, PlanetUniforms> {
  uniformize(data: PlanetUniformData): PlanetUniforms {
    return {
      radius: uniform(data.radius),
      bumpStrength: uniform(data.bumpStrength),
      flags: uniformArray([
        +data.flags.showWarping,
        +data.flags.showDisplacement,
        +data.flags.showBumps,
        +data.flags.showBiomes,
        +data.flags.showCracks,
        +data.flags.showEmissive,
      ]),
      pbr: {
        waterLevel: uniform(data.pbr.waterLevel),
        metallicRoughness: uniform(
          new Vector4(
            data.pbr.metallicRoughness.waterRoughness,
            data.pbr.metallicRoughness.waterMetalness,
            data.pbr.metallicRoughness.groundRoughness,
            data.pbr.metallicRoughness.groundMetalness,
          ),
        ),
        emissive: uniform(
          new Vector2(data.pbr.emissive.waterEmissiveIntensity, data.pbr.emissive.groundEmissiveIntensity),
        ),
      },
      surface: {
        baseTexture: texture(data.surface.baseTexture),
        noise: uniform(
          new Vector4(
            data.surface.noise.frequency,
            data.surface.noise.amplitude,
            data.surface.noise.lacunarity,
            data.surface.noise.octaves,
          ),
        ),
        warping: uniform(
          new Vector4(
            data.surface.warping.layers,
            data.surface.warping.warpFactor.x,
            data.surface.warping.warpFactor.y,
            data.surface.warping.warpFactor.z,
          ),
        ),
        displacement: {
          params: uniform(
            new Vector3(
              data.surface.displacement.params.factor,
              data.surface.displacement.params.epsilon,
              data.surface.displacement.params.multiplier,
            ),
          ),
          noise: uniform(
            new Vector4(
              data.surface.displacement.noise.frequency,
              data.surface.displacement.noise.amplitude,
              data.surface.displacement.noise.lacunarity,
              data.surface.displacement.noise.octaves,
            ),
          ),
        },
      },
      features: {
        cracks: {
          baseTexture: texture(data.features.cracks.baseTexture),
          distanceToEdge: uniform(data.features.cracks.distanceToEdge),
          emissiveIntensity: uniform(data.features.cracks.emissiveIntensity),
          baseNoise: uniform(
            new Vector3(
              data.features.cracks.baseNoise.scale,
              data.features.cracks.baseNoise.jitter,
              data.features.cracks.baseNoise.mode,
            ),
          ),
          detailNoise: uniform(
            new Vector4(
              data.features.cracks.detailNoise.frequency,
              data.features.cracks.detailNoise.amplitude,
              data.features.cracks.detailNoise.lacunarity,
              data.features.cracks.detailNoise.octaves,
            ),
          ),
          limiterNoise: uniform(
            new Vector4(
              data.features.cracks.limiterNoise.frequency,
              data.features.cracks.limiterNoise.amplitude,
              data.features.cracks.limiterNoise.lacunarity,
              data.features.cracks.limiterNoise.octaves,
            ),
          ),
          colorNoise: uniform(
            new Vector4(
              data.features.cracks.colorNoise.frequency,
              data.features.cracks.colorNoise.amplitude,
              data.features.cracks.colorNoise.lacunarity,
              data.features.cracks.colorNoise.octaves,
            ),
          ),
        },
        biomes: {
          baseTexture: texture(data.features.biomes.baseTexture),
          emissiveTexture: texture(data.features.biomes.emissiveTexture),
          temperatureMode: uniform(data.features.biomes.temperatureMode),
          temperatureNoise: uniform(
            new Vector4(
              data.features.biomes.temperatureNoise.frequency,
              data.features.biomes.temperatureNoise.amplitude,
              data.features.biomes.temperatureNoise.lacunarity,
              data.features.biomes.temperatureNoise.octaves,
            ),
          ),
          humidityMode: uniform(data.features.biomes.humidityMode),
          humidityNoise: uniform(
            new Vector4(
              data.features.biomes.humidityNoise.frequency,
              data.features.biomes.humidityNoise.amplitude,
              data.features.biomes.humidityNoise.lacunarity,
              data.features.biomes.humidityNoise.octaves,
            ),
          ),
        },
      },
      baking: {
        heightMapTexture: texture(data.baking.heightMapTexture),
      },
    };
  }

  // --------------------------------------------------
  // |              Building functions                |
  // --------------------------------------------------

  buildMaterial(): MeshStandardNodeMaterial {
    if (!this.uniforms.surface.baseTexture) {
      throw new Error('Cannot build material with missing uniform: surface.baseTexture');
    }
    if (!this.uniforms.features.biomes.baseTexture) {
      throw new Error('Cannot build material with missing uniform: biomes.baseTexture');
    }
    if (!this.uniforms.features.biomes.emissiveTexture) {
      throw new Error('Cannot build material with missing uniform: biomes.baseTexture');
    }

    // XYZ Warping + displacement
    const vPos = this.applyXYZTransformations(positionLocal);

    // Heightmap & global flags
    const heightLimit = float(1).sub(EPSILON).toVar('heightLimit');
    let height = layer(vPos, this.uniforms.surface.noise, this.uniforms.surface.warping.x).toVar('height');
    const FLAG_SURFACE_TYPE = step(this.uniforms.pbr.waterLevel, height).toVar('FLAG_SURFACE_TYPE');
    const FLAG_BIOMES_ENABLED = FLAG_SURFACE_TYPE.mul(float(this.uniforms.flags.element(3))).toVar(
      'FLAG_BIOMES_ENABLED',
    );
    const FLAG_CRACKS_ENABLED = float(this.uniforms.flags.element(4)).toVar('FLAG_CRACKS_ENABLED');

    // render noise as color
    const texCoord = vec2(min(height, heightLimit), 0.5).toVar('texCoord');
    let colour = vec3(this.uniforms.surface.baseTexture.sample(texCoord).xyz);

    // Render biomes
    const biomeTexCoord = this.calculateBiomeTextureCoordinates(vPos, heightLimit, FLAG_BIOMES_ENABLED).toVar(
      'biomeTexCoord',
    );
    colour = this.renderBiomes(
      colour,
      this.uniforms.features.biomes.baseTexture,
      biomeTexCoord,
      FLAG_BIOMES_ENABLED,
    ).toVec3();

    // Render cracks
    colour = mix(colour, this.renderCracks(colour, vPos, FLAG_SURFACE_TYPE).toVec3(), FLAG_CRACKS_ENABLED).toVec3();

    // Render bump-map (under MIT license)
    const bump = this.applyBumpMap(vPos, height);

    // Init material & set outputs
    const material = new MeshStandardNodeMaterial();
    material.colorNode = vec4(colour, 1);
    material.normalNode = transformNormalToView(
      mix(normalLocal, bump, FLAG_SURFACE_TYPE.mul(int(this.uniforms.flags.element(2)))),
    );
    material.roughnessNode = mix(
      this.uniforms.pbr.metallicRoughness.x,
      this.uniforms.pbr.metallicRoughness.z,
      FLAG_SURFACE_TYPE,
    );
    material.metalnessNode = mix(
      this.uniforms.pbr.metallicRoughness.y,
      this.uniforms.pbr.metallicRoughness.w,
      FLAG_SURFACE_TYPE,
    );
    material.emissiveNode = this.applyEmissiveIntensity(colour, biomeTexCoord, FLAG_SURFACE_TYPE);
    return material;
  }

  buildSurfaceBakeMaterial(): MeshBasicNodeMaterial {
    if (!this.uniforms.surface.baseTexture) {
      throw new Error('Cannot build material with missing uniform: surface.baseTexture');
    }
    if (!this.uniforms.features.biomes.baseTexture) {
      throw new Error('Cannot build material with missing uniform: biomes.baseTexture');
    }

    // XYZ Warping + displacement
    const vPos = this.applyXYZTransformations(positionLocal);

    // Heightmap & global flags
    const heightLimit = float(1).sub(EPSILON);
    const height = layer(vPos, this.uniforms.surface.noise, this.uniforms.surface.warping.x).setName('height');
    const FLAG_SURFACE_TYPE = step(this.uniforms.pbr.waterLevel, height).setName('FLAG_SURFACE_TYPE');
    const FLAG_BIOMES_ENABLED = FLAG_SURFACE_TYPE.mul(float(this.uniforms.flags.element(3))).setName(
      'FLAG_BIOMES_ENABLED',
    );

    // render noise as color
    const texCoord = vec2(min(height, heightLimit), 0.5).toVar('texCoord');
    let colour = vec3(this.uniforms.surface.baseTexture.sample(texCoord).xyz);

    // Render biomes
    const biomeTexCoord = this.calculateBiomeTextureCoordinates(vPos, heightLimit, FLAG_BIOMES_ENABLED).toVar(
      'biomeTexCoord',
    );
    colour = this.renderBiomes(
      colour,
      this.uniforms.features.biomes.baseTexture,
      biomeTexCoord,
      FLAG_BIOMES_ENABLED,
    ).toVec3();

    // Init material & set outputs
    const material = new MeshBasicNodeMaterial();
    material.vertexNode = flattenUV(uv());
    material.colorNode = vec4(colour, 1);
    return material;
  }

  buildMetallicRoughnessBakeMaterial(): MeshBasicNodeMaterial {
    // XYZ Warping + displacement
    const vPos = this.applyXYZTransformations(positionLocal);

    // Heightmap & global flags
    const height = layer(vPos, this.uniforms.surface.noise, this.uniforms.surface.warping.x).toVar();
    const FLAG_LAND = step(this.uniforms.pbr.waterLevel, height).toVar();

    // render PBR as green/blue mask
    const outRoughness = mix(this.uniforms.pbr.metallicRoughness.x, this.uniforms.pbr.metallicRoughness.z, FLAG_LAND);
    const outMetalness = mix(this.uniforms.pbr.metallicRoughness.y, this.uniforms.pbr.metallicRoughness.w, FLAG_LAND);

    // Init material & set outputs
    const material = new MeshBasicNodeMaterial();
    material.vertexNode = flattenUV(uv());
    material.colorNode = vec4(0, outRoughness, outMetalness, 1);
    return material;
  }

  buildEmissivityBakeMaterial(): MeshBasicNodeMaterial {
    if (!this.uniforms.surface.baseTexture) {
      throw new Error('Cannot build material with missing uniform: surface.baseTexture');
    }
    if (!this.uniforms.features.biomes.baseTexture) {
      throw new Error('Cannot build material with missing uniform: biomes.baseTexture');
    }
    if (!this.uniforms.features.biomes.emissiveTexture) {
      throw new Error('Cannot build material with missing uniform: biomes.emissiveTexture');
    }

    // XYZ Warping + displacement
    const vPos = this.applyXYZTransformations(positionLocal);

    // Heightmap & global flags
    const heightLimit = float(1).sub(EPSILON);
    const height = layer(vPos, this.uniforms.surface.noise, this.uniforms.surface.warping.x).toVar();
    const FLAG_SURFACE_TYPE = step(this.uniforms.pbr.waterLevel, height).toVar();
    const FLAG_BIOMES_ENABLED = FLAG_SURFACE_TYPE.mul(float(this.uniforms.flags.element(3)));

    // render noise as color
    const texCoord = vec2(min(height, heightLimit), 0.5).toVar('texCoord');
    let colour = vec3(this.uniforms.surface.baseTexture.sample(texCoord).xyz);

    // get biome texcoords for emissivity calculations
    const biomeTexCoord = this.calculateBiomeTextureCoordinates(vPos, heightLimit, FLAG_BIOMES_ENABLED).toVar(
      'biomeTexCoord',
    );
    colour = this.renderBiomes(
      colour,
      this.uniforms.features.biomes.baseTexture,
      biomeTexCoord,
      FLAG_BIOMES_ENABLED,
    ).toVec3();

    // Init material & set outputs
    const material = new MeshBasicNodeMaterial();
    material.vertexNode = flattenUV(uv());
    material.fragmentNode = vec4(this.applyEmissiveIntensity(colour, biomeTexCoord, FLAG_SURFACE_TYPE).xyz, 1);
    return material;
  }

  buildHeightMapBakeMaterial(): MeshBasicNodeMaterial {
    // XYZ Warping + displacement
    const vPos = this.applyXYZTransformations(positionLocal);

    // Heightmap & global flags
    const height = layer(vPos, this.uniforms.surface.noise, this.uniforms.surface.warping.x).toVar();
    const FLAG_SURFACE_TYPE = step(this.uniforms.pbr.waterLevel, height).toVar();

    // Init material & set outputs
    const material = new MeshBasicNodeMaterial();
    material.vertexNode = flattenUV(uv());
    material.colorNode = vec4(mix(vec3(this.uniforms.pbr.waterLevel), vec3(height), FLAG_SURFACE_TYPE), 1);
    return material;
  }

  buildNormalMapBakeMaterial(): MeshBasicNodeMaterial {
    if (!this.uniforms.baking.heightMapTexture) {
      throw new Error('Cannot build material with missing uniform: baking.heightMapTexture');
    }

    const texNode = this.uniforms.baking.heightMapTexture;
    const offset = vec3(-1 / texNode.value.width, 0, 1 / texNode.value.height).toVar('offset');

    // Sample height-map at 8 points around the current position
    const sobelMat = sampleSobel(texNode, uv(), offset).toVar('sobelMat');
    const normal = sobel(sobelMat, float(texNode.value.width).mul(this.uniforms.bumpStrength)).toVar('N');

    const material = new MeshBasicNodeMaterial();
    material.vertexNode = flattenUV(uv());
    material.colorNode = vec4(normal, 1);
    return material;
  }

  // --------------------------------------------------
  // |               Utility functions                |
  // --------------------------------------------------

  private applyXYZTransformations(vPos: Node<'vec3'>): Node<'vec3'> {
    vPos = warp(vPos, this.uniforms.surface.warping, float(this.uniforms.flags.element(0)));
    return displace(
      vPos,
      this.uniforms.surface.displacement.params,
      this.uniforms.surface.displacement.noise,
      float(this.uniforms.flags.element(1)),
    );
  }

  private calculateBiomeTextureCoordinates(
    vPos: Node<'vec3'>,
    heightLimit: Node<'float'>,
    FLAG_BIOMES_ENABLED: Node<'float'>,
  ) {
    const temp = float(
      computeTemperature(
        vPos,
        this.uniforms.features.biomes.temperatureNoise,
        this.uniforms.features.biomes.temperatureMode,
      ),
    );
    const humi = float(
      computeHumidity(vPos, this.uniforms.features.biomes.humidityNoise, this.uniforms.features.biomes.humidityMode),
    );
    return vec2(
      float(mix(0, temp, FLAG_BIOMES_ENABLED)).min(heightLimit),
      float(mix(0, humi, FLAG_BIOMES_ENABLED)).min(heightLimit),
    );
  }

  private renderBiomes(
    colour: Node<'vec3'>,
    texture: TextureNode,
    texCoords: Node<'vec2'>,
    FLAG_BIOMES_ENABLED: Node<'float'>,
  ): Node<'vec3'> {
    return mix(colour, sampleBiomeTexture(texture, texCoords.x, texCoords.y, colour), FLAG_BIOMES_ENABLED);
  }

  private renderCracks(color: Node<'vec3'>, vPos: Node<'vec3'>, _FLAG_LAND: Node<'float'>): Node<'vec3'> {
    const cracksDistance = voronoi3(
      vPos.mul(this.uniforms.features.cracks.baseNoise.x),
      this.uniforms.features.cracks.baseNoise.y,
    ).toVar('cnoise');
    const cracksDetail = layer(vPos, this.uniforms.features.cracks.detailNoise, 1);
    const _cracksDistanceMix = mix(cracksDetail, cracksDistance, 0.9);
    const cracksExtent = mix(1, 0, remapClamp(cracksDistance, 0, this.uniforms.features.cracks.distanceToEdge, 0, 1));

    const cracksColorNoiseHeight = layer(vPos, this.uniforms.features.cracks.colorNoise, 1);
    const cracksColorNoiseColor = vec3(
      this.uniforms.features.cracks.baseTexture!.sample(vec2(cracksColorNoiseHeight, 0.5)).xyz,
    );

    return mix(color, cracksColorNoiseColor, cracksExtent);
  }

  private applyBumpMap(vPos: Node<'vec3'>, height: Node<'float'>): Node<'vec3'> {
    const dx = vec3(tangentLocal.mul(this.uniforms.surface.warping.yzw).mul(0.005)).toVar('dx');
    const dy = vec3(bitangentLocal.mul(this.uniforms.surface.warping.yzw).mul(0.005)).toVar('dy');
    const dxHeight = float(layer(vPos.add(dx), this.uniforms.surface.noise, this.uniforms.surface.warping.x)).toVar(
      'dxHeight',
    );
    const dyHeight = float(layer(vPos.add(dy), this.uniforms.surface.noise, this.uniforms.surface.warping.x)).toVar(
      'dyHeight',
    );
    return vec3(
      applyBump(
        normalLocal,
        vPos,
        dx,
        dy,
        height,
        dxHeight,
        dyHeight,
        this.uniforms.radius,
        this.uniforms.bumpStrength,
      ),
    );
  }

  private readonly applyEmissiveIntensity = Fn(
    ([fragmentColor, biomeTexCoord, FLAG_SURFACE_TYPE]: [Node<'vec3'>, Node<'vec2'>, Node<'float'>]) => {
      // X/Y axes are flipped on texture, so we must also flip coords
      const emissiveColor = vec3(fragmentColor).toVar('emissiveColor');
      const flippedBiomeTexCoord = vec2(biomeTexCoord.y, biomeTexCoord.x).setName('flippedBiomeTexCoord');

      If(FLAG_SURFACE_TYPE.equal(1), () => {
        // calculate emissive
        const biomeEmissiveTexel = vec4(this.uniforms.features.biomes.baseTexture!.sample(flippedBiomeTexCoord)).toVar(
          'biomeEmissiveTexel',
        );
        const emissiveFactor = mix(
          this.uniforms.pbr.emissive.y,
          biomeEmissiveTexel.y.mul(10),
          biomeEmissiveTexel.w,
        ).toVar('emissiveFactor');

        // override color to biome value if we're on a biome
        const biomeColor = vec3(
          this.uniforms.features.biomes.emissiveTexture!.sample(flippedBiomeTexCoord).xyz,
        ).setName('biomeTexel');
        emissiveColor.assign(mix(emissiveColor, biomeColor, step(1e-3, biomeEmissiveTexel.w)));

        // Assign and return
        emissiveColor.mulAssign(mul(float(this.uniforms.flags.element(5)), emissiveFactor));
      }).Else(() => {
        emissiveColor.mulAssign(mul(float(this.uniforms.flags.element(5)), this.uniforms.pbr.emissive.x));
      });
      return emissiveColor;
    },
  );
}
