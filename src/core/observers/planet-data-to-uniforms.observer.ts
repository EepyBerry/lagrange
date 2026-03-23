import type PlanetData from "../models/planet-data.model";
import { Observer, ObservableEventAction, ObservableEvent, type ObservableEventType } from "../utils/observable-utils";
import * as Globals from "@core/globals";
import * as ComponentHelper from "@/core/helpers/component.helper";
import * as TextureHelper from "@/core/helpers/texture.helper";
import { degToRad } from "three/src/math/MathUtils.js";
import type { PlanetMeshData, EditorSceneData, AtmosphereMeshData, CloudsMeshData, RingMeshData } from "../types";
import type { AmbientLight, DirectionalLight, Group } from "three";
import type { LensFlareEffect } from "../effects/lens-flare.effect";
import type { BiomeParameters } from "../models/biome-parameters.model";
import { RingParameters } from "../models/ring-parameters.model";
import type { ColorRamp } from "../models/color-ramp.model";
import type { NodeMaterial } from "three/webgpu";
import { EDITOR_STATE } from "../state/editor.state";

type ObservableEventOperation = (event: ObservableEvent) => void;
type ObservableEventHandler = { type?: ObservableEventType; handle: ObservableEventOperation };
type ObservableEventHandlerCtor = (operation: ObservableEventOperation) => ObservableEventHandler;

const universalHandler: ObservableEventHandlerCtor = (operation: ObservableEventOperation) => ({
  handle: operation,
});
const globalHandler: ObservableEventHandlerCtor = (operation: ObservableEventOperation) => ({
  type: "global",
  handle: operation,
});
const keyedHandler: ObservableEventHandlerCtor = (operation: ObservableEventOperation) => ({
  type: "keyed",
  handle: operation,
});

export class PlanetDataToUniformsObserver extends Observer {
  private readonly eventHandlerMap: Map<string, ObservableEventHandler> = new Map<string, ObservableEventHandler>();

  public hookEditorSceneData(sceneData: EditorSceneData) {
    const planetData = EDITOR_STATE.value.planetData;
    this.registerLightingDataUpdates(planetData, sceneData.sunLight!, sceneData.ambLight!, sceneData.lensFlare!);
    this.registerPlanetRenderingDataUpdates(
      planetData,
      sceneData.planetGroup!,
      sceneData.planet!,
      sceneData.atmosphere!,
      sceneData.clouds!,
    );
    this.registerSurfaceDataUpdates(planetData, sceneData.planet!);
    this.registerBiomeDataUpdates(planetData, sceneData.planet!);
    this.registerAtmosphereDataUpdates(planetData, sceneData.atmosphere!);
    this.registerCloudDataUpdates(planetData, sceneData.clouds!);
    this.registerRingsDataUpdates(planetData, sceneData.ringAnchor, sceneData.rings!);
  }

  public unhookEditorSceneData() {
    this.eventHandlerMap.clear();
  }

  // ----------------------------------------------------------------------------

  private registerEvent(key: string, handler: ObservableEventHandler) {
    this.eventHandlerMap.set(key, handler);
  }

  public onEvent(event: ObservableEvent): void {
    EDITOR_STATE.value.planetEditedFlag = true;
    if (event.type === "global") {
      this.eventHandlerMap.forEach((handler) => {
        if (handler.type === "keyed") return;
        handler.handle(event);
      });
    } else {
      this.eventHandlerMap.get(event.key!)?.handle(event);
    }
  }

  // ----------------------------------------------------------------------------

