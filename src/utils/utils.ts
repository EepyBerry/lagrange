import { LOCALE_MAP } from '@core/globals'
import type { Composer } from 'vue-i18n'

export function toHexNumber(n: string): number {
  return Number('0x' + n.substring(+(n.startsWith('#'))))
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
