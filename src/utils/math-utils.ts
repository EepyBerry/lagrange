import type { Rect } from "@/core/types"

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
  return Math.trunc(a*multPrecision)/multPrecision
}

/**
 * Ultra-fast hex colour lerping with factor
 * @see {@link https://stackoverflow.com/a/4787257}
 * @param c1 first color in hex
 * @param c2 second color in hex
 * @returns the mixed color in hex
 */
export function lerpHexColors(a: number, b: number, factor: number) {
  const f2 = 256 * factor
  const f1 = 256 - f2
  return (((((a & 0xff00ff) * f1) + ((b & 0xff00ff) * f2 )) >> 8) & 0xff00ff) 
       | (((((a & 0x00ff00) * f1) + ((b & 0x00ff00) * f2 )) >> 8) & 0x00ff00)
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
  return x >= rect.x && y >= rect.y && x < (rect.x+rect.w) && y < (rect.y+rect.h)
}

/**
 * Finds overlaps on a given w*h plane's borders with a given Rect
 * @param w total plane width
 * @param h total plane height
 * @param rect rect to check overlaps on
 * @returns an array containing overlaps for the top, right, bottom & left sides, in that order
 */
export function findRectOverlaps(w: number, h: number, rect: Rect): number[] {
  const borderOverlaps = [0,0,0,0]
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
    overlaps[3] > 0 ? 1e3 : x-rect.x,
    overlaps[0] > 0 ? 1e3 : y-rect.y,
    overlaps[1] > 0 ? 1e3 : rect.x + rect.w-x,
    overlaps[2] > 0 ? 1e3 : rect.y + rect.h-y
  )
}