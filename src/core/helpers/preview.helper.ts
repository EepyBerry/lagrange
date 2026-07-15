import { CanvasTexture, Group, LinearSRGBColorSpace, RenderTarget } from 'three';
import * as Globals from '@core/globals'
import * as SceneHelper from './scene.helper'
import type PlanetData from '@core/models/planet/planet-data.model.ts';
import { degToRad } from 'three/src/math/MathUtils.js';
import { EditorSceneCreationMode, type EditorSceneData } from '../types';
import { blobToDataURL, renderToCanvas } from '../utils/render-utils';
import { RenderPipeline } from 'three/webgpu';
import { pass } from 'three/tsl';
import { sleep } from "@core/utils/utils.ts";

export async function generatePlanetPreview(data: PlanetData): Promise<string> {
  try {
    const w = 384, h = 384;
    const previewRenderTarget = new RenderTarget(w, h, { colorSpace: LinearSRGBColorSpace });
    const previewSceneData: Partial<EditorSceneData> = {
      rings: [],
      planetGroup: new Group(),
      ringAnchor: new Group(),
    };

    // ------------------------- Initialize scene & components --------------------------
    await SceneHelper.buildEditorScene(data, previewSceneData, w, h, w/h, EditorSceneCreationMode.Preview);
    previewSceneData.camera!.setRotationFromAxisAngle(Globals.AXIS_Y, degToRad(data.initCamAngle));
    previewSceneData.camera!.updateProjectionMatrix();
    previewSceneData.lensFlare!.mesh.visible = false;

    // ---------------------------- Prepare Post-Processing -----------------------------
    const renderPipeline = new RenderPipeline(previewSceneData.renderer!);
    renderPipeline.outputNode = pass(previewSceneData.scene!, previewSceneData.camera!);

    // ---------------------------- Setup renderer & render -----------------------------
    const rawBuffer = new Uint8Array(w * h * 4);
    previewSceneData.renderer!.setRenderTarget(previewRenderTarget);
    await previewSceneData.renderer!.init();
    // loading everything takes a little bit of time as we wait for the texture worker to complete its work,
    // so we add an arbitrary sleep call before rendering
    await sleep(500);
    renderPipeline.render();
    rawBuffer.set(await previewSceneData.renderer!.readRenderTargetPixelsAsync(previewRenderTarget, 0, 0, w, h));
    previewSceneData.renderer!.setRenderTarget(null);

    // ----------------- Create preview canvas & write data from buffer -----------------
    const tex = new CanvasTexture(renderToCanvas(previewSceneData.renderer!, rawBuffer, w, h));
    const blob = await tex.image.convertToBlob();

    // ------------------------------- Clean-up resources -------------------------------
    renderPipeline.dispose();
    previewRenderTarget.dispose();
    SceneHelper.disposeScene(previewSceneData as EditorSceneData);
    return await blobToDataURL(blob);
  } catch (err) {
    console.error('<Lagrange> Could not save planet preview!', err);
    return '';
  }
}

