import type { EditorBackendType } from '@core/types.ts';
import type { WebGPURenderer } from 'three/webgpu';
import { type ColorRamp, ColorRampStep } from '@core/models/planet/color-ramp.model.ts';
import { CanvasTexture, DataTexture, type TypedArray } from 'three';

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
export function flipBufferY(buffer: Uint8Array, w: number, h: number): Uint8Array<ArrayBuffer> {
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
 * Converts a color ramp to a left-to-right CSS `linear-gradient`, according to its steps.
 * The extremes are calculated from the first and last color of the ramp, respectively.
 * If only one color exists on the ramp, then both extremes will be the same color.
 * @param ramp the color ramp to convert
 * @returns an object with `color` and `alpha` gradients
 */
export function colorRampToStyle(ramp: ColorRamp): { color: string; alpha: string } {
  if (!ramp.steps || ramp.steps.length === 0) {
    return { color: 'transparent', alpha: 'transparent' };
  }
  const gradient: string[] = [];
  const alphaGradient: string[] = [];

  const sortedSteps = [...ramp.steps].sort((a, b) => a.factor - b.factor);
  const first = sortedSteps[0];
  const last = sortedSteps[sortedSteps.length - 1];

  if (first.factor > 0) {
    _addGradientStep(gradient, alphaGradient, first, 0);
  }
  for (const step of sortedSteps) {
    _addGradientStep(gradient, alphaGradient, step, step.factor * 100);
  }
  if (last.factor < 1) {
    _addGradientStep(gradient, alphaGradient, last, 100);
  }

  return {
    color: `linear-gradient(90deg, ${gradient.join(', ')})`,
    alpha: `linear-gradient(90deg, ${alphaGradient.join(', ')})`,
  };
}
function _addGradientStep(gradient: string[], alphaGradient: string[], step: ColorRampStep, percentage: number) {
  const rgb = step.color.getHexString();
  const a = Math.ceil(step.alpha * 255).toString(16);
  gradient.push(`#${rgb} ${percentage}%`);
  alphaGradient.push(`#${a.repeat(3)} ${percentage}%`);
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
  return full ? `#${hex.repeat(3)}` : hex;
}

/**
 * Converts a {@link Blob} instance to a data URL
 * @param blob the blob to convert
 */
export async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Creates an instance of {@link DataTexture} from the given texture data
 * @param buffer the buffer to store in the texture
 * @param width texture width
 * @param height texture height
 */
export function bufferToDataTexture(buffer: Uint8Array, width: number, height: number) {
  const dt = new DataTexture(buffer, width, height);
  dt.needsUpdate = true;
  return dt;
}

/**
 * Creates an instance of {@link Blob} from the given texture data
 * @param renderer current renderer
 * @param buf the buffer to write in the blob
 * @param w texture width
 * @param h texture height
 */
export async function bufferToImageBlob(renderer: WebGPURenderer, buf: TypedArray, w: number, h: number) {
  const tex = new CanvasTexture(renderToCanvas(renderer, buf, w, h));
  return await tex.image.convertToBlob();
}
