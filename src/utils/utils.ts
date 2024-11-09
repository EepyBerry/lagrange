import type { RawRGBA } from '@/core/types'
import { LOCALE_MAP } from '@core/globals'
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