  // prettier-ignore
  private registerLightingDataUpdates(data: PlanetData, sunLight: DirectionalLight, ambLight: AmbientLight, lensFlare: LensFlareEffect): void {
    this.registerEvent('_lensFlareEnabled',         universalHandler(() => lensFlare.mesh.visible = data.lensFlareEnabled));
    this.registerEvent('_lensFlareEnabled',         universalHandler(() => lensFlare.mesh.visible = data.lensFlareEnabled));
    this.registerEvent('_lensFlarePointsIntensity', universalHandler(() => lensFlare.uniforms.starPointsIntensity.value = data.lensFlarePointsIntensity));
    this.registerEvent('_lensFlareGlareIntensity',  universalHandler(() => lensFlare.uniforms.glareIntensity.value = data.lensFlareGlareIntensity));
    this.registerEvent('_sunLightAngle',            universalHandler(() => {
      const v = degToRad(isNaN(data.sunLightAngle) ? 0 : data.sunLightAngle);
      const newPos = Globals.SUN_INIT_POS.clone().applyAxisAngle(Globals.AXIS_X, v);
      sunLight.position.set(newPos.x, newPos.y, newPos.z);
    }));
    this.registerEvent('_sunLightColor', universalHandler(() => {
      sunLight.color.set(data.sunLightColor);
      lensFlare.uniforms.colorGain.value = data.sunLightColor;
    }));
    this.registerEvent('_sunLightIntensity', universalHandler(() => sunLight.intensity = data.sunLightIntensity));
    this.registerEvent('_ambLightColor',     universalHandler(() => ambLight.color.set(data.ambLightColor)));
    this.registerEvent('_ambLightIntensity', universalHandler(() => ambLight.intensity = data.ambLightIntensity));
  }

  // prettier-ignore
  private registerPlanetRenderingDataUpdates(
    data: PlanetData,
    planetGroup: Group,
    planet: PlanetMeshData,
    atmosphere: AtmosphereMeshData,
    clouds: CloudsMeshData,
  ): void {
    this.registerEvent('_planetRadius', universalHandler(() => {
      const v = data.planetRadius;
      planetGroup.scale.setScalar(v);
      planet.uniforms!.radius.value = v;
      atmosphere.uniforms!.transform.surfaceRadius.value = v;
      atmosphere.uniforms!.transform.radius.value = data.planetRadius + data.atmosphereHeight;
    }));
    this.registerEvent('_planetAxialTilt', universalHandler(() => {
      const v = degToRad(isNaN(data.planetAxialTilt) ? 0 : data.planetAxialTilt);
      planetGroup.setRotationFromAxisAngle(Globals.AXIS_X, v);
    }));
    this.registerEvent('_planetRotation', universalHandler(() => {
      const vRad = degToRad(isNaN(data.planetRotation) ? 0 : data.planetRotation);
      const cloudsRotationRad = degToRad(isNaN(data.cloudsRotation) ? 0 : data.cloudsRotation);
      planet.mesh!.setRotationFromAxisAngle(planet.mesh!.up, vRad);
      clouds.mesh!.setRotationFromAxisAngle(clouds.mesh!.up, vRad + cloudsRotationRad);
    }));
    this.registerEvent('_planetWaterLevel',              universalHandler(() => (planet.uniforms!.pbr.waterLevel.value = data.planetWaterLevel)));
    this.registerEvent('_planetWaterRoughness',          universalHandler(() => (planet.uniforms!.pbr.metallicRoughness.value.x = data.planetWaterRoughness)));
    this.registerEvent('_planetWaterMetalness',          universalHandler(() => (planet.uniforms!.pbr.metallicRoughness.value.y = data.planetWaterMetalness)));
    this.registerEvent('_planetGroundRoughness',         universalHandler(() => (planet.uniforms!.pbr.metallicRoughness.value.z = data.planetGroundRoughness)));
    this.registerEvent('_planetGroundMetalness',         universalHandler(() => (planet.uniforms!.pbr.metallicRoughness.value.w = data.planetGroundMetalness)));
    this.registerEvent('_planetShowEmissive',            universalHandler(() => (planet.uniforms!.flags.array[4] = +data.planetShowEmissive)));
    this.registerEvent('_planetWaterEmissiveIntensity',  universalHandler(() => (planet.uniforms!.pbr.emissive.value.x = data.planetWaterEmissiveIntensity)));
    this.registerEvent('_planetGroundEmissiveIntensity', universalHandler(() => {
      planet.uniforms!.pbr.emissive.value.y = data.planetGroundEmissiveIntensity;
      planet.biomeEmissiveLayersTexture!.updateAllLayers(data.biomesParams);
    }));
  }

  // prettier-ignore
  private registerSurfaceDataUpdates(data: PlanetData, planet: PlanetMeshData): void {
    this.registerEvent('_planetSurfaceShowBumps',    universalHandler(() => (planet.uniforms!.flags.array[2] = +data.planetSurfaceShowBumps)));
    this.registerEvent('_planetSurfaceBumpStrength', universalHandler(() => (planet.uniforms!.bumpStrength.value = data.planetSurfaceBumpStrength)));
    // Color
    this.registerEvent('_planetSurfaceColorRamp', universalHandler(() => {
      const v = data.planetSurfaceColorRamp
      TextureHelper.recalculateRampTexture(planet.surfaceBuffer, Globals.TEXTURE_SIZES.SURFACE, v.steps)
      planet.surfaceTexture!.needsUpdate = true
    }));

    // Warping
    this.registerEvent('_planetSurfaceShowWarping', universalHandler(() => (planet.uniforms!.flags.array[0] = +data.planetSurfaceShowWarping)));
    this.registerEvent('_planetSurfaceNoise._warpFactor', universalHandler(() => {
      planet.uniforms!.surface.warping.value.y = data.planetSurfaceNoise.xWarpFactor
      planet.uniforms!.surface.warping.value.z = data.planetSurfaceNoise.yWarpFactor
      planet.uniforms!.surface.warping.value.w = data.planetSurfaceNoise.zWarpFactor
    }));

    // Displacement
    this.registerEvent('_planetSurfaceShowDisplacement',         universalHandler(() => (planet.uniforms!.flags.array[1] = +data.planetSurfaceShowDisplacement)));
    this.registerEvent('_planetSurfaceDisplacement._factor',     universalHandler(() => (planet.uniforms!.surface.displacement.params.value.x = data.planetSurfaceDisplacement.factor)));
    this.registerEvent('_planetSurfaceDisplacement._epsilon',    universalHandler(() => (planet.uniforms!.surface.displacement.params.value.y = data.planetSurfaceDisplacement.epsilon)));
    this.registerEvent('_planetSurfaceDisplacement._multiplier', universalHandler(() => (planet.uniforms!.surface.displacement.params.value.z = data.planetSurfaceDisplacement.multiplier)));
    this.registerEvent('_planetSurfaceDisplacement._frequency',  universalHandler(() => (planet.uniforms!.surface.displacement.noise.value.x = data.planetSurfaceDisplacement.frequency)));
    this.registerEvent('_planetSurfaceDisplacement._amplitude',  universalHandler(() => (planet.uniforms!.surface.displacement.noise.value.y = data.planetSurfaceDisplacement.amplitude)));
    this.registerEvent('_planetSurfaceDisplacement._lacunarity', universalHandler(() => (planet.uniforms!.surface.displacement.noise.value.z = data.planetSurfaceDisplacement.lacunarity)));
    this.registerEvent('_planetSurfaceDisplacement._octaves',    universalHandler(() => (planet.uniforms!.surface.displacement.noise.value.w = data.planetSurfaceDisplacement.octaves)));

    // Noise
    this.registerEvent('_planetSurfaceNoise._layers',     universalHandler(() => (planet.uniforms!.surface.warping.value.x = data.planetSurfaceNoise.layers)));
    this.registerEvent('_planetSurfaceNoise._frequency',  universalHandler(() => (planet.uniforms!.surface.noise.value.x = data.planetSurfaceNoise.frequency)));
    this.registerEvent('_planetSurfaceNoise._amplitude',  universalHandler(() => (planet.uniforms!.surface.noise.value.y = data.planetSurfaceNoise.amplitude)));
    this.registerEvent('_planetSurfaceNoise._lacunarity', universalHandler(() => (planet.uniforms!.surface.noise.value.z = data.planetSurfaceNoise.lacunarity)));
    this.registerEvent('_planetSurfaceNoise._octaves',    universalHandler(() => (planet.uniforms!.surface.noise.value.w = data.planetSurfaceNoise.octaves)));
  }

