import type { LibrarySpecificGraphicsCapabilities } from '@core/capabilities/capabilities.ts';
import GraphicsLibraryBackend, { type GraphicsLibraryAvailability } from '@core/capabilities/types.ts';

/**
 * Custom class to check WebgpuCapabilities capabilities, inspired by three.js code
 * @see https://github.com/mrdoob/three.js/blob/dev/examples/jsm/capabilities/WebGPU.js
 */
export default class WebGPUCapabilities extends GraphicsLibraryBackend {
  static override async getCapabilities(): Promise<LibrarySpecificGraphicsCapabilities> {
    const availability = await this.checkAvailability();
    if (!availability.isAvailable) {
      return {
        info: availability,
        maxTextureSize: 0,
        maxBufferSize: 0,
      };
    }
    const adapter = (await navigator.gpu.requestAdapter())!;
    return {
      info: availability,
      maxTextureSize: adapter.limits.maxTextureDimension2D,
      maxBufferSize: adapter.limits.maxBufferSize,
    };
  }

  protected static override async checkAvailability(): Promise<GraphicsLibraryAvailability> {
    try {
      const hasNavigatorGpuAPI = typeof navigator !== 'undefined' && navigator.gpu !== undefined;
      return { isAvailable: hasNavigatorGpuAPI && !!(await navigator.gpu.requestAdapter()) };
    } catch (e) {
      return {
        isAvailable: false,
        initError: e as Error | DOMException,
      };
    }
  }
}
