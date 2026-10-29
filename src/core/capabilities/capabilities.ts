import type { GraphicsLibraryAvailability } from '@core/capabilities/types.ts';
import type { EditorBackendType } from '@core/types.ts';
import WebGL2Capabilities from '@core/capabilities/webgl2.capabilities.ts';
import WebgpuCapabilities from '@core/capabilities/webgpu.capabilities.ts';

export type GraphicsCapabilities = Record<EditorBackendType, LibrarySpecificGraphicsCapabilities>;
export type LibrarySpecificGraphicsCapabilities = {
  info: GraphicsLibraryAvailability;
  maxTextureSize: number;
};

// Cache capabilities for later use
const _cachedWebGLCapabilities: GraphicsCapabilities = {
  webgl: {
    info: { isAvailable: false },
    maxTextureSize: 0,
  },
  webgpu: {
    info: { isAvailable: false },
    maxTextureSize: 0,
  },
};

export async function initGraphicsCapabilities() {
  _cachedWebGLCapabilities.webgl = WebGL2Capabilities.getCapabilities();
  _cachedWebGLCapabilities.webgpu = await WebgpuCapabilities.getCapabilities();
}

export function getGraphicsCapabilities(renderingBackend: EditorBackendType): LibrarySpecificGraphicsCapabilities {
  return _cachedWebGLCapabilities[renderingBackend];
}