  // prettier-ignore
  private registerBiomeDataUpdates(data: PlanetData, planet: PlanetMeshData): void {
    this.registerEvent('_biomesEnabled',                      universalHandler(() => (planet.uniforms!.flags.array[3] = +data.biomesEnabled)));
    // Temperature
    this.registerEvent('_biomesTemperatureMode',              universalHandler(() => (planet.uniforms!.biomes.temperatureMode.value = data.biomesTemperatureMode)));
    this.registerEvent('_biomesTemperatureNoise._frequency',  universalHandler(() => (planet.uniforms!.biomes.temperatureNoise.value.x = data.biomesTemperatureNoise.frequency)));
    this.registerEvent('_biomesTemperatureNoise._amplitude',  universalHandler(() => (planet.uniforms!.biomes.temperatureNoise.value.y = data.biomesTemperatureNoise.amplitude)));
    this.registerEvent('_biomesTemperatureNoise._lacunarity', universalHandler(() => (planet.uniforms!.biomes.temperatureNoise.value.z = data.biomesTemperatureNoise.lacunarity)));
    this.registerEvent('_biomesTemperatureNoise._octaves',    universalHandler(() => (planet.uniforms!.biomes.temperatureNoise.value.w = data.biomesTemperatureNoise.octaves)));
    // Humidity
    this.registerEvent('_biomesHumidityMode',                 universalHandler(() => (planet.uniforms!.biomes.humidityMode.value = data.biomesHumidityMode)));
    this.registerEvent('_biomesHumidityNoise._frequency',     universalHandler(() => (planet.uniforms!.biomes.humidityNoise.value.x = data.biomesHumidityNoise.frequency)));
    this.registerEvent('_biomesHumidityNoise._amplitude',     universalHandler(() => (planet.uniforms!.biomes.humidityNoise.value.y = data.biomesHumidityNoise.amplitude)));
    this.registerEvent('_biomesHumidityNoise._lacunarity',    universalHandler(() => (planet.uniforms!.biomes.humidityNoise.value.z = data.biomesHumidityNoise.lacunarity)));
    this.registerEvent('_biomesHumidityNoise._octaves',       universalHandler(() => (planet.uniforms!.biomes.humidityNoise.value.w = data.biomesHumidityNoise.octaves)));
    this.registerEvent('_biomesParams', globalHandler(() => {
      planet.biomeLayersTexture!.reset(data.biomesParams);
      planet.biomeEmissiveLayersTexture!.reset(data.biomesParams);
    }));
    this.registerEvent('_biomesParams[element]', keyedHandler((event) => {
      const biome = event.data!.biome as BiomeParameters;
      const biomeParamsIdx = data.findBiomeIndexById(biome.id);
      if (biomeParamsIdx === -1) return;
      switch (event.action) {
        case ObservableEventAction.ADD:
          planet.biomeLayersTexture!.addLayer(biome!);
          planet.biomeEmissiveLayersTexture!.addLayer(biome!);
          break;
        case ObservableEventAction.EDIT:
          planet.biomeLayersTexture!.updateLayer(biomeParamsIdx, biome!);
          planet.biomeEmissiveLayersTexture!.updateLayer(biomeParamsIdx, biome!);
          break;
        case ObservableEventAction.DELETE:
          planet.biomeLayersTexture!.removeLayer(biomeParamsIdx);
          planet.biomeEmissiveLayersTexture!.removeLayer(biomeParamsIdx);
          break;
        case ObservableEventAction.SORT_UP:
          // biome already moved up, take the index from the previous position (i+1)
          planet.biomeLayersTexture!.moveLayer(biomeParamsIdx + 1, -1);
          planet.biomeEmissiveLayersTexture!.moveLayer(biomeParamsIdx + 1, -1);
          break;
        case ObservableEventAction.SORT_DOWN:
          // biome already moved down, take the index from the previous position (i-1)
          planet.biomeLayersTexture!.moveLayer(biomeParamsIdx - 1, 1);
          planet.biomeEmissiveLayersTexture!.moveLayer(biomeParamsIdx - 1, 1);
          break;
      }
    }));
  }

