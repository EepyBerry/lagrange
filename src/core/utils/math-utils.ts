import seedrandom from 'seedrandom'
import { ref, type Ref } from 'vue'

let currentPRNGSeed = Math.random().toString().substring(2)

// @ts-expect-error Type definitions missing in 'seedrandom' package
export const PRNG: Ref<seedrandom.PRNG> = ref(new seedrandom.alea(currentPRNGSeed))
export const PRNG_SEED: Ref<string> = ref(currentPRNGSeed)

export function regenerateSeed() {
  PRNG_SEED.value = Math.random().toString().substring(2)
}
export function regeneratePRNGIfNecessary(force?: boolean): void {
  if (!force && PRNG_SEED.value === currentPRNGSeed) {
    return
  }
  const s: string = PRNG_SEED.value
  PRNG.value = seedrandom.alea(s)
  PRNG_SEED.value = s
  currentPRNGSeed = s
}
export function clampedPRNG(min: number, max: number, precision: number = 3): number {
  return Number(((max - min) * PRNG.value() + min).toPrecision(precision))
}
export function clampedPRNGSpaced(prev: number, min: number, max: number, precision: number = 3, spacing: number = 1) {
  let result = clampedPRNG(min, max, precision)
  let loop = 0
  while (diff(result, prev) <= spacing && loop < 100) {
    result = clampedPRNG(min, max, precision)
    loop++
  }
  return result
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
  return values.reduce((prev, cur) => prev + cur) / values.length
}

export function diff(a: number, b: number) {
  return Math.abs(Math.max(a, b) - Math.min(a, b))
}

/**
 * Simple float truncating function
 * @param a the number to truncate
 * @param multPrecision the precision as an integer (e.g. 10000 => .toFixed(4))
 */
export function truncateTo(a: number, multPrecision: number): number {
  return Math.trunc(a * multPrecision) / multPrecision
}
