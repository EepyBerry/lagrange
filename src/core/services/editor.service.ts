import { watch } from 'vue';
import { degToRad } from 'three/src/math/MathUtils.js';
import * as Globals from '@core/globals';
import * as ComponentHelper from '@core/helpers/component.helper';
import * as BakingHelper from '@core/helpers/baking.helper';
import { EditorSceneCreationMode, type BakingTarget, type EditorSceneData } from '@core/types';
import { regeneratePRNGIfNecessary } from '@core/utils/math-utils';
import * as ExportHelper from '../helpers/export.helper';
import { idb } from '@/dexie.config';
import { sleep } from '@core/utils/utils';
import * as SceneHelper from '../helpers/scene.helper';
import * as PreviewHelper from '../helpers/preview.helper';
import * as TextureHelper from '../helpers/texture.helper';
import { DoubleSide, Group, MeshStandardNodeMaterial, NearestFilter, Vector2, type NodeMaterial } from 'three/webgpu';
import { saveAs } from 'file-saver';
import { EventBus } from '../event-bus';
import { EDITOR_STATE, EditorStatusCode } from '../state/editor.state';
import { PlanetDataToUniformsObserver } from '../observers/planet-data-to-uniforms.observer';

// Internal attributes
let editorSceneData!: EditorSceneData;
const planetDataToUniformsObserver: PlanetDataToUniformsObserver = new PlanetDataToUniformsObserver();

// ------------------------------------------------------------------------------------------------ //
//                                           EVENT HANDLING                                         //
// ------------------------------------------------------------------------------------------------ //

watch(
  () => EDITOR_STATE.value.status,
  (status) => console.debug('<Lagrange> EditorState => ' + status),
);

// ------------------------------------------------------------------------------------------------ //
//                                           BOOTSTRAPPING                                          //
// ------------------------------------------------------------------------------------------------ //

export async function bootstrapEditor(canvas: HTMLCanvasElement, w: number, h: number, pixelRatio: number) {
  EDITOR_STATE.value.status = EditorStatusCode.Initialization;
  await sleep(50);
  editorSceneData = await SceneHelper.buildEditorScene(
    EDITOR_STATE.value.planetData,
    w,
    h,
    pixelRatio,
    EditorSceneCreationMode.EDITOR,
  );
  ComponentHelper.createOrbitControls(editorSceneData.camera, editorSceneData.renderer.domElement);

  // Configure renderer
  editorSceneData.renderer!.setSize(w, h);
  editorSceneData.renderer!.setAnimationLoop(() => renderFrame());
  editorSceneData.renderer!.domElement.ariaLabel = '3D planet viewer';
  canvas.appendChild(editorSceneData.renderer!.domElement);
  EDITOR_STATE.value.status = EditorStatusCode.Edition;

  // Observe changes in model
  planetDataToUniformsObserver.hookEditorSceneData(editorSceneData);
  EDITOR_STATE.value.planetData.connect(planetDataToUniformsObserver);

  /* LG_SCENE_DATA.renderer!.debug.getShaderAsync(
    LG_SCENE_DATA.scene,
    LG_SCENE_DATA.camera,
    LG_SCENE_DATA.planet.mesh!,
  ).then((data) => console.log(data.fragmentShader)) */
}

/**
 * Removes every object from the scene, then removes the scene itself
 */
export function unloadEditor() {
  EDITOR_STATE.value.status = EditorStatusCode.SceneDisposal;
  console.debug('<Lagrange> Clearing scene... ');
  planetDataToUniformsObserver.unhookEditorSceneData();
  EDITOR_STATE.value.planetData.disconnectAll();
  SceneHelper.disposeScene(editorSceneData);
  console.debug('<Lagrange> ...done!');
  EDITOR_STATE.value.status = EditorStatusCode.Unloaded;
}

// ------------------------------------------------------------------------------------------------ //
//                                          SCENE RENDERING                                         //
// ------------------------------------------------------------------------------------------------ //

function renderFrame() {
  editorSceneData.lensFlare!.update(
    editorSceneData.renderer!,
    editorSceneData.scene!,
    editorSceneData.camera!,
    editorSceneData.clock!,
  );
  editorSceneData.renderer!.render(editorSceneData.scene!, editorSceneData.camera!);
}

export function updateCameraRendering(w: number, h: number) {
  editorSceneData.camera!.aspect = w / h;
  editorSceneData.camera!.updateProjectionMatrix();
  editorSceneData.renderer!.setSize(w, h);
}

// ------------------------------------------------------------------------------------------------ //
//                                          DATA FUNCTIONS                                          //
// ------------------------------------------------------------------------------------------------ //

export async function randomizePlanet() {
  EDITOR_STATE.value.status = EditorStatusCode.Randomization;
  await sleep(50);
  regeneratePRNGIfNecessary();
  EDITOR_STATE.value.planetData.randomize();
  editorSceneData.planet.biomeLayersTexture?.reset(EDITOR_STATE.value.planetData.biomesParams);
  editorSceneData.planet.biomeEmissiveLayersTexture?.reset(EDITOR_STATE.value.planetData.biomesParams);
  EDITOR_STATE.value.status = EditorStatusCode.Edition;
}

export async function resetPlanet() {
  EDITOR_STATE.value.status = EditorStatusCode.Reset;
  EDITOR_STATE.value.planetData.reset();
  editorSceneData.planet.biomeLayersTexture?.reset(EDITOR_STATE.value.planetData.biomesParams);
  editorSceneData.planet.biomeEmissiveLayersTexture?.reset(EDITOR_STATE.value.planetData.biomesParams);
  EDITOR_STATE.value.status = EditorStatusCode.Edition;
}

export function swapSceneSkybox(skybox: string) {
  TextureHelper.loadCubeTextureSkybox(editorSceneData.scene, `/skyboxes/${skybox}/`);
}

export async function takePlanetScreenshot() {
  try {
    await editorSceneData.renderer.render(editorSceneData.scene, editorSceneData.camera);
    editorSceneData.renderer.domElement.toBlob((blob) =>
      saveAs(
        blob as Blob,
        `${EDITOR_STATE.value.planetData.planetName.replaceAll(' ', '_')}-${new Date().toISOString()}.png`,
      ),
    );
  } catch (err) {
    console.error('<Lagrange> Could not export screenshot!', err);
    EventBus.sendToastEvent('warn', 'toast.screenshot_failure', 3000);
  }
}

export async function exportPlanetPreview(): Promise<string> {
  EDITOR_STATE.value.status = EditorStatusCode.PreviewGeneration;
  await sleep(50);
  editorSceneData.lensFlare!.mesh.visible = false;
  const dataURL = await PreviewHelper.generatePlanetPreview(EDITOR_STATE.value.planetData);
  editorSceneData.lensFlare!.mesh.visible = EDITOR_STATE.value.planetData.lensFlareEnabled;
  EDITOR_STATE.value.status = EditorStatusCode.Edition;
  return dataURL;
}

