import type { ColorRamp } from '@/core/models/color-ramp.model'
import type { RawRGBA } from '@/core/types'
import { CanvasTexture, Color, type TypedArray } from 'three'

/**
 * Renders a buffer to a PNG dataURL
 * @param buf the buffer, represented as a `Uint8Array`
 * @param w width of the output (in pixels)
 * @param h height of the output (in pixels)
 * @returns a dataURL with the given pixel data
 */
export function bufferToDataURL(buf: Uint8Array, w: number, h: number): string {
  const canvas = createCanvas(w, h)
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.createImageData(w, h)
  imageData.data.set(normalizeUInt8ArrayPixels(buf as Uint8Array, w, h))
  ctx.putImageData(imageData, 0, 0)
  const url = canvas.toDataURL()
  canvas.remove()
  return url
}

/**
 * Renders a buffer onto a CanvasTexture
 * @param buf the buffer, represented as a `TypedArray` (usually `UInt8Array`)
 * @param w width of the output (in pixels)
 * @param h height of the output (in pixels)
 * @returns a `CanvasTexture` instance containing data from the buffer
 */
export function bufferToTexture(buf: TypedArray, w: number, h: number): CanvasTexture {
  const canvas = createCanvas(w, h)
  const ctx = canvas.getContext('2d')!
  const imgData = new ImageData(new Uint8ClampedArray(buf), w, h)
  ctx.putImageData(imgData, 0, 0)
  //saveAs(canvas.toDataURL(), 'normalmap.png')

  const tex = new CanvasTexture(canvas)
  tex.flipY = false
  canvas.remove()
  return tex
}

/**
 * Flips a UInt8Array's pixels vertically to have a normalized +X/+Y image
 * @param buffer the data buffer
 * @param w width of the resulting image
 * @param h height of the resulting image
 * @returns
 */
export function normalizeUInt8ArrayPixels(buffer: Uint8Array, w: number, h: number): Uint8Array {
  const length = w * h * 4
  const row = w * 4
  const end = (h - 1) * row
  const result = new Uint8Array(length)

  for (let i = 0; i < length; i += row) {
    result.set(buffer.subarray(i, i + row), end - i)
  }
  return result
}

/**
 * Mixes two RGBA colours with their alpha components
 * @see https://stackoverflow.com/questions/726549/algorithm-for-additive-color-mixing-for-rgb-values
 * @param c1 first color in RGBA form (0-1)
 * @param c2 second color in RGBA form (0-1)
 * @returns the alpha-blended color in RGBA form (0-1)
 */
export function alphaBlendColors(c1: RawRGBA, c2: RawRGBA): RawRGBA {
  return {
    r: mixRawRGBAChannel(c1.r, c2.r, c1.a, c2.a),
    g: mixRawRGBAChannel(c1.g, c2.g, c1.a, c2.a),
    b: mixRawRGBAChannel(c1.b, c2.b, c1.a, c2.a),
    a: mixRawRGBAAlpha(c1.a, c2.a),
  }
}
function mixRawRGBAChannel(c1: number, c2: number, a1: number, a2: number) {
  return (c1 * a1 + c2 * a2 * (1 - a1)) / mixRawRGBAAlpha(a1, a2)
}
function mixRawRGBAAlpha(a1: number, a2: number) {
  return a1 + a2 * (1 - a1)
}

/**
 * Converts a color ramp to a left-to-right CSS `linear-gradient`, according to its steps
 * @param ramp the color ramp to convert
 * @returns an object with `color` and `alpha` gradients
 */
export function colorRampToStyle(ramp: ColorRamp): { color: string; alpha: string } {
  const gradient: string[] = []
  const alphaGradient: string[] = []
  for (let i = 0; i < ramp.steps.length; i++) {
    const step = ramp.steps[i]
    const rgb = step.color.getHexString()
    const a = Math.ceil(step.alpha * 255).toString(16)
    gradient.push(`#${rgb} ${step.factor * 100.0}%`)
    alphaGradient.push(`#${a + a + a} ${step.factor * 100.0}%`)
  }
  return {
    color: `linear-gradient(90deg, ${gradient.join(', ')})`,
    alpha: `linear-gradient(90deg, ${alphaGradient.join(', ')})`,
  }
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
    .padStart(2, '0')
  return full ? `#${hex + hex + hex}` : hex
}

/**
 * Converts a THREE.Color object to a RawRGBA object
 * @param color the color
 * @param a alpha value (0-1)
 * @returns 
 */
export function toRawRGBA(color: Color, a: number): RawRGBA {
  return { r: color.r, g: color.g, b: color.b, a }
}

// ----------------------------------------------------------------------------

function createCanvas(w: number, h: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  return canvas
}