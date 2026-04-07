import type { NodeMaterial } from 'three/webgpu';

export abstract class TSLMaterial<MatType extends NodeMaterial, DataType extends object, UniformType extends object> {
  public readonly uniforms: UniformType;

  constructor(data: DataType) {
    this.uniforms = this.uniformize(data);
  }

  abstract uniformize(data: DataType): UniformType;
  abstract buildMaterial(): MatType;
}
