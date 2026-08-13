import type { NodeMaterial } from "three/webgpu";
import type PlanetData from "@core/models/planet/planet-data.model.ts";
import { type EditorSceneData, EditorSceneCreationMode, type MeshData } from "../types";
import * as ComponentHelper from "./component.helper";
import * as Globals from "@core/globals";
import { Timer } from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import type { RingTSLMaterial } from "@tsl/materials/ring.tslmat.ts";

export async function buildEditorScene(
  data: PlanetData,
  sceneData: Partial<EditorSceneData>,
  renderWidth: number,
  renderHeight: number,
  renderPixelRatio: number,
  creationMode: EditorSceneCreationMode,
): Promise<void> {
  await buildScene(
    sceneData as EditorSceneData,
    data,
    renderWidth,
    renderHeight,
    renderPixelRatio,
    creationMode,
  );
  buildSceneLighting(sceneData as EditorSceneData, data);
  buildScenePlanet(sceneData as EditorSceneData, data, creationMode);
}

export function disposeScene(sceneData: EditorSceneData) {
  sceneData.sunLight.dispose();
  sceneData.ambLight.dispose();
  sceneData.scene.remove(sceneData.sunLight);
  sceneData.scene.remove(sceneData.ambLight);
  (sceneData.lensFlare!.mesh.material as NodeMaterial).dispose();
  sceneData.lensFlare!.mesh.geometry.dispose();
  (sceneData.planet.mesh!.material as NodeMaterial).dispose();
  sceneData.planet.mesh!.geometry.dispose();
  (sceneData.atmosphere.mesh!.material as NodeMaterial).dispose();
  sceneData.atmosphere.mesh!.geometry.dispose();
  (sceneData.clouds.mesh!.material as NodeMaterial).dispose();
  sceneData.clouds.mesh!.geometry.dispose();
  sceneData.rings.forEach((r) => {
    (r.mesh!.material as NodeMaterial).dispose();
    r.mesh!.geometry.dispose();
  });

  sceneData.planet.tslMaterial!.dispose();
  sceneData.clouds.tslMaterial!.dispose();
  sceneData.atmosphere.tslMaterial!.dispose();
  sceneData.lensFlare!.tslMaterial.dataEventEndpoint.dispose();
  sceneData.rings.forEach((r) => r.tslMaterial!.dispose());
  sceneData.rings.splice(0);
  sceneData.ringAnchor.clear();
  sceneData.planetGroup.clear();

  sceneData.scene.children.forEach((c) => sceneData.scene.remove(c));
  sceneData.renderer.dispose();
  sceneData.timer!.disconnect();
}

// ------------------------------------------------------------------------------------------------

async function buildScene(
  sceneData: EditorSceneData,
  data: PlanetData,
  renderWidth: number,
  renderHeight: number,
  renderPixelRatio: number,
  creationMode: EditorSceneCreationMode,
): Promise<void> {
  const { scene, renderer, camera } = await ComponentHelper.createScene(
    data,
    renderWidth,
    renderHeight,
    renderPixelRatio,
    creationMode,
  );
  sceneData.scene = scene;
  sceneData.renderer = renderer;
  sceneData.camera = camera;
  sceneData.timer = new Timer();
  sceneData.timer.connect(document);
}

function buildSceneLighting(sceneData: EditorSceneData, data: PlanetData): void {
  const sun = ComponentHelper.createSun(data);
  sceneData.scene.add(sun);
  sceneData.sunLight = sun;

  const ambientLight = ComponentHelper.createAmbientLight(
    data.ambLightColor,
    data.ambLightIntensity,
  );
  ambientLight.name = Globals.MESH_NAME_AMBLIGHT;
  sceneData.scene.add(ambientLight);
  sceneData.ambLight = ambientLight;

  const lensFlare = ComponentHelper.createLensFlare(data, sun.position, sun.color);
  sun.add(lensFlare.mesh);
  sceneData.lensFlare = lensFlare;
  lensFlare.mesh.visible = data.lensFlareEnabled;

  // Set initial rotations
  const dataSunlightAngle = degToRad(Number.isNaN(data.sunLightAngle) ? -15 : data.sunLightAngle);
  const pos = Globals.SUN_INIT_POS.clone().applyAxisAngle(Globals.AXIS_X, dataSunlightAngle);
  sceneData.sunLight.position.set(pos.x, pos.y, pos.z);
  sceneData.lensFlare.updatePosition(sceneData.sunLight.position);
}

function buildScenePlanet(
  sceneData: EditorSceneData,
  data: PlanetData,
  creationMode: EditorSceneCreationMode,
): void {
  const planet = ComponentHelper.createPlanet(data);
  const clouds = ComponentHelper.createClouds(data);
  const atmosphere = ComponentHelper.createAtmosphere(data, sceneData.sunLight);
  const rings: MeshData<RingTSLMaterial>[] = [];
  if (creationMode === EditorSceneCreationMode.Editor) {
    rings.push(...data.ringsParams.map((param) => ComponentHelper.createRing(data, param)));
  }

  // Toggle elements
  clouds.mesh!.visible = data.cloudsEnabled;
  atmosphere.mesh!.visible = data.atmosphereEnabled;
  sceneData.ringAnchor.visible = data.ringsEnabled;
  rings.forEach((r) => (r.mesh!.visible = data.ringsEnabled));

  // Add to scene
  sceneData.planetGroup.add(planet.mesh!);
  sceneData.planetGroup.add(clouds.mesh!);
  sceneData.planetGroup.add(atmosphere.mesh!);

  sceneData.ringAnchor.name = Globals.MESH_NAME_RING_ANCHOR;
  rings.forEach((r) => {
    sceneData.rings.push(r);
    sceneData.ringAnchor.add(r.mesh!);
  });
  sceneData.planetGroup.add(sceneData.ringAnchor);

  sceneData.scene.add(sceneData.planetGroup);
  sceneData.planet = planet;
  sceneData.clouds = clouds;
  sceneData.atmosphere = atmosphere;
  sceneData.rings.push(...rings);

  // Set initial rotations
  sceneData.planetGroup.setRotationFromAxisAngle(Globals.AXIS_X, degToRad(data.planetAxialTilt));
  sceneData.planet.mesh!.setRotationFromAxisAngle(
    sceneData.planet.mesh!.up,
    degToRad(data.planetRotation),
  );
  sceneData.clouds.mesh!.setRotationFromAxisAngle(
    sceneData.clouds.mesh!.up,
    degToRad(data.planetRotation + data.cloudsRotation),
  );
  sceneData.ringAnchor.setRotationFromAxisAngle(Globals.AXIS_X, degToRad(90));

  // Set lighting target
  sceneData.sunLight.target = sceneData.planetGroup;

  // Set scale
  sceneData.planetGroup.scale.setScalar(data.planetRadius);
}
