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
 * Simple clamp function.
 * @param n the number to clamp
 * @param min minimum value
 * @param max maximum value
 * @returns `n`, so that `min <= n <= max`
 */
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(n, max))
}

/**
 * Simple clamp function, but with `Number.EPSILON` (ε) added to the mix.
 * @param n the number to clamp
 * @param min minimum value
 * @param max maximum value
 * @returns `n`, so that `(min + ε) <= n <= (max - ε)`
 */
export function epsilonClamp(n: number, min: number, max: number): number {
  return Math.max(min + Number.EPSILON, Math.min(n, max - Number.EPSILON))
}

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

export function isWithinRect(rect: Rect, x: number, y: number): boolean {
  return x >= rect.x && y >= rect.y && x < (rect.x+rect.w) && y < (rect.y+rect.h)
}

/**
 * Finds overlaps on a given w*h plane's borders with a given Rect
 * @param w 
 * @param h 
 * @param rect1 
 * @param rect2 
 * @returns 
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
  if (!isWithinRect(rect, x, y)) {
    throw new Error('Cannot find distance of point outside rect!')
  }
  const rl = rect.x + rect.w
  const rh = rect.y + rect.h
  const distances: number[] = [
    overlaps[3] > 0 ? 1e3 : x-rect.x,
    overlaps[0] > 0 ? 1e3 : y-rect.y,
    overlaps[1] > 0 ? 1e3 : rl-x,
    overlaps[2] > 0 ? 1e3 : rh-y
  ]
  return Math.min(...distances)
}