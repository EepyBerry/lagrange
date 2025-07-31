import * as THREE from 'three';
import * as ComponentHelper from './component.helper';
import * as Globals from '@/core/globals'
import type PlanetData from '../models/planet-data.model';
import { degToRad } from 'three/src/math/MathUtils.js';
import { normalizeUInt8ArrayPixels } from '../utils/render-utils';

export async function generatePlanetPreview(data: PlanetData): Promise<string> {
  const w = 384, h = 384
  const previewRenderTarget = new THREE.WebGLRenderTarget(w, h, {
    colorSpace: THREE.SRGBColorSpace,
  })

  // TODO: Remove this once the Camera+RenderTarget system works again with TSL
  // ------------------------- Initialize scene & components --------------------------
  const { scene, renderer, camera } = ComponentHelper.createScene(data, w, h, w / h)
  camera.setRotationFromAxisAngle(Globals.AXIS_Y, degToRad(data.initCamAngle))
  camera.updateProjectionMatrix()

  // ---------------------------- Setup renderer & render -----------------------------
  const rawBuffer = new Uint8Array(w * h * 4)
  renderer!.setRenderTarget(previewRenderTarget)
  renderer!.render(scene, camera)
  rawBuffer.set(await renderer!.readRenderTargetPixelsAsync(previewRenderTarget, 0, 0, w, h))
  renderer!.setRenderTarget(null)

  // ----------------- Create preview canvas & write data from buffer -----------------
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.createImageData(w, h)
  const previewBuffer = normalizeUInt8ArrayPixels(rawBuffer, w, h)
  for (let i = 0; i < imageData.data.length; i++) {
    imageData.data[i] = previewBuffer[i]
  }
  ctx.putImageData(imageData, 0, 0)

  // ------------------------------- Clean-up resources -------------------------------
  previewRenderTarget.dispose()

  // ----------------------------- Save and remove canvas -----------------------------
  const dataURL = canvas.toDataURL('image/webp')
  canvas.remove()
  return dataURL
}

