import type { LibrarySpecificGraphicsCapabilities } from '@core/capabilities/capabilities.ts';

/**
 * Base type for graphics library availability and associated error if unavailable
 */
export type GraphicsLibraryAvailability = {
  isAvailable: boolean;
  initError?: Error | DOMException;
};

/**
 * Base class for graphics library capabilities
 */
export default abstract class Types {
  protected static checkAvailability(): GraphicsLibraryAvailability | Promise<GraphicsLibraryAvailability> {
    throw new Error('Not implemented');
  }
  static getCapabilities(): LibrarySpecificGraphicsCapabilities | Promise<LibrarySpecificGraphicsCapabilities> {
    throw new Error('Not implemented');
  }
}
