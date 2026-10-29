import type { LibrarySpecificGraphicsCapabilities } from '@core/capabilities/capabilities.ts';
import Types, { type GraphicsLibraryAvailability } from '@core/capabilities/types.ts';

/**
 * Custom class to check WebGL2 capabilities, inspired by three.js code
 * @see https://github.com/mrdoob/three.js/blob/dev/examples/jsm/capabilities/WebGL.js
 */
export default class WebGL2Capabilities extends Types {
  static override getCapabilities(): LibrarySpecificGraphicsCapabilities {
    const availability = this.checkAvailability();
    if (!availability.isAvailable) {
      return {
        info: availability,
        maxTextureSize: 0,
      };
    }
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2')!;
    return {
      info: availability,
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    };
  }

  protected static override checkAvailability(): GraphicsLibraryAvailability {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      return { isAvailable: !!(window.WebGL2RenderingContext && gl) };
    } catch (e) {
      return {
        isAvailable: false,
        initError: e as Error | DOMException,
      };
    }
  }
}
