import {
  bitangentLocal,
  EPSILON,
  float,
  Fn,
  If,
  int,
  mat3,
  min,
  mix,
  mrt,
  mul,
  normalLocal,
  positionLocal,
  step,
  tangentLocal,
  texture,
  transformNormalToView,
  uniform,
  uniformArray,
  uv,
  Var,
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
import type { DisplacementData, NoiseData, WarpingData } from '../tsl-commons';
import { computeHumidity, computeTemperature, sampleBiomeTexture } from '../features/biomes';
import { applyBump } from '../features/bump';
import { displace, layer, warp } from '../features/lwd';
import { sobel } from '../utils/sobel-utils';
import { flattenUV } from '../utils/vertex-utils';
import { TSLMaterial } from './tsl-material';

export type PlanetUniformData = {
  radius: number;
  bumpStrength: number;
  flags: {
    showWarping: boolean;
    showDisplacement: boolean;
    showBumps: boolean;
    showBiomes: boolean;
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
    noise: NoiseData;
    warping: WarpingData;
    displacement: {
      params: DisplacementData;
      noise: NoiseData;
    };
  };
  biomes: {
    baseTexture?: Texture;
    emissiveTexture?: Texture;
    temperatureMode: number;
    temperatureNoise: NoiseData;
    humidityMode: number;
    humidityNoise: NoiseData;
  };
  // uniforms used for baking only
  baking: {
    unifiedSurfaceTexture?: Texture;
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
  biomes: {
    baseTexture?: TextureNode;
    emissiveTexture?: TextureNode;
    temperatureMode: UniformNode<'float', number>;
    temperatureNoise: UniformNode<'vec4', Vector4>;
    humidityMode: UniformNode<'float', number>;
    humidityNoise: UniformNode<'vec4', Vector4>;
  };
  // uniforms used for baking only
  baking: {
    unifiedSurfaceTexture?: TextureNode;
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
      biomes: {
        baseTexture: texture(data.biomes.baseTexture),
        emissiveTexture: texture(data.biomes.emissiveTexture),
        temperatureMode: uniform(data.biomes.temperatureMode),
        temperatureNoise: uniform(
          new Vector4(
            data.biomes.temperatureNoise.frequency,
            data.biomes.temperatureNoise.amplitude,
            data.biomes.temperatureNoise.lacunarity,
            data.biomes.temperatureNoise.octaves,
          ),
        ),
        humidityMode: uniform(data.biomes.humidityMode),
        humidityNoise: uniform(
          new Vector4(
            data.biomes.humidityNoise.frequency,
            data.biomes.humidityNoise.amplitude,
            data.biomes.humidityNoise.lacunarity,
            data.biomes.humidityNoise.octaves,
          ),
        ),
      },
      baking: {
        unifiedSurfaceTexture: texture(data.baking.unifiedSurfaceTexture),
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
    if (!this.uniforms.biomes.baseTexture) {
      throw new Error('Cannot build material with missing uniform: biomes.baseTexture');
    }
    if (!this.uniforms.biomes.emissiveTexture) {
      throw new Error('Cannot build material with missing uniform: biomes.baseTexture');
    }

    // XYZ Warping + displacement
    const vPos = this.applyXYZTransformations(positionLocal);

    // Heightmap & global flags
    const heightLimit = float(1).sub(EPSILON);
    const height = Var(layer(vPos, this.uniforms.surface.noise, this.uniforms.surface.warping.x), 'height');
    const FLAG_LAND = Var(step(this.uniforms.pbr.waterLevel, height), 'FLAG_LAND');
    const FLAG_BIOMES = Var(FLAG_LAND.mul(float(this.uniforms.flags.element(3))), 'FLAG_BIOMES');

    // render noise as color
    const texCoord = vec2(min(height, heightLimit), 0.5).toVar('texCoord');
    let colour = vec3(this.uniforms.surface.baseTexture.sample(texCoord).xyz);

    // Render biomes
    const biomeTexCoord = this.calculateBiomeTextureCoordinates(vPos, heightLimit, FLAG_BIOMES).toVar('biomeTexCoord');
    colour = this.renderBiomes(colour, this.uniforms.biomes.baseTexture, biomeTexCoord, FLAG_BIOMES);

    // Render bump-map (under MIT license)
    const bump = this.applyBumpMap(vPos, height);

    // Init material & set outputs
    const material = new MeshStandardNodeMaterial();
    material.colorNode = vec4(colour, 1);
    material.normalNode = transformNormalToView(
      mix(normalLocal, bump, FLAG_LAND.mul(int(this.uniforms.flags.element(2)))),
    );
    material.roughnessNode = mix(
      this.uniforms.pbr.metallicRoughness.x,
      this.uniforms.pbr.metallicRoughness.z,
      FLAG_LAND,
    );
    material.metalnessNode = mix(
      this.uniforms.pbr.metallicRoughness.y,
      this.uniforms.pbr.metallicRoughness.w,
      FLAG_LAND,
    );
    material.emissiveNode = this.applyEmissiveIntensity(
      colour,
      this.uniforms.biomes.baseTexture,
      this.uniforms.biomes.emissiveTexture,
      biomeTexCoord,
      FLAG_LAND,
    );

    // Connect MRT data
    material.mrtNode = mrt({ bloomIntensity: uniform(1.0) });
    return material;
  }

  buildSurfaceBakeMaterial(): MeshBasicNodeMaterial {
    if (!this.uniforms.surface.baseTexture) {
      throw new Error('Cannot build material with missing uniform: surface.baseTexture');
    }
    if (!this.uniforms.biomes.baseTexture) {
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
    colour = this.renderBiomes(colour, this.uniforms.biomes.baseTexture, biomeTexCoord, FLAG_BIOMES_ENABLED);

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
    if (!this.uniforms.biomes.baseTexture) {
      throw new Error('Cannot build material with missing uniform: biomes.baseTexture');
    }
    if (!this.uniforms.biomes.emissiveTexture) {
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
    colour = this.renderBiomes(colour, this.uniforms.biomes.baseTexture, biomeTexCoord, FLAG_BIOMES_ENABLED);

    // Init material & set outputs
    const material = new MeshBasicNodeMaterial();
    material.vertexNode = flattenUV(uv());
    material.fragmentNode = vec4(
      this.applyEmissiveIntensity(
        colour,
        this.uniforms.biomes.baseTexture,
        this.uniforms.biomes.emissiveTexture,
        biomeTexCoord,
        FLAG_SURFACE_TYPE,
      ).xyz,
      1,
    );
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
    const s00 = texNode.sample(uv().add(offset.xx)).x.toVar('s00');
    const s01 = texNode.sample(uv().add(offset.yx)).x.toVar('s10');
    const s02 = texNode.sample(uv().add(offset.zx)).x.toVar('s20');
    const s10 = texNode.sample(uv().add(offset.xy)).x.toVar('s01');
    const s12 = texNode.sample(uv().add(offset.zy)).x.toVar('s21');
    const s20 = texNode.sample(uv().add(offset.xz)).x.toVar('s02');
    const s21 = texNode.sample(uv().add(offset.yz)).x.toVar('s12');
    const s22 = texNode.sample(uv().add(offset.zz)).x.toVar('s22');
    const sobelMat = mat3(s00, s01, s02, s10, uv().x, s12, s20, s21, s22).toVar('sobelMat');
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
    vPos = warp(vPos, this.uniforms.surface.warping, this.uniforms.flags.element(0));
    return displace(
      vPos,
      this.uniforms.surface.displacement.params,
      this.uniforms.surface.displacement.noise,
      this.uniforms.flags.element(int(1)),
    );
  }

  private calculateBiomeTextureCoordinates(
    vPos: Node<'vec3'>,
    heightLimit: Node<'float'>,
    FLAG_BIOMES_ENABLED: Node<'float'>,
  ) {
    const temp = float(
      computeTemperature(vPos, this.uniforms.biomes.temperatureNoise, this.uniforms.biomes.temperatureMode),
    );
    const humi = float(computeHumidity(vPos, this.uniforms.biomes.humidityNoise, this.uniforms.biomes.humidityMode));
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

  private applyBumpMap(vPos: Node<'vec3'>, height: Node<'float'>): Node<'vec3'> {
    const dx = vec3(tangentLocal.mul(this.uniforms.surface.warping.yzw).mul(0.005)).toVar('dx');
    const dy = vec3(bitangentLocal.toVec3().mul(this.uniforms.surface.warping.yzw).mul(0.005)).toVar('dy');
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
    ([fragmentColor, biomeTexture, biomeEmissiveTexture, biomeTexCoord, FLAG_SURFACE_TYPE]: [
      Node<'vec3'>,
      TextureNode,
      TextureNode,
      Node<'vec2'>,
      Node<'float'>,
    ]) => {
      // X/Y axes are flipped on texture, so we must also flip coords
      const emissiveColor = vec3(fragmentColor).toVar('emissiveColor');
      const flippedBiomeTexCoord = vec2(biomeTexCoord.y, biomeTexCoord.x).setName('flippedBiomeTexCoord');
      If(FLAG_SURFACE_TYPE.equal(1), () => {
        // calculate emissive
        const biomeEmissiveTexel = vec4(biomeEmissiveTexture.sample(flippedBiomeTexCoord)).toVar('biomeEmissiveTexel');
        const emissiveFactor = mix(
          this.uniforms.pbr.emissive.y,
          biomeEmissiveTexel.y.mul(10),
          biomeEmissiveTexel.w,
        ).toVar('emissiveFactor');

        // override color to biome value if we're on a biome
        const biomeColor = vec3(biomeTexture.sample(flippedBiomeTexCoord).xyz).setName('biomeTexel');
        emissiveColor.assign(mix(emissiveColor, biomeColor, step(1e-3, biomeEmissiveTexel.w)));

        // Assign and return
        emissiveColor.mulAssign(mul(float(this.uniforms.flags.element(int(4))), emissiveFactor));
      }).Else(() => {
        emissiveColor.mulAssign(mul(float(this.uniforms.flags.element(int(4))), this.uniforms.pbr.emissive.x));
      });
      return emissiveColor;
    },
  );
}
