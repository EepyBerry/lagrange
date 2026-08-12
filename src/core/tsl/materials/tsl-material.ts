import type { DataEventPayloadTypeMap } from '@core/editor/event/data-event.types.ts';
import type { NodeMaterial } from 'three/webgpu';
import { DataEventEndpoint } from '@core/editor/event/data-event-endpoint.ts';

export abstract class TSLMaterial<MatType extends NodeMaterial, UniformType extends object> {
  public uniforms!: UniformType;
  public readonly dataEventEndpoint: DataEventEndpoint<keyof DataEventPayloadTypeMap> = new DataEventEndpoint<
    keyof DataEventPayloadTypeMap
  >();

  abstract initUniforms(...initData: unknown[]): UniformType;
  abstract buildMaterial(): MatType;

  // no-op by default
  initTextures(_initData: unknown): void {}
  dispose(): void {
    this.dataEventEndpoint.dispose();
  }
}