  // prettier-ignore
  private registerCloudDataUpdates(data: PlanetData, clouds: CloudsMeshData): void {
    this.registerEvent('_cloudsEnabled',  universalHandler(() => (clouds.mesh!.visible = data.cloudsEnabled)));
    this.registerEvent('_cloudsRotation', universalHandler(() => {
      const planetRotation = degToRad(isNaN(data.planetRotation) ? 0 : data.planetRotation);
      const v = degToRad(isNaN(data.cloudsRotation) ? 0 : data.cloudsRotation);
      clouds.mesh!.setRotationFromAxisAngle(clouds.mesh!.up, planetRotation + v);
    }));
    // Warping
    this.registerEvent('_cloudsShowWarping',       universalHandler(() => (clouds.uniforms!.flags.array[0] = +data.cloudsShowWarping)));
    this.registerEvent('_cloudsNoise._warpFactor', universalHandler(() => {
      clouds.uniforms!.warping.value.y = data.cloudsNoise.xWarpFactor;
      clouds.uniforms!.warping.value.z = data.cloudsNoise.yWarpFactor;
      clouds.uniforms!.warping.value.w = data.cloudsNoise.zWarpFactor;
    }));
    // Displacement
    this.registerEvent('_cloudsShowDisplacement',         universalHandler(() => (clouds.uniforms!.flags.array[1] = +data.cloudsShowDisplacement)));
    this.registerEvent('_cloudsDisplacement._factor',     universalHandler(() => (clouds.uniforms!.displacement.params.value.x = data.cloudsDisplacement.factor)));
    this.registerEvent('_cloudsDisplacement._epsilon',    universalHandler(() => (clouds.uniforms!.displacement.params.value.y = data.cloudsDisplacement.epsilon)));
    this.registerEvent('_cloudsDisplacement._multiplier', universalHandler(() => (clouds.uniforms!.displacement.params.value.z = data.cloudsDisplacement.multiplier)));
    this.registerEvent('_cloudsDisplacement._frequency',  universalHandler(() => (clouds.uniforms!.displacement.noise.value.x = data.cloudsDisplacement.frequency)));
    this.registerEvent('_cloudsDisplacement._amplitude',  universalHandler(() => (clouds.uniforms!.displacement.noise.value.y = data.cloudsDisplacement.amplitude)));
    this.registerEvent('_cloudsDisplacement._lacunarity', universalHandler(() => (clouds.uniforms!.displacement.noise.value.z = data.cloudsDisplacement.lacunarity)));
    this.registerEvent('_cloudsDisplacement._octaves',    universalHandler(() => (clouds.uniforms!.displacement.noise.value.w = data.cloudsDisplacement.octaves)));
    // Noise
    this.registerEvent('_cloudsNoise._frequency',  universalHandler(() => (clouds.uniforms!.noise.value.x = data.cloudsNoise.frequency)));
    this.registerEvent('_cloudsNoise._amplitude',  universalHandler(() => (clouds.uniforms!.noise.value.y = data.cloudsNoise.amplitude)));
    this.registerEvent('_cloudsNoise._lacunarity', universalHandler(() => (clouds.uniforms!.noise.value.z = data.cloudsNoise.lacunarity)));
    this.registerEvent('_cloudsNoise._octaves',    universalHandler(() => (clouds.uniforms!.noise.value.w = data.cloudsNoise.octaves)));
    // Color
    this.registerEvent('_cloudsColor',             universalHandler(() =>  (clouds.uniforms!.color.value = data.cloudsColor)));
    this.registerEvent('_cloudsColorRamp',         universalHandler(() =>  {
      const v = data.cloudsColorRamp;
      TextureHelper.recalculateRampTexture(clouds.buffer!, Globals.TEXTURE_SIZES.CLOUDS, v.steps);
      clouds.texture!.needsUpdate = true;
    }));
  }

  // prettier-ignore
  private registerAtmosphereDataUpdates(data: PlanetData, atmosphere: AtmosphereMeshData): void {
    this.registerEvent('_atmosphereEnabled', universalHandler(() => (atmosphere.mesh!.visible = data.atmosphereEnabled)));
    this.registerEvent('_atmosphereHeight',  universalHandler(() => {
      atmosphere.mesh!.geometry.dispose();
      atmosphere.mesh!.geometry = ComponentHelper.createSphereGeometryComponent(data.planetMeshQuality, 1.0 + data.atmosphereHeight);
      atmosphere.uniforms!.transform.radius.value = data.planetRadius + data.atmosphereHeight;
    }));
    this.registerEvent('_atmosphereDensityScale',          universalHandler(() =>  (atmosphere.uniforms!.render.density.value = data.atmosphereDensityScale)));
    this.registerEvent('_atmosphereIntensity',             universalHandler(() =>  (atmosphere.uniforms!.render.intensity.value = data.atmosphereIntensity)));
    this.registerEvent('_atmosphereColorMode',             universalHandler(() =>  (atmosphere.uniforms!.render.colorMode.value = data.atmosphereColorMode)));
    this.registerEvent('_atmosphereHue',                   universalHandler(() =>  (atmosphere.uniforms!.render.hue.value = data.atmosphereHue)));
    this.registerEvent('_atmosphereTint',                  universalHandler(() =>  (atmosphere.uniforms!.render.tint.value = data.atmosphereTint)));
    this.registerEvent('_atmosphereMieScatteringConstant', universalHandler(() =>  (atmosphere.uniforms!.render.advanced.mieScatteringConstant.value = data.atmosphereMieScatteringConstant)));
    this.registerEvent('_atmosphereRayleighDensityRatio',  universalHandler(() =>  (atmosphere.uniforms!.render.advanced.rayleighDensityRatio.value = data.atmosphereRayleighDensityRatio)));
    this.registerEvent('_atmosphereMieDensityRatio',       universalHandler(() =>  (atmosphere.uniforms!.render.advanced.mieDensityRatio.value = data.atmosphereMieDensityRatio)));
    this.registerEvent('_atmosphereOpticalDensityRatio',   universalHandler(() =>  (atmosphere.uniforms!.render.advanced.opticalDensityRatio.value = data.atmosphereOpticalDensityRatio)));
  }

