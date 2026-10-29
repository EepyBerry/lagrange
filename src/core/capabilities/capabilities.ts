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
const _cachedGraphicsCapabilities: GraphicsCapabilities = {
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
  _cachedGraphicsCapabilities.webgl = WebGL2Capabilities.getCapabilities();
  _cachedGraphicsCapabilities.webgpu = await WebgpuCapabilities.getCapabilities();
  console.info(
    '<Lagrange> Loaded system graphics capabilities for backends: [WebGL2, WebGPU]\r\n',
    _cachedGraphicsCapabilities,
  );
}

export function getGraphicsCapabilities(renderingBackend: EditorBackendType): LibrarySpecificGraphicsCapabilities {
  return _cachedGraphicsCapabilities[renderingBackend];
}
