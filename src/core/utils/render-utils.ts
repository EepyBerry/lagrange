import type { ColorRamp } from '@core/models/planet/color-ramp.model.ts';
import type { WebGPURenderer } from 'three/webgpu';
import { type TypedArray } from 'three';

type EditorBackendType = 'webgl' | 'webgpu';

/**
 * Renders a buffer onto an OffscreenCanvas
 * @param renderer current renderer
 * @param buf the buffer, represented as a `TypedArray` (usually `UInt8Array`)
 * @param w width of the output (in pixels)
 * @param h height of the output (in pixels)
 * @returns an `OffscreenCanvas` instance containing data from the buffer
 */
export function renderToCanvas(renderer: WebGPURenderer, buf: TypedArray, w: number, h: number): OffscreenCanvas {
  const backendType: EditorBackendType = Object.hasOwn(renderer.backend, 'gl') ? 'webgl' : 'webgpu';

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(w, h);
  imageData.data.set(backendType === 'webgl' ? flipBufferY(buf as Uint8Array, w, h) : buf);
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Flips an UInt8Array's data vertically to have a normalized +X/+Y image
 * @param buffer the data buffer
 * @param w width of the resulting image
 * @param h height of the resulting image
 * @returns the flipped buffer
 */
export function flipBufferY(buffer: Uint8Array, w: number, h: number): Uint8Array {
  const length = w * h * 4;
  const row = w * 4;
  const end = (h - 1) * row;
  const result = new Uint8Array(length);

  for (let i = 0; i < length; i += row) {
    result.set(buffer.subarray(i, i + row), end - i);
  }
  return result;
}

/**
 * Converts a color ramp to a left-to-right CSS `linear-gradient`, according to its steps
 * @param ramp the color ramp to convert
 * @returns an object with `color` and `alpha` gradients
 */
export function colorRampToStyle(ramp: ColorRamp): { color: string; alpha: string } {
  const gradient: string[] = [];
  const alphaGradient: string[] = [];
  for (const step of ramp.steps) {
    const rgb = step.color.getHexString();
    const a = Math.ceil(step.alpha * 255).toString(16);
    gradient.push(`#${rgb} ${step.factor * 100}%`);
    alphaGradient.push(`#${a + a + a} ${step.factor * 100}%`);
  }
  return {
    color: `linear-gradient(90deg, ${gradient.join(', ')})`,
    alpha: `linear-gradient(90deg, ${alphaGradient.join(', ')})`,
  };
}

/**
 * Converts an alpha value to a corresponding greyscale value
 * @param alpha the alpha value
 * @param full set to `true` if all components of the color should be greyscale
 * @returns either a single channel or the full RGB hex-string, after conversion
 */
export function alphaToGrayscale(alpha: number, full = false): string {
  const hex = Math.ceil(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return full ? `#${hex + hex + hex}` : hex;
}

export async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
