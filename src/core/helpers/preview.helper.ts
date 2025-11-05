import { CanvasTexture, RenderTarget, SRGBColorSpace, Vector3 } from 'three';
import * as Globals from '@core/globals'
import * as SceneHelper from './scene.helper'
import type PlanetData from '../models/planet-data.model';
import { degToRad } from 'three/src/math/MathUtils.js';
import { EditorSceneCreationMode, type EditorSceneData } from '../types';
import { blobToDataURL, renderToCanvas } from '../utils/render-utils';

export async function generatePlanetPreview(data: PlanetData): Promise<string> {
  try {
    const w = 384, h = 384
    const previewRenderTarget = new RenderTarget(w, h, { colorSpace: SRGBColorSpace })

    // TODO: Remove this once the Camera+RenderTarget system works again with WebGPU/TSL
    // ------------------------- Initialize scene & components --------------------------
    const sceneData: EditorSceneData = await SceneHelper.buildEditorScene(data, w, h, w/h, EditorSceneCreationMode.PREVIEW)
    sceneData.camera.setRotationFromAxisAngle(Globals.AXIS_Y, degToRad(data.initCamAngle))
    sceneData.camera.updateProjectionMatrix()
    sceneData.lensFlare!.mesh.visible = false

    // Adjust preview rotation for ringed planets, must be normalized to avoid issues w/ card display
    if (data.ringsEnabled && data.ringsParams.length > 0) {
      const planetRotAxis = new Vector3(1,0,0)
      sceneData.planetGroup.setRotationFromAxisAngle(Globals.AXIS_Y, 0.0)
      planetRotAxis.applyAxisAngle(Globals.AXIS_Y, degToRad(data.initCamAngle))
      sceneData.planetGroup.rotateOnAxis(planetRotAxis, degToRad(5.0))
    }

    // ---------------------------- Setup renderer & render -----------------------------
    const rawBuffer = new Uint8Array(w * h * 4)
    sceneData.renderer.setRenderTarget(previewRenderTarget)
    await sceneData.renderer.renderAsync(sceneData.scene, sceneData.camera)
    rawBuffer.set(await sceneData.renderer.readRenderTargetPixelsAsync(previewRenderTarget, 0, 0, w, h))
    sceneData.renderer.setRenderTarget(null)

    // ----------------- Create preview canvas & write data from buffer -----------------
    const tex = new CanvasTexture(renderToCanvas(sceneData.renderer, rawBuffer, w, h))
    const blob = await tex.image.convertToBlob()

    // ------------------------------- Clean-up resources -------------------------------
    previewRenderTarget.dispose()
    SceneHelper.disposeEditorScene(sceneData)
    return await blobToDataURL(blob)
  } catch (err) {
    console.error('<Lagrange> Could not save planet preview!', err)
    return ''
  }
}

