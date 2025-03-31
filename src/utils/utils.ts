import type { ColorRamp } from '@/core/models/color-ramp.model'
import type { RawRGBA } from '@/core/types'
import { LOCALE_MAP, MUL_INT8_TO_UNIT } from '@core/globals'
import { Color } from 'three'
import type { Composer } from 'vue-i18n'

export function sleep(delay: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delay))
}

export function toRawRGBA(color: Color, a: number): RawRGBA {
  return { r: color.r, g: color.g, b: color.b, a }
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

export type ColorRampStyle = { color: string; alpha: string }
export function colorRampToStyle(ramp: ColorRamp): ColorRampStyle {
  const gradient: string[] = []
  const alphaGradient: string[] = []
  for (let i = 0; i < ramp.steps.length; i++) {
    const step = ramp.steps[i]
    const rgb = step.color.getHexString()
    const a = Math.ceil(step.alpha * 255).toString(16)
    gradient.push(`#${rgb} ${step.factor * 100.0}%`)
    alphaGradient.push(`#${a + a + a} ${step.factor * 100.0}%`)
  }
  return {
    color: `linear-gradient(90deg, ${gradient.join(', ')})`,
    alpha: `linear-gradient(90deg, ${alphaGradient.join(', ')})`,
  }
}
export function alphaToGrayscale(alpha: number, full = false): string {
  const hex = Math.ceil(alpha * 255)
    .toString(16)
    .padStart(2, '0')
  return full ? `#${hex + hex + hex}` : hex
}
