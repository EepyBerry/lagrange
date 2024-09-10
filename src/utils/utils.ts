import { LOCALE_MAP } from '@core/globals'
import type { Composer } from 'vue-i18n'

export function numberToHex(n: number, hash?: boolean): string {
  return (hash ? '#' : '') + (Math.round(n) & 0x00ffffff).toString(16).padStart(6, '0')
}
export function toHexNumber(n: string): number {
  return Number('0x' + n.substring(+(n.startsWith('#'))))
}
export function hexToNumber(n: string): number {
  return Number('0x' + n)
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
