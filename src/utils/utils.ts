import { LOCALE_MAP } from '@core/globals'

export function sleep(delay: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delay))
}

export function mapLocale(locale: string): string {
  return locale.length > 2 ? locale : (LOCALE_MAP[locale] ?? 'en-US')
}

export function prefersReducedMotion() {
  return (
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches
  )
}