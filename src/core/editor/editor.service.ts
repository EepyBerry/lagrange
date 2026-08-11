import type { ExportProgressDialogExposes } from '@components/editor/dialogs/ExportProgressDialog.types.ts';
import type { DataEventPayloadTypeMap } from '@core/editor/event/data-event.types.ts';
import type { BakingWorkerOutput, BakingWorkerOutputData } from '@core/editor/workers/baking.worker.ts';
import { DataEventEndpoint } from '@core/editor/event/data-event-endpoint.ts';
import { EDITOR_SCENE_DATA, EDITOR_STATE, EDITOR_WORKERS, EditorStatusCode } from '@core/editor/state/editor.state.ts';
import { BakingWorkerInterface } from '@core/editor/workers/baking.worker-interface.ts';
import { TextureWorkerInterface } from '@core/editor/workers/texture.worker-interface.ts';
import * as Globals from '@core/globals.ts';
import { AXIS_X } from '@core/globals.ts';
import * as ComponentHelper from '@core/helpers/component.helper.ts';
import { createRingGeometryComponent } from '@core/helpers/component.helper.ts';
import { exportMeshesToGLTF } from '@core/helpers/export.helper.ts';
import * as PreviewHelper from '@core/helpers/preview.helper.ts';
import * as SceneHelper from '@core/helpers/scene.helper.ts';
import * as TextureHelper from '@core/helpers/texture.helper.ts';
import { randomizePlanetData, resetPlanetData } from '@core/models/planet/planet-data.utils.ts';
import { EditorSceneCreationMode, type EditorSceneData } from '@core/types.ts';
import { UIEventBus } from '@core/ui-event-bus.ts';
import { regeneratePRNGIfNecessary } from '@core/utils/math-utils.ts';
import { toDataTexture } from '@core/utils/render-utils.ts';
import { sleep } from '@core/utils/utils.ts';
import { saveAs } from 'file-saver';
import { DoubleSide, Group, MOUSE, Vector2 } from 'three';
import { GLTFExporter } from 'three/addons';
import { clamp, degToRad } from 'three/src/math/MathUtils.js';
import { Mesh, MeshStandardNodeMaterial, type NodeMaterial } from 'three/webgpu';
import { watch } from 'vue';
import { type CameraMouseControlsScheme, idb } from '@/dexie.config.ts';

// Internal attributes
const gltfExporter = new GLTFExporter();
const dataEventEndpoint: DataEventEndpoint<keyof DataEventPayloadTypeMap> = new DataEventEndpoint<
  keyof DataEventPayloadTypeMap
>('endpoint-service');

// ------------------------------------------------------------------------------------------------ //
//                                             DEBUGGING                                            //
// ------------------------------------------------------------------------------------------------ //

watch(
  () => EDITOR_STATE.value.status,
  (status) => console.debug('<Lagrange> EditorState => ' + status),
);

// ------------------------------------------------------------------------------------------------ //
//                                           BOOTSTRAPPING                                          //
// ------------------------------------------------------------------------------------------------ //

export async function bootstrapEditor(sceneRoot: HTMLElement, w: number, h: number, pixelRatio: number) {
  EDITOR_STATE.value.status = EditorStatusCode.Initialization;
  initEditorWorkers();
  await initEditorSceneAndRendering(sceneRoot, w, h, pixelRatio);
  initEditorEventSystem();
  EDITOR_STATE.value.status = EditorStatusCode.Edition;

  /*editorSceneData
    .renderer!.debug.getShaderAsync(editorSceneData.scene, editorSceneData.camera, editorSceneData.planet.mesh!)
    .then((data) => console.log(data.fragmentShader));*/
}

async function initEditorSceneAndRendering(
  sceneRoot: HTMLElement,
  w: number,
  h: number,
  pixelRatio: number,
): Promise<void> {
  await SceneHelper.buildEditorScene(
    EDITOR_STATE.value.planetData,
    EDITOR_SCENE_DATA,
    w,
    h,
    pixelRatio,
    EditorSceneCreationMode.Editor,
  );
  EDITOR_SCENE_DATA.orbitControls = await ComponentHelper.createOrbitControls(
    EDITOR_SCENE_DATA.camera!,
    EDITOR_SCENE_DATA.renderer!.domElement,
  );

  // Configure renderer
  if (!EDITOR_SCENE_DATA.renderer!.initialized) {
    await EDITOR_SCENE_DATA.renderer!.init();
  }
  EDITOR_SCENE_DATA.renderer!.setSize(w, h);
  await EDITOR_SCENE_DATA.renderer!.setAnimationLoop(() => renderFrame());
  EDITOR_SCENE_DATA.renderer!.domElement.ariaLabel = '3D planet viewer';
  sceneRoot.appendChild(EDITOR_SCENE_DATA.renderer!.domElement);

  // Connect renderPipeline
  EDITOR_SCENE_DATA.renderPipeline = ComponentHelper.createRenderPipeline(
    EDITOR_STATE.value.renderPipelineData,
    EDITOR_SCENE_DATA.renderer!,
    EDITOR_SCENE_DATA.scene!,
    EDITOR_SCENE_DATA.camera!,
  );
}

function initEditorWorkers(): void {
  EDITOR_WORKERS.baking = new BakingWorkerInterface();
  EDITOR_WORKERS.texture = new TextureWorkerInterface();
}

function initEditorEventSystem(): void {
  dataEventEndpoint
    .on('lensFlareEnabled', (payload) => (EDITOR_SCENE_DATA.lensFlare!.mesh!.visible = payload.value))
    .on('sunlightAngle', (payload) => {
      const vRad = degToRad(Number.isNaN(payload.value) ? 0 : payload.value);
      const newPos = Globals.SUN_INIT_POS.clone().applyAxisAngle(Globals.AXIS_X, vRad);
      EDITOR_SCENE_DATA.sunLight!.position.set(newPos.x, newPos.y, newPos.z);
    })
    .on('sunlightColor', (payload) => EDITOR_SCENE_DATA.sunLight!.color.set(payload.value))
    .on('sunlightIntensity', (payload) => (EDITOR_SCENE_DATA.sunLight!.intensity = payload.value))
    .on('ambientLightColor', (payload) => EDITOR_SCENE_DATA.ambLight!.color.set(payload.value))
    .on('ambientLightIntensity', (payload) => (EDITOR_SCENE_DATA.ambLight!.intensity = payload.value))
    .on('radius', (payload) => EDITOR_SCENE_DATA.planetGroup!.scale.setScalar(payload.value.surface))
    .on('axialTilt', (payload) => {
      const v = degToRad(Number.isNaN(payload.value) ? 0 : payload.value);
      EDITOR_SCENE_DATA.planetGroup!.setRotationFromAxisAngle(Globals.AXIS_X, v);
    })
    .on('rotation', (payload) => {
      const vRadSurface = degToRad(Number.isNaN(payload.value.surface) ? 0 : payload.value.surface);
      const vRadClouds = degToRad(Number.isNaN(payload.value.clouds) ? 0 : payload.value.clouds);
      EDITOR_SCENE_DATA.planet!.mesh!.setRotationFromAxisAngle(EDITOR_SCENE_DATA.planet!.mesh!.up, vRadSurface);
      EDITOR_SCENE_DATA.clouds!.mesh.setRotationFromAxisAngle(
        EDITOR_SCENE_DATA.clouds!.mesh.up,
        vRadSurface + vRadClouds,
      );
    })
    .on('cloudsEnabled', (payload) => (EDITOR_SCENE_DATA.clouds!.mesh.visible = payload.value))
    .on('cloudsRotation', (payload) => {
      const vRadSurface = degToRad(Number.isNaN(payload.value.surface) ? 0 : payload.value.surface);
      const vRadClouds = degToRad(Number.isNaN(payload.value.clouds) ? 0 : payload.value.clouds);
      EDITOR_SCENE_DATA.clouds!.mesh.setRotationFromAxisAngle(
        EDITOR_SCENE_DATA.clouds!.mesh.up,
        vRadSurface + vRadClouds,
      );
    })
    .on('atmosphereEnabled', (payload) => (EDITOR_SCENE_DATA.atmosphere!.mesh.visible = payload.value))
    .on('atmosphereHeight', (payload) => {
      const geoQuality = EDITOR_STATE.value.planetData.planetMeshQuality;
      EDITOR_SCENE_DATA.atmosphere!.mesh.geometry.dispose();
      EDITOR_SCENE_DATA.atmosphere!.mesh.geometry = ComponentHelper.createSphereGeometryComponent(
        geoQuality,
        1 + payload.value,
      );
    })
    .on('ringsEnabled', (payload) => {
      EDITOR_SCENE_DATA.ringAnchor!.visible = payload.value;
      EDITOR_SCENE_DATA.ringAnchor!.children.forEach((r) => (r.visible = payload.value));
    })
    .on('ringParametersUpdate', (payload) => {
      const ringId = payload.value.id;
      const ringMeshData = EDITOR_SCENE_DATA.rings!.find((md) => md.mesh.name === ringId);
      if (!ringMeshData) {
        console.error(`Cannot process event [ringParametersUpdate] for ring ID ${ringId}: mesh not found`);
        return;
      }
      ringMeshData.mesh.geometry.dispose();
      ringMeshData.mesh.geometry = createRingGeometryComponent(
        EDITOR_STATE.value.planetData.planetMeshQuality,
        payload.value.innerRadius,
        payload.value.outerRadius,
      );
    })
    .on('ringAdd', (payload) => {
      const newMeshData = ComponentHelper.createRing(EDITOR_STATE.value.planetData, payload.value);
      EDITOR_SCENE_DATA.rings!.push(newMeshData);
      EDITOR_SCENE_DATA.ringAnchor!.add(newMeshData.mesh!);
      newMeshData.tslMaterial.dataEventEndpoint.id = `endpoint-ring-${payload.value.id}`;
      EDITOR_STATE.value.planetData.dataEventEndpoint.addListeners([newMeshData.tslMaterial.dataEventEndpoint]);
    })
    .on('ringRemove', (payload) => {
      const ringId = payload.value.id;
      const ringMeshData = EDITOR_SCENE_DATA.rings!.find((md) => md.mesh.name === ringId);
      if (!ringMeshData) {
        console.error(`Cannot process event [ringRemove] for ring ID ${ringId}: mesh not found`);
        return;
      }
      EDITOR_STATE.value.planetData.dataEventEndpoint.disconnectListenerWithId(`endpoint-ring-${ringId}`);
      ComponentHelper.disposeRing(EDITOR_SCENE_DATA.ringAnchor!, EDITOR_SCENE_DATA.rings!, payload.value.id);
    })
    .on('ringsClear', (payload) => {
      payload.value.forEach((ringId) => {
        EDITOR_STATE.value.planetData.dataEventEndpoint.disconnectListenerWithId(`endpoint-ring-${ringId}`);
        ComponentHelper.disposeRing(EDITOR_SCENE_DATA.ringAnchor!, EDITOR_SCENE_DATA.rings!, ringId);
      });
    })
    // render pipeline
    .on('renderBasePipeline', () => {
      (<NodeMaterial>EDITOR_SCENE_DATA.planet!.mesh!.material).needsUpdate = true;
      (<NodeMaterial>EDITOR_SCENE_DATA.clouds!.mesh!.material).needsUpdate = true;
      (<NodeMaterial>EDITOR_SCENE_DATA.atmosphere!.mesh!.material).needsUpdate = true;
    });

  EDITOR_STATE.value.planetData.dataEventEndpoint.addListeners([
    dataEventEndpoint,
    EDITOR_SCENE_DATA.planet!.tslMaterial.dataEventEndpoint,
    EDITOR_SCENE_DATA.clouds!.tslMaterial.dataEventEndpoint,
    EDITOR_SCENE_DATA.atmosphere!.tslMaterial.dataEventEndpoint,
    EDITOR_SCENE_DATA.lensFlare!.tslMaterial.dataEventEndpoint,
  ]);
  if (EDITOR_SCENE_DATA.rings && EDITOR_SCENE_DATA.rings?.length > 0) {
    EDITOR_STATE.value.planetData.dataEventEndpoint.addListeners(
      EDITOR_SCENE_DATA.rings.map((r) => {
        r.tslMaterial.dataEventEndpoint.id = `endpoint-ring-${r.tslMaterial.ringInstanceId}`;
        return r.tslMaterial.dataEventEndpoint;
      }),
    );
    console.log(EDITOR_STATE.value.planetData.dataEventEndpoint);
  }
  EDITOR_STATE.value.renderPipelineData.dataEventEndpoint.addListeners([
    dataEventEndpoint,
    EDITOR_SCENE_DATA.renderPipeline!.dataEventEndpoint,
  ]);
}

/**
 * Removes every object from the scene, then removes the scene itself
 */
export function unloadEditor() {
  EDITOR_STATE.value.status = EditorStatusCode.SceneDisposal;
  console.debug('<Lagrange> Terminating workers... ');
  EDITOR_WORKERS.baking?.terminate();
  EDITOR_WORKERS.texture?.terminate();
  console.debug('<Lagrange> Tearing down event system... ');
  EDITOR_STATE.value.planetData.dataEventEndpoint.dispose();
  EDITOR_STATE.value.renderPipelineData.dataEventEndpoint.dispose();
  console.debug('<Lagrange> Clearing scene... ');
  SceneHelper.disposeScene(EDITOR_SCENE_DATA as EditorSceneData);
  console.debug('<Lagrange> ...done!');
  EDITOR_STATE.value.status = EditorStatusCode.Unloaded;
}

// ------------------------------------------------------------------------------------------------ //
//                                          SCENE RENDERING                                         //
// ------------------------------------------------------------------------------------------------ //

function renderFrame() {
  EDITOR_SCENE_DATA.timer!.update();
  EDITOR_SCENE_DATA.lensFlare!.update(
    EDITOR_SCENE_DATA.renderer!,
    EDITOR_SCENE_DATA.scene!,
    EDITOR_SCENE_DATA.camera!,
    EDITOR_SCENE_DATA.timer!,
  );
  //editorSceneData.renderer.render(editorSceneData.scene, editorSceneData.camera);
  EDITOR_SCENE_DATA.renderPipeline?.pipeline.render();
}

export function updateCameraRendering(w: number, h: number) {
  EDITOR_SCENE_DATA.camera!.aspect = w / h;
  EDITOR_SCENE_DATA.camera!.updateProjectionMatrix();
  EDITOR_SCENE_DATA.renderer!.setSize(w, h);
}

// ------------------------------------------------------------------------------------------------ //
//                                          DATA FUNCTIONS                                          //
// ------------------------------------------------------------------------------------------------ //

export async function randomizePlanet() {
  EDITOR_STATE.value.status = EditorStatusCode.Randomization;
  await sleep(50);
  regeneratePRNGIfNecessary();
  randomizePlanetData(EDITOR_STATE.value.planetData);
  EDITOR_STATE.value.planetEditedFlag = true;
  EDITOR_STATE.value.status = EditorStatusCode.Edition;
}

export async function resetPlanet() {
  EDITOR_STATE.value.status = EditorStatusCode.Reset;
  resetPlanetData(EDITOR_STATE.value.planetData);
  EDITOR_STATE.value.planetEditedFlag = true;
  EDITOR_STATE.value.status = EditorStatusCode.Edition;
}

export function swapSceneSkybox(skybox: string) {
  TextureHelper.loadCubeTextureSkybox(EDITOR_SCENE_DATA.scene!, `/skyboxes/${skybox}/`);
}

export async function takePlanetScreenshot() {
  try {
    EDITOR_SCENE_DATA.renderPipeline?.pipeline.render();
    EDITOR_SCENE_DATA.renderer!.domElement.toBlob((blob) =>
      saveAs(
        blob as Blob,
        `${EDITOR_STATE.value.planetData.planetName.replaceAll(' ', '_')}-${new Date().toISOString()}.png`,
      ),
    );
  } catch (err) {
    console.error('<Lagrange> Could not export screenshot!', err);
    UIEventBus.sendToastEvent('warn', 'toast.screenshot_failure', 3000);
  }
}

export function dollyCamera(direction: 'in' | 'out') {
  if (direction === 'in') {
    EDITOR_SCENE_DATA.orbitControls!.dollyOut(1.1);
  } else {
    EDITOR_SCENE_DATA.orbitControls!.dollyIn(1.1);
  }
}
export function setCameraFOV(fov: number) {
  EDITOR_SCENE_DATA.camera!.fov = clamp(fov, 30, 90);
  EDITOR_SCENE_DATA.camera!.updateProjectionMatrix();
}
export function setCameraControlScheme(scheme: CameraMouseControlsScheme) {
  EDITOR_SCENE_DATA.orbitControls!.mouseButtons = {
    LEFT: scheme === 'standard' ? MOUSE.ROTATE : MOUSE.DOLLY,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: scheme === 'standard' ? MOUSE.DOLLY : MOUSE.ROTATE,
  };
  EDITOR_SCENE_DATA.orbitControls!.update();
}

// ------------------------------------------------------------------------------------------------ //
//                                         EXPORT FUNCTIONS                                         //
// ------------------------------------------------------------------------------------------------ //

export async function exportPlanetPreview(): Promise<string> {
  EDITOR_STATE.value.status = EditorStatusCode.PreviewGeneration;
  await sleep(50);
  EDITOR_SCENE_DATA.lensFlare!.mesh.visible = false;
  const dataURL = await PreviewHelper.generatePlanetPreview(EDITOR_STATE.value.planetData);
  EDITOR_SCENE_DATA.lensFlare!.mesh.visible = EDITOR_STATE.value.planetData.lensFlareEnabled;
  EDITOR_STATE.value.status = EditorStatusCode.Edition;
  return dataURL;
}

export async function exportPlanetToGLTF(progressDialog: ExportProgressDialogExposes) {
  EDITOR_STATE.value.status = EditorStatusCode.Export;
  const settings = await idb.settings.limit(1).first();
  EDITOR_WORKERS.baking!.run(
    EDITOR_WORKERS.texture!,
    {
      type: 'baking',
      planetData: EDITOR_STATE.value.planetData,
      bakingPixelize: settings!.bakingPixelize ?? false,
      bakingResolution: settings!.bakingResolution ?? 2048,
      renderingBackend: settings!.renderingBackend,
    },
    (message) => processBakingWorkerMessage(message, progressDialog, settings!.bakingResolution ?? 2048),
  );
}

async function processBakingWorkerMessage(
  event: MessageEvent<BakingWorkerOutput>,
  progressDialog: ExportProgressDialogExposes,
  bakingResolution: number,
) {
  switch (event.data.type) {
    case 'progress':
      progressDialog.setProgress(event.data.progress);
      /*if (event.data.texture) {
        saveAs(event.data.texture!, 'tex.png');
      }*/
      break;
    case 'error':
      progressDialog.setError(event.data.error);
      EDITOR_STATE.value.status = EditorStatusCode.Edition;
      break;
    case 'done':
      progressDialog.setDone();
      await exportBakedTexturesAsMesh(event.data.data, bakingResolution);
      EDITOR_STATE.value.status = EditorStatusCode.Edition;
      break;
  }
}

