import { CanvasTexture, LinearSRGBColorSpace, RenderTarget } from 'three';
import * as Globals from '@core/globals'
import * as SceneHelper from './scene.helper'
import type PlanetData from '../models/planet-data.model';
import { degToRad } from 'three/src/math/MathUtils.js';
import { EditorSceneCreationMode, type EditorSceneData } from '../types';
import { blobToDataURL, renderToCanvas } from '../utils/render-utils';
import { PostProcessing } from 'three/webgpu';
import { pass } from 'three/tsl';

export async function generatePlanetPreview(data: PlanetData): Promise<string> {
  try {
    const w = 384, h = 384
    const previewRenderTarget = new RenderTarget(w, h, { colorSpace: LinearSRGBColorSpace })

    // TODO: Remove this once the Camera+RenderTarget system works again with WebGPU/TSL
    // ------------------------- Initialize scene & components --------------------------
    const sceneData: EditorSceneData = await SceneHelper.buildEditorScene(data, w, h, w/h, EditorSceneCreationMode.PREVIEW)
    sceneData.camera.setRotationFromAxisAngle(Globals.AXIS_Y, degToRad(data.initCamAngle))
    sceneData.camera.updateProjectionMatrix()
    sceneData.lensFlare!.mesh.visible = false

    // ---------------------------- Prepare Post-Processing -----------------------------
    const postProcessing = new PostProcessing(sceneData.renderer)
    postProcessing.outputNode = pass(sceneData.scene, sceneData.camera)

    // ---------------------------- Setup renderer & render -----------------------------
    const rawBuffer = new Uint8Array(w * h * 4)
    postProcessing.renderer.setRenderTarget(previewRenderTarget)
    await postProcessing.renderAsync()
    rawBuffer.set(await postProcessing.renderer.readRenderTargetPixelsAsync(previewRenderTarget, 0, 0, w, h))
    postProcessing.renderer.setRenderTarget(null)

    // ----------------- Create preview canvas & write data from buffer -----------------
    const tex = new CanvasTexture(renderToCanvas(sceneData.renderer, rawBuffer, w, h))
    const blob = await tex.image.convertToBlob()

    // ------------------------------- Clean-up resources -------------------------------
    postProcessing.dispose()
    previewRenderTarget.dispose()
    SceneHelper.disposeScene(sceneData)
    return await blobToDataURL(blob)
  } catch (err) {
    console.error('<Lagrange> Could not save planet preview!', err)
    return ''
  }
}

