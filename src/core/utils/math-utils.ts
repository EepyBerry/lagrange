import seedrandom from 'seedrandom';
import { Color } from 'three';
import { ref, type Ref } from 'vue';

/**
 * Okay, explanation required for this value:
 *
 * We know that `0x010101 (65793)` is the darkest possible RGB 8-bit color. Thus, we use it
 * as a multiplier with a value from `0` to `255` to get a grayscale color
 * from `(0x)000000` to `(0x)ffffff`
 * @example 0x5c5c5c = (0x5c * 0x010101) = (92 * 0x010101)
 */
const GRAYSCALE_MULTIPLIER = 0x010101;

/**
 * Current PRNG seed value
 */
let currentPRNGSeed = Math.random().toString().substring(2);

// @ts-expect-error Type definitions missing in 'seedrandom' package
export const PRNG: Ref<seedrandom.PRNG> = ref(new seedrandom.alea(currentPRNGSeed));
export const PRNG_SEED: Ref<string> = ref(currentPRNGSeed);

/**
 * Recalculates a PRNG seed for the randomizer
 */
export function regenerateSeed() {
  PRNG_SEED.value = Math.random().toString().substring(2);
}

/**
 * Rebuilds a PRNG instance when necessary (i.e. either forced or when seeds are different)
 * @param force force PRNG recreation using this flag
 */
export function regeneratePRNGIfNecessary(force?: boolean): void {
  if (!force && PRNG_SEED.value === currentPRNGSeed) {
    return;
  }
  const s: string = PRNG_SEED.value;
  PRNG.value = seedrandom.alea(s);
  PRNG_SEED.value = s;
  currentPRNGSeed = s;
}

/**
 * Generates a clamped PRNG value between the given min/max values, with the given number of decimal digits
 * @param min minimum allowed value
 * @param max maximum allowed value
 * @param digits number of digits after the decimal point (0-20)
 * @returns a new number within the given parameters, based on the current PRNG seed
 */
export function clampedPRNG(min: number, max: number, digits: number = 3): number {
  return Number(((max - min) * PRNG.value() + min).toFixed(digits));
}

/**
 * Brute-force {@link clampedPRNG} alternative where a minimum spacing value is required
 * @param prev previous generated or fixed value, as a reference
 * @param min minimum allowed value
 * @param max maximum allowed value
 * @param precision number of digits after the decimal point (0-20)
 * @param spacing minimum absolute difference required between `prev` and this function's result
 * @returns 
 */
export function clampedPRNGSpaced(prev: number, min: number, max: number, precision: number = 3, spacing: number = 1): number {
  let result = clampedPRNG(min, max, precision);
  let loop = 0;
  while (diff(result, prev) <= spacing && loop < 100) {
    result = clampedPRNG(min, max, precision);
    loop++;
  }
  return result;
}

/**
 * Generates a random boolean, self-explanatory
 * @returns the boolean
 */
export function randomBoolean(): boolean {
  return Boolean(Math.round(clampedPRNG(0, 1)));
}

/**
 * Generates a random `THREE.Color`, in grayscale or not
 * @param grayscale if the color generated should be grayscale
 * @returns a new color, derived from PRNG
 */
export function randomColor(grayscale: boolean): Color {
  return new Color(
    grayscale ? Math.round(clampedPRNG(0, 255)) * GRAYSCALE_MULTIPLIER : Math.round(clampedPRNG(0, 0xffffff)),
  );
}

/**
 * Generates a sorted array of intervals (pairs of numbers)
 * @param min min PRNG value
 * @param max max PRNG value
 * @param intervals number of intervals to generate
 * @returns the requested array of intervals
 * @example randomIntervals(0, 1, 3) => [[0.125, 0.273], [0.543, 0.861], [0.886, 0.892]]
 */
export function randomIntervals(min: number, max: number, intervals: number) {
  const numbers = [];
  for (let i = 0; i < intervals; i++) {
    numbers.push(clampedPRNG(min, max));
  }
  numbers.sort((a, b) => a - b);
  return numbers.flatMap((_, i, arr) => (i % 2 ? [] : [arr.slice(i, i + 2)]));
}

/**
 * Simple numeric checking function
 * @param n the primitive to check
 * @returns `true` if `n` is a number or can be interpreted as a number (excluding empty values), `false` otherwise
 */
export function isNumeric(n: string | number | boolean): boolean {
  if (['number'].includes(typeof n)) {
    return true;
  } else if (!n) {
    return false;
  }
  return !isNaN(Number(n));
}

/**
 * Simple average function
 * @param values the values to average
 * @returns the average of the given values
 */
export function avg(...values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((prev, cur) => prev + cur) / values.length;
}

/**
 * Simple difference function
 * @param a first value
 * @param b second value
 * @returns the (absolute) difference between these numbers
 */
export function diff(a: number, b: number): number {
  return Math.abs(Math.max(a, b) - Math.min(a, b));
}

/**
 * Simple float truncating function
 * @param a the number to truncate
 * @param multPrecision the precision as an integer (e.g. 10000 => .toFixed(4))
 */
export function truncateTo(a: number, multPrecision: number): number {
  return Math.trunc(a * multPrecision) / multPrecision;
}