async function exportBakedTexturesAsMesh(data: BakingWorkerOutputData, bakingResolution: number) {
  const textures = {
    planetMap: toDataTexture(data.planetMap!, bakingResolution, bakingResolution),
    planetMetallicRoughnessMap: toDataTexture(data.planetMetallicRoughnessMap!, bakingResolution, bakingResolution),
    planetEmissiveMap: toDataTexture(data.planetEmissiveMap!, bakingResolution, bakingResolution),
    planetNormalMap: toDataTexture(data.planetNormalMap!, bakingResolution, bakingResolution),
    clouds: data.clouds ? toDataTexture(data.clouds!, bakingResolution, bakingResolution) : undefined,
    rings: data.rings ? data.rings.map((r) => toDataTexture(r, bakingResolution, bakingResolution)) : undefined,
  };

  const planetData = EDITOR_STATE.value.planetData;
  const geometry = ComponentHelper.createSphereGeometryComponent(planetData.planetMeshQuality);
  geometry.computeTangents();

  // Build main planet mesh
  const planetMesh = new Mesh(geometry);
  planetMesh.material = new MeshStandardNodeMaterial({
    map: textures.planetMap,
    roughnessMap: textures.planetMetallicRoughnessMap,
    metalnessMap: textures.planetMetallicRoughnessMap,
    emissiveMap: textures.planetEmissiveMap,
    normalMap: textures.planetNormalMap,
    normalScale: new Vector2(planetData.planetSurfaceBumpStrength).multiplyScalar(2),
  });
  planetMesh.name = planetData.planetName;
  planetMesh.scale.setScalar(planetData.planetRadius);
  planetMesh.setRotationFromAxisAngle(AXIS_X, degToRad(planetData.planetAxialTilt));
  planetMesh.rotateOnAxis(planetMesh.up, degToRad(planetData.planetRotation));

  // Build clouds if enabled
  if (planetData.cloudsEnabled) {
    const cloudsGeometry = ComponentHelper.createSphereGeometryComponent(
      planetData.planetMeshQuality,
      planetData.cloudsHeight,
    );
    const cloudsMesh = new Mesh(cloudsGeometry);
    cloudsMesh.material = new MeshStandardNodeMaterial({
      map: textures.clouds,
      opacity: 1,
      transparent: true,
    });
    cloudsMesh.name = 'Clouds';
    planetMesh.add(cloudsMesh);
    cloudsMesh.setRotationFromAxisAngle(cloudsMesh.up, degToRad(planetData.cloudsRotation));
  }

  // Build rings if enabled
  if (planetData.ringsEnabled) {
    const ringGroup = new Group();
    ringGroup.name = 'RingSystem';
    for (let idx = 0; idx < textures.rings!.length; idx++) {
      const ringParams = planetData.ringsParams[idx];
      const geometry = ComponentHelper.createRingGeometryComponent(
        planetData.planetMeshQuality,
        ringParams.innerRadius,
        ringParams.outerRadius,
      );
      const ringMesh = new Mesh(geometry);
      ringMesh.material = new MeshStandardNodeMaterial({
        map: textures.rings![idx],
        side: DoubleSide,
        transparent: true,
      });
      ringMesh.name = `Ring_${String.fromCharCode(idx + 65)}`;
      ringGroup.add(ringMesh);
      ringMesh.setRotationFromAxisAngle(AXIS_X, degToRad(90));
    }
    planetMesh.add(ringGroup);
  }

  // Export to GLTF
  const blobUrl = await exportMeshesToGLTF(gltfExporter, [planetMesh]);
  saveAs(blobUrl, `${planetData.planetName.replaceAll(' ', '_')}_${bakingResolution}.gltf`);

  // Dispose of all resources
  textures.planetMap.dispose();
  textures.planetMetallicRoughnessMap.dispose();
  textures.planetEmissiveMap.dispose();
  textures.planetNormalMap.dispose();
  textures.clouds?.dispose();
  textures.rings?.forEach((t) => t.dispose());
  planetMesh.geometry.dispose();
  planetMesh.material.dispose();
  planetMesh.children.forEach((child) => {
    const mesh = child as Mesh;
    mesh.geometry.dispose();
    (<NodeMaterial>mesh.material).dispose();
  });
}
