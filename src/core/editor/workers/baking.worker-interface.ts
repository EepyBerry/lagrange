import type { BakingWorkerInput, BakingWorkerOutput } from '@core/editor/workers/baking.worker.ts';
import type { TextureWorkerInterface } from '@core/editor/workers/texture.worker-interface.ts';
import type PlanetData from '@core/models/planet/planet-data.model.ts';
import { serializeBakingWorkerData } from '@core/editor/workers/baking.worker-serializer.ts';

export class BakingWorkerInterface {
  private readonly _worker: Worker = new Worker(new URL('@core/editor/workers/baking.worker.ts', import.meta.url), {
    type: 'module',
  });

  public run(
    textureWorkerInterface: TextureWorkerInterface,
    input: BakingWorkerInput<'run'> & { planetData: PlanetData },
    onBakingMessage: (msg: MessageEvent) => void,
  ): void {
    this._worker.onmessage = async (event: MessageEvent<BakingWorkerOutput>) => {
      console.log('(b:w:if) got response', event.data);
      if (event.data.type === 'texture-request') {
        for (const request of event.data.items) {
          const rawBufferTex = await textureWorkerInterface.run(
            request.width,
            request.height,
            request.operation,
            request.data,
          );
          this._worker.postMessage(<BakingWorkerInput<'texture-part'>>{
            type: 'texture-part',
            target: request.target,
            targetIndex: request.targetIndex,
            texture: rawBufferTex,
          });
        }
        this._worker.postMessage(<BakingWorkerInput<'texture-done'>>{ type: 'texture-done' });
      } else {
        onBakingMessage(event);
      }
    };

    const message: BakingWorkerInput<'run'> = {
      ...input,
      type: 'run',
      planetData: serializeBakingWorkerData(input.planetData),
    };
    this._worker.postMessage(message);
  }

  public terminate(): void {
    this._worker.terminate();
  }
}
