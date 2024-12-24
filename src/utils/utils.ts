import { TEXTURE_LOADER } from '@/core/three/external-data.loader'
import type { RawRGBA } from '@/core/types'
import { LOCALE_MAP, MUL_INT8_TO_UNIT } from '@core/globals'
import saveAs from 'file-saver'
import type { Color, Texture, TypedArray } from 'three'
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
  return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b
}
export function getLinearRGBLuminance(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
export function getLinearUint8Luminance(r: number, g: number, b: number) {
  return 0.2126 * (r * MUL_INT8_TO_UNIT) + 0.7152 * (g * MUL_INT8_TO_UNIT) + 0.0722 * (b * MUL_INT8_TO_UNIT)
}

// ----------------------------------------------------------------------------

export async function blurTexture(tex: Texture, w: number, h: number): Promise<Texture> {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.filter = 'blur(2px)'
  ctx.drawImage(tex.image, 0, 0)
  //saveAs(canvas.toDataURL(), 'normalmap.png')

  const blurTex = await TEXTURE_LOADER.loadAsync(canvas.toDataURL())
  canvas.remove()
  return blurTex
}

export async function scaleTexture(tex: Texture, w: number, h: number, factor: number): Promise<Texture> {
  const canvas = document.createElement('canvas')
  canvas.width = w * factor
  canvas.height = h * factor
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(tex.image, 0, 0, w * factor, h * factor)
  //saveAs(canvas.toDataURL(), 'normalmap.png')

  const blurTex = await TEXTURE_LOADER.loadAsync(canvas.toDataURL())
  canvas.remove()
  return blurTex
}

export async function bufferToTexture(buf: Uint8Array, w: number, h: number): Promise<Texture> {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const imgData = new ImageData(new Uint8ClampedArray(buf), w, h)
  ctx.putImageData(imgData, 0, 0)
  saveAs(canvas.toDataURL(), 'normalmap.png')

  const tex = await TEXTURE_LOADER.loadAsync(canvas.toDataURL())
  tex.flipY = false
  canvas.remove()
  return tex
}