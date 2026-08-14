import {
  type TextureWorkerInput,
  type TextureWorkerOperation,
  type TextureWorkerOutput,
} from '@core/editor/workers/texture.worker.ts';
import { nanoid } from 'nanoid';

export class TextureWorkerInterface {
  private readonly _worker: Worker = new Worker(new URL('@core/editor/workers/texture.worker.ts', import.meta.url), {
    type: 'module',
  });

  private readonly _callbacks: Map<string, (output: TextureWorkerOutput) => void> = new Map();

  constructor() {
    this._worker.onmessage = (event: MessageEvent<TextureWorkerOutput>) => {
      const output = event.data;
      const callback = this._callbacks.get(output.id);
      if (!callback) return;

      callback(output);
      this._callbacks.delete(output.id);
    };
  }

  /**
   * Runs an operation on the texture worker
   * @param width texture width
   * @param height texture height
   * @param operation operation to run
   * @param data operation data
   * @returns a promise that resolves with the generated texture data
   */
  public run<OperationData>(
    width: number,
    height: number,
    operation: TextureWorkerOperation,
    data: OperationData,
  ): Promise<Uint8ClampedArray> {
    if (!width || !height || width <= 0 || height <= 0) {
      return Promise.reject(new Error(`Invalid dimensions for texture worker: ${width}x${height}`));
    }
    return new Promise((resolve) => {
      const id: string = nanoid();
      this._callbacks.set(id, async (output) => resolve(output.data));
      const input: TextureWorkerInput<OperationData> = { type: 'texture-update', id, width, height, operation, data };
      this._worker.postMessage(input);
    });
  }

  /**
   * Terminates the worker
   */
  public terminate(): void {
    this._worker.terminate();
    this._callbacks.clear();
  }
}
