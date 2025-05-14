import { DataTexture, MeshStandardNodeMaterial, TextureNode, UniformArrayNode } from "three/webgpu";
import { mix, positionLocal, step, texture, uniformArray, vec2, vec3, vec4 } from "three/tsl";
import { fbm3 } from "../noise/fbm3.func";
import { type TSLMaterial } from "./tsl-material";
import type PlanetData from "@/core/models/planet-data.model";

export type PlanetUniforms = {
  pbr: UniformArrayNode;
  noise: UniformArrayNode;
  textures: TextureNode[];
}
export class PlanetTSLMaterial implements TSLMaterial<MeshStandardNodeMaterial, PlanetUniforms> {

  public readonly uniforms: PlanetUniforms;

  constructor(data: PlanetData, textures: DataTexture[]) {
    this.uniforms = {
      pbr: uniformArray([
        data.planetWaterLevel,
        data.planetWaterRoughness,
        data.planetWaterMetalness,
        data.planetGroundRoughness,
        data.planetGroundMetalness,
      ], 'float'),
      noise: uniformArray([
        data.planetSurfaceNoise.frequency,
        data.planetSurfaceNoise.amplitude,
        data.planetSurfaceNoise.lacunarity,
        data.planetSurfaceNoise.octaves
      ], 'float'),
      textures: [
        texture(textures[0]) // surface
      ]
    };
  }

  get(): MeshStandardNodeMaterial {
    // Heightmap & global flags
    const height = fbm3(positionLocal, this.uniforms.noise).toVar()
    const FLAG_LAND = step(this.uniforms.pbr.element(0), height).toVar();

    // render noise as color
    const colour = vec3(this.uniforms.textures[0].sample(vec2(height, 0.5)).xyz).toVar();

    // init material & set outputs
    const material = new MeshStandardNodeMaterial();
    material.colorNode = vec4(colour, 1.0);
    material.roughnessNode = mix(this.uniforms.pbr.element(1), this.uniforms.pbr.element(3), FLAG_LAND);
    material.metalnessNode = mix(this.uniforms.pbr.element(2), this.uniforms.pbr.element(4), FLAG_LAND);

    return material;
  }
}