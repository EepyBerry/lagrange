import type {
  BakingWorkerInput,
  BakingWorkerOutput,
  BakingWorkerTextureRequest,
  BakingWorkerTextureResponse,
} from '@core/editor/workers/baking.worker.ts';
import type { TextureWorkerInterface } from '@core/editor/workers/texture.worker-interface.ts';
import type PlanetData from '@core/models/planet/planet-data.model.ts';
import { serializeBakingWorkerData } from '@core/editor/workers/baking.worker-serializer.ts';

export class BakingWorkerInterface {
  private readonly _worker: Worker = new Worker(new URL('@core/editor/workers/baking.worker.ts', import.meta.url), {
    type: 'module',
  });

  public run(
    textureWorkerInterface: TextureWorkerInterface,
    input: BakingWorkerInput & { planetData: PlanetData },
    onBakingMessage: (msg: MessageEvent) => void,
  ): void {
    this._worker.onmessage = async (event: MessageEvent<BakingWorkerTextureRequest[] | BakingWorkerOutput>) => {
      if (Array.isArray(event.data) && event.data.length > 0 && event.data[0].type === 'texture-request') {
        const textures: Uint8ClampedArray[] = [];
        for (const request of event.data) {
          textures.push(
            await textureWorkerInterface.run(
              input.bakingResolution,
              input.bakingResolution,
              request.operation,
              request.data,
            ),
          );
        }
        this._worker.postMessage(<BakingWorkerTextureResponse>{
          type: 'texture-response',
          step: event.data[0].step,
          textures,
        });
      } else {
        onBakingMessage(event);
      }
    };
    this._worker.postMessage({
      ...input,
      type: 'baking',
      planetData: serializeBakingWorkerData(input.planetData),
    });
  }

  public terminate(): void {
    this._worker.terminate();
  }
}