  // prettier-ignore
  private registerRingsDataUpdates(data: PlanetData, ringAnchor: Group, ringsMeshData: RingMeshData[]): void {
    this.registerEvent('_ringsEnabled', universalHandler(() => {
      ringAnchor.visible = data.ringsEnabled
      ringAnchor.children.forEach(r => r.visible = data.ringsEnabled)
    }));
    this.registerEvent('_ringsParams', globalHandler(() => {
      ComponentHelper.disposeAllRings(ringAnchor, ringsMeshData);
      data.ringsParams.forEach(r => {
        const newRing = ComponentHelper.createRing(data, r)
        ringsMeshData.push(newRing)
        ringAnchor!.add(newRing.mesh!)
      })
    }));
    this.registerEvent('_ringsParams[element]', keyedHandler((event) => {
      const sourceRingParams = event.data!.ring as RingParameters;
      switch (event.action) {
        case ObservableEventAction.ADD: {
          const newMeshData = ComponentHelper.createRing(data, sourceRingParams);
          ringsMeshData.push(newMeshData);
          ringAnchor.add(newMeshData.mesh!);
          break;
        }
        case ObservableEventAction.EDIT: {
          ringsMeshData.forEach(rmd => {
            ;(rmd.mesh!.material as NodeMaterial).dispose()
            rmd.mesh!.geometry.dispose()
            rmd.texture!.dispose()
            rmd.buffer = null
          })
          ringAnchor.clear()
          ringsMeshData.splice(0)
          data.ringsParams.forEach(params => {
            const newRing = ComponentHelper.createRing(data, params)
            ringsMeshData.push(newRing)
            ringAnchor!.add(newRing.mesh!)
          })
          break;
        }
        case ObservableEventAction.DELETE: {
          ComponentHelper.disposeRing(ringAnchor, ringsMeshData, sourceRingParams);
          break;
        }
      }
    }));
    this.registerEvent(`_ringsParams[element]._innerRadius`, keyedHandler((event) => {
      const ringParams = event.data!.ring as RingParameters
      const rmd = ringsMeshData.find(r => r.mesh!.name === ringParams.id)
      if (!rmd) return;
      rmd.mesh!.geometry.dispose()
      rmd.mesh!.geometry = ComponentHelper.createRingGeometryComponent(data.planetMeshQuality, ringParams.innerRadius, ringParams.outerRadius)
      rmd.uniforms!.innerRadius.value = ringParams.innerRadius
    }));
    this.registerEvent(`_ringsParams[element]._outerRadius`, keyedHandler((event) => {
      const ringParams = event.data!.ring as RingParameters
      const rmd = ringsMeshData.find(r => r.mesh!.name === ringParams.id)
      if (!rmd) return;
      rmd.mesh!.geometry.dispose()
      rmd.mesh!.geometry = ComponentHelper.createRingGeometryComponent(data.planetMeshQuality, ringParams.innerRadius, ringParams.outerRadius)
      rmd.uniforms!.outerRadius.value = ringParams.outerRadius
    }));
    this.registerEvent(`_ringsParams[element]._colorRamp`, keyedHandler((event) => {
      const colorRamp = event.data!.ramp as ColorRamp
      const ringParams = data.ringsParams.find(rp => rp.colorRamp.hash === colorRamp.hash)
      const rmd = ringsMeshData.find(r => r.mesh!.name === ringParams?.id)
      if (!ringParams || !rmd) return;
      TextureHelper.recalculateRampTexture(rmd.buffer!, Globals.TEXTURE_SIZES.RING, ringParams.colorRamp.steps)
      rmd.texture!.needsUpdate = true
    }));
  }
}
