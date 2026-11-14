import { TextureWorkerInterface } from '@core/editor/workers/texture.worker-interface.ts';
import { serializeTextureWorkerData } from '@core/editor/workers/texture.worker-serializer.ts';
import { WorkerTextureDataType } from '@core/utils/baking-utils.ts';
import { DataTexture } from 'three/webgpu';

/**
 * Utility class to bind a {@link DataTexture} to a {@link Worker}
 */
export class WorkerBoundDataTexture {
  public readonly texture: DataTexture;

  constructor(width: number, height: number) {
    this.texture = new DataTexture(new Uint8Array(width * height * 4), width, height);
  }

  public async update(
    textureWorker: TextureWorkerInterface,
    dataType: WorkerTextureDataType,
    data: unknown,
  ): Promise<void> {
    const serializedData = serializeTextureWorkerData(data, dataType);
    if (!serializedData) {
      throw new Error(`Cannot serialize data for data-type ${dataType}`);
    }
    const outputData = await textureWorker.run(this.texture.width, this.texture.height, dataType, serializedData);
    this.texture.image.data!.set(outputData.buffer);
    this.texture.needsUpdate = true;
  }
}
