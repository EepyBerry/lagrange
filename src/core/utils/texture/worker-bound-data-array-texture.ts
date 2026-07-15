import type { TextureWorkerOperation } from '@core/editor/workers/texture.worker.ts';
import { TextureWorkerInterface } from '@core/editor/workers/texture.worker-interface.ts';
import { serializeTextureWorkerData } from '@core/editor/workers/texture.worker-serializer.ts';
import { DataArrayTexture } from 'three/webgpu';

/**
 * Utility class to bind a {@link DataArrayTexture} to a {@link Worker}
 */
export class WorkerBoundDataArrayTexture {
  public readonly texture: DataArrayTexture;

  constructor(width: number, height: number, depth: number) {
    this.texture = new DataArrayTexture(new Uint8Array(width * height * depth * 4), width, height, depth);
  }

  public async update<DataType>(
    textureWorker: TextureWorkerInterface,
    operation: TextureWorkerOperation,
    data: DataType,
    depthIndex: number,
  ): Promise<void> {
    if (depthIndex < 0 || depthIndex >= this.texture.depth) {
      throw new Error(`Cannot update DataArrayTexture; invalid depth index: ${depthIndex}`);
    }
    const serializedData = serializeTextureWorkerData(data, operation);
    if (!serializedData) {
      throw new Error(`Cannot serialize data for operation ${operation}`);
    }

    const outputData = await textureWorker.run(this.texture.width, this.texture.height, operation, serializedData);
    this.texture.image.data!.set(outputData, this.texture.width * this.texture.height * 4 * depthIndex);
    this.texture.addLayerUpdate(depthIndex);
    this.texture.needsUpdate = true;
  }
}
