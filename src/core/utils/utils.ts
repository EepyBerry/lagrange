import { LOCALE_MAP } from '@core/globals'

// note: 'any' needed as we have a loose object, and never/unknown act weird with the reduce function below
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setObjectValue(obj: Record<string, any>, path: string, value: unknown) {
  const pathArray = path.match(/([^[.\]])+/g)
  if (!pathArray) throw new Error("No property path found in object");
  pathArray.reduce((acc, key, i) => {
    if (acc[key] === undefined) acc[key] = {}
    if (i === pathArray.length - 1) acc[key] = value
    return acc[key]
  }, obj)
}

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
