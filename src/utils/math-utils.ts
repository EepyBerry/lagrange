import type { RawRGBA, Rect } from '@/core/types'
import seedrandom from 'seedrandom'
import { ref } from 'vue'

// @ts-expect-error Type definitions missing in 'seedrandom' package
export const PRNG = ref(new seedrandom.alea(Math.random().toString().substring(2)))

export function regeneratePRNG(seed?: string): string {
  const s: string = seed ?? Math.random().toString().substring(2)
  PRNG.value = seedrandom.alea(s)
  return s
}
export function clampedPRNG(min: number, max: number): number {
  const v = PRNG.value()
  return (max - min) * v + min
}

/**
 * Simple numeric checking function.
 * @param n the object to check
 * @returns `true` if `n` is a number or can be interpreted as a number (excluding empty values), `false` otherwise
 */
export function isNumeric(n: string | number | boolean): boolean {
  if (['number'].includes(typeof n)) {
    return true
  } else if (!n) {
    return false
  }
  return !isNaN(Number(n))
}

/**
 * Simple average function
 * @param values the values to average
 * @returns the average of the given values
 */
export function avg(...values: number[]) {
  if (values.length === 0) {
    return 0
  }
  return values.reduce((prev, cur) => prev + cur, 0) / values.length
}

/**
 * Simple float truncating function
 * @param a the number to truncate
 * @param multPrecision the precision as an integer (e.g. 10000 => .toFixed(4))
 */
export function truncateTo(a: number, multPrecision: number): number {
  return Math.trunc(a * multPrecision) / multPrecision
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
 * Checks if a given point is withing a rect
 * @param rect the rect to check on
 * @param x point x
 * @param y point y
 * @returns true if the given point is within the rect, false otherwise
 */
export function isWithinRect(rect: Rect, x: number, y: number): boolean {
  return x >= rect.x && y >= rect.y && x < rect.x + rect.w && y < rect.y + rect.h
}

/**
 * Finds overlaps on a given w*h plane's borders with a given Rect
 * @param w total plane width
 * @param h total plane height
 * @param rect rect to check overlaps on
 * @returns an array containing overlaps for the top, right, bottom & left sides, in that order
 */
export function findRectOverlaps(w: number, h: number, rect: Rect): number[] {
  const borderOverlaps = [0, 0, 0, 0]
  borderOverlaps[0] = rect.y === 0 ? 1 : 0
  borderOverlaps[1] = rect.x + rect.w >= w ? 1 : 0
  borderOverlaps[2] = rect.y + rect.h >= h ? 1 : 0
  borderOverlaps[3] = rect.x === 0 ? 1 : 0
  return borderOverlaps
}

/**
 * Finds the nearest point on a rect from the given (x,y) coordinates within that rect
 * @param rect the rect to find the point on
 * @param x point x
 * @param y point y
 * @returns the coordinates of the nearest rect point from (x,y)
 */
export function findMinDistanceToRect(rect: Rect, x: number, y: number, overlaps: number[]): number {
  return Math.min(
    overlaps[3] > 0 ? 1e3 : x - rect.x,
    overlaps[0] > 0 ? 1e3 : y - rect.y,
    overlaps[1] > 0 ? 1e3 : rect.x + rect.w - x,
    overlaps[2] > 0 ? 1e3 : rect.y + rect.h - y,
  )
}
