import { CanvasTexture, type TypedArray } from 'three'

export function bufferToTexture(buf: TypedArray, w: number, h: number): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const imgData = new ImageData(new Uint8ClampedArray(buf), w, h)
  ctx.putImageData(imgData, 0, 0)
  //saveAs(canvas.toDataURL(), 'normalmap.png')

  const tex = new CanvasTexture(canvas)
  tex.flipY = false
  canvas.remove()
  return tex
}
