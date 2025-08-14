import { RenderTarget, SRGBColorSpace } from 'three';
import * as Globals from '@/core/globals'
import * as SceneHelper from './scene.helper'
import type PlanetData from '../models/planet-data.model';
import { degToRad } from 'three/src/math/MathUtils.js';
import { normalizeUInt8ArrayPixels } from '../utils/render-utils';
import { SceneCreationMode, type EditorSceneData } from '../types';

export async function generatePlanetPreview(data: PlanetData): Promise<string> {
  const w = 384, h = 384
  const previewRenderTarget = new RenderTarget(w, h, {
    colorSpace: SRGBColorSpace,
  })

  // TODO: Remove this once the Camera+RenderTarget system works again with WebGPU/TSL
  // ------------------------- Initialize scene & components --------------------------
  const sceneData: EditorSceneData = SceneHelper.buildEditorScene(data, w, h, w/h, SceneCreationMode.PREVIEW)
  sceneData.camera.setRotationFromAxisAngle(Globals.AXIS_Y, degToRad(data.initCamAngle))
  sceneData.camera.updateProjectionMatrix()
  sceneData.lensFlare!.mesh.visible = false

  // ---------------------------- Setup renderer & render -----------------------------
  const rawBuffer = new Uint8Array(w * h * 4)
  sceneData.renderer.setRenderTarget(previewRenderTarget)
  await sceneData.renderer.renderAsync(sceneData.scene, sceneData.camera)
  rawBuffer.set(await sceneData.renderer.readRenderTargetPixelsAsync(previewRenderTarget, 0, 0, w, h))
  sceneData.renderer.setRenderTarget(null)

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
  SceneHelper.disposeEditorScene(sceneData)

  // ----------------------------- Save and remove canvas -----------------------------
  const dataURL = canvas.toDataURL('image/webp')
  canvas.remove()
  return dataURL
}

