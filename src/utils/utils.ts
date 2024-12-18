import type { RawRGBA } from '@/core/types'
import { LOCALE_MAP, MUL_INT8_TO_UNIT } from '@core/globals'
import type { Color } from 'three'
import type { Composer } from 'vue-i18n'

export function toRawRGBA(color: Color, a: number): RawRGBA {
  return { r: color.r, g: color.g, b: color.b, a }
}

export function hexNumberToString(n: number, hash?: boolean): string {
  return (hash ? '#' : '') + n.toString(16).padStart(6, '0')
}

export function strToHexNumber(n: string): number {
  return Number('0x' + n.substring(+n.startsWith('#')))
}

export function mapLocale(locale: string): string {
  return locale.length > 2 ? locale : (LOCALE_MAP[locale] ?? 'en-US')
}

export function getPlanetMetaTitle(planetName: string, i18n: Composer): string {
  return `[${planetName}]` + ' · ' + i18n.t('main.$title')
}

export function prefersReducedMotion() {
  return (
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches
  )
}

// ----------------------------------------------------------------------------

export function getColorLuminance(color: Color) {
  return (0.2126 * color.r) + (0.7152 * color.g) + (0.0722 * color.b)
}
export function getLinearRGBLuminance(r: number, g: number, b: number) {
  return (0.2126 * r) + (0.7152 * g) + (0.0722 * b)
}
export function getLinearUint8Luminance(r: number, g: number, b: number) {
  return (0.2126 * (r * MUL_INT8_TO_UNIT)) + (0.7152 * (g * MUL_INT8_TO_UNIT)) + (0.0722 * (b * MUL_INT8_TO_UNIT))
}