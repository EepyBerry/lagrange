import type { TextureWorkerOperation } from '@core/editor/workers/texture.worker.ts';
import { TextureWorkerInterface } from '@core/editor/workers/texture.worker-interface.ts';
import { serializeTextureWorkerData } from '@core/editor/workers/texture.worker-serializer.ts';
import { DataTexture } from 'three/webgpu';

/**
 * Utility class to bind a {@link DataTexture} to a {@link Worker}
 */
export class WorkerBoundDataTexture {
  public readonly texture: DataTexture;

  constructor(width: number, height: number) {
    this.texture = new DataTexture(new Uint8Array(width * height * 4), width, height);
  }

  public async update<DataType>(
    textureWorker: TextureWorkerInterface,
    operation: TextureWorkerOperation,
    data: DataType,
  ): Promise<void> {
    const serializedData = serializeTextureWorkerData(data, operation);
    if (!serializedData) {
      throw new Error(`Cannot serialize data for operation ${operation}`);
    }
    const outputData = await textureWorker.run(this.texture.width, this.texture.height, operation, serializedData);
    this.texture.image.data!.set(outputData);
    this.texture.needsUpdate = true;
  }
}
