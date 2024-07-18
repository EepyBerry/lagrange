import { LOCALE_MAP } from '@core/globals'

// https://stackoverflow.com/questions/72557387/rgb-to-greyscale-converter
export function rgbToGrayscale(hex: string) {
  return (
    '#' +
    Array(4).join(
      Math.round([0.3, 0.59, 0.11].reduce((a, v, i) => a + v * parseInt(hex[2 * i + 1] + hex[2 * i + 2], 16), 0) / 3)
        .toString(16)
        .padStart(2, '0'),
    )
  )
}

export function numberToHex(n: number): string {
  return '#' + (n & 0x00ffffff).toString(16).padStart(6, '0')
}

export function numberEquals(na: number, nb: number) {
  return Math.abs(na - nb) < Number.EPSILON
}

export function mapLocale(locale: string): string {
  return locale.length > 2 ? locale : (LOCALE_MAP[locale] ?? 'en-US')
}