export async function exportPlanetToGLTF(progressDialog: {
  open: () => void;
  setProgress: (value: number) => void;
  setError: (error: unknown) => void;
}) {
  EDITOR_STATE.value.status = EditorStatusCode.Export;
  progressDialog.setProgress(1);
  await sleep(50);
  const bakingTargets: BakingTarget[] = [];

  const appSettings = await idb.settings.limit(1).first();
  const w = appSettings?.bakingResolution ?? 2048,
    h = appSettings?.bakingResolution ?? 2048;
  const { renderer, camera, renderTarget } = await BakingHelper.createBakingObjects(w, h, w / h);

  const planetData = EDITOR_STATE.value.planetData;
  try {
    // ----------------------------------- Bake planet ----------------------------------
    progressDialog.setProgress(2);
    await sleep(50);
    const bakePlanet = BakingHelper.createBakingPlanet(
      planetData,
      editorSceneData.planet.surfaceTexture!,
      editorSceneData.planet.biomeLayersTexture!.texture,
    );
    const bakePlanetSurfaceTex = await BakingHelper.bakeMesh(renderer, camera, renderTarget, bakePlanet);
    if (appSettings?.bakingPixelize) {
      bakePlanetSurfaceTex.minFilter = NearestFilter;
      bakePlanetSurfaceTex.magFilter = NearestFilter;
    }

    progressDialog.setProgress(3);
    await sleep(50);
    const bakeMetallicRoughness = BakingHelper.createBakingMetallicRoughnessMap(planetData);
    const bakePlanetMetallicRoughnessTex = await BakingHelper.bakeMesh(
      renderer,
      camera,
      renderTarget,
      bakeMetallicRoughness,
    );
    if (appSettings?.bakingPixelize) {
      bakePlanetMetallicRoughnessTex.minFilter = NearestFilter;
      bakePlanetMetallicRoughnessTex.magFilter = NearestFilter;
    }
    //LG_SCENE_DATA.planet.biomeEmissiveLayersTexture!.debugSaveTexture()
    const bakeEmissivity = BakingHelper.createBakingEmissivityMap(
      planetData,
      editorSceneData.planet.surfaceTexture!,
      editorSceneData.planet.biomeLayersTexture!.texture,
      editorSceneData.planet.biomeEmissiveLayersTexture!.texture,
    );
    const bakePlanetEmissivityTex = await BakingHelper.bakeMesh(renderer, camera, renderTarget, bakeEmissivity);
    if (appSettings?.bakingPixelize) {
      bakePlanetEmissivityTex.minFilter = NearestFilter;
      bakePlanetEmissivityTex.magFilter = NearestFilter;
    }

    progressDialog.setProgress(4);
    await sleep(50);
    const bakeHeight = BakingHelper.createBakingHeightMap(planetData);
    const bakePlanetHeightTex = await BakingHelper.bakeMesh(renderer, camera, renderTarget, bakeHeight);

    const bakeNormal = BakingHelper.createBakingNormalMap(planetData, bakePlanetHeightTex);
    const bakePlanetNormalTex = await BakingHelper.bakeMesh(renderer, camera, renderTarget, bakeNormal);
    if (appSettings?.bakingPixelize) {
      bakePlanetNormalTex.minFilter = NearestFilter;
      bakePlanetNormalTex.magFilter = NearestFilter;
    }

    bakePlanet.material = new MeshStandardNodeMaterial({
      map: bakePlanetSurfaceTex,
      roughnessMap: bakePlanetMetallicRoughnessTex,
      metalnessMap: bakePlanetMetallicRoughnessTex,
      emissiveMap: bakePlanetEmissivityTex,
      normalMap: bakePlanetNormalTex,
      normalScale: new Vector2(planetData.planetSurfaceBumpStrength).multiplyScalar(2.0),
    });
    bakingTargets.push({
      mesh: bakePlanet,
      textures: [bakePlanetSurfaceTex, bakePlanetMetallicRoughnessTex, bakePlanetHeightTex],
    });

    // ----------------------------------- Bake clouds ----------------------------------
    if (planetData.cloudsEnabled) {
      progressDialog.setProgress(5);
      await sleep(50);
      const bakeClouds = BakingHelper.createBakingClouds(planetData, editorSceneData.clouds.texture!);
      const bakeCloudsTex = await BakingHelper.bakeMesh(renderer, camera, renderTarget, bakeClouds);
      if (appSettings?.bakingPixelize) {
        bakeCloudsTex.minFilter = NearestFilter;
        bakeCloudsTex.magFilter = NearestFilter;
      }

      bakeClouds.material = new MeshStandardNodeMaterial({
        map: bakeCloudsTex,
        opacity: 1.0,
        transparent: true,
      });
      bakingTargets.push({ mesh: bakeClouds, textures: [bakeCloudsTex] });
      bakePlanet.add(bakeClouds);
      bakeClouds.setRotationFromAxisAngle(bakeClouds.up, degToRad(planetData.cloudsRotation));
    }

    // --------------------------------- Bake ring system -------------------------------
    if (planetData.ringsEnabled) {
      progressDialog.setProgress(6);
      await sleep(50);
      const ringGroup = new Group();
      ringGroup.name = Globals.MESH_NAME_RING_ANCHOR;
      for (let idx = 0; idx < planetData.ringsParams.length; idx++) {
        const params = planetData.ringsParams[idx];
        const ringMeshData = editorSceneData.rings?.find((r) => r.mesh!.name === params.id);
        if (!ringMeshData) continue;

        const bakeRing = BakingHelper.createBakingRing(planetData, ringMeshData.texture!, idx);
        const bakeRingTex = await BakingHelper.bakeMesh(renderer, camera, renderTarget, bakeRing);
        if (appSettings?.bakingPixelize) {
          bakeRingTex.minFilter = NearestFilter;
          bakeRingTex.magFilter = NearestFilter;
        }

        bakeRing.material = new MeshStandardNodeMaterial({
          map: bakeRingTex,
          side: DoubleSide,
          transparent: true,
        });
        bakingTargets.push({ mesh: bakeRing, textures: [bakeRingTex] });
        ringGroup.add(bakeRing);
        bakeRing.setRotationFromAxisAngle(Globals.AXIS_X, degToRad(90));
      }
      bakePlanet.add(ringGroup);
    }

    // ---------------------------- Export meshes and clean up ---------------------------
    progressDialog.setProgress(7);
    await sleep(50);

    bakePlanet.scale.setScalar(planetData.planetRadius);
    bakePlanet.setRotationFromAxisAngle(Globals.AXIS_X, degToRad(planetData.planetAxialTilt));
    bakePlanet.rotateOnAxis(bakePlanet.up, degToRad(planetData.planetRotation));

    bakePlanet.name = planetData.planetName;
    ExportHelper.exportMeshesToGLTF([bakePlanet], planetData.planetName.replaceAll(' ', '_') + `_${w}`);
  } catch (error) {
    console.error(error);
    progressDialog.setError(error);
  } finally {
    bakingTargets.forEach((bt) => {
      bt.textures.forEach((tex) => tex.dispose());
      (bt.mesh.material as NodeMaterial)?.dispose();
      bt.mesh.geometry?.dispose();
    });
    renderTarget.dispose();
    renderer.dispose();
    progressDialog.setProgress(8);
    await sleep(50);
    EDITOR_STATE.value.status = EditorStatusCode.Edition;
  }
}
