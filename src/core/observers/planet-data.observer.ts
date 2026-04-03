import type { BiomeParameters } from '@core/models/planet/biome-parameters.model.ts';
import type { ColorRamp } from '@core/models/planet/color-ramp.model.ts';
import type PlanetData from '@core/models/planet/planet-data.model.ts';
import type { AmbientLight, DirectionalLight, Group } from 'three';
import type { NodeMaterial } from 'three/webgpu';
import * as Globals from '@core/globals';
import { RingParameters } from '@core/models/planet/ring-parameters.model.ts';
import { degToRad } from 'three/src/math/MathUtils.js';
import * as ComponentHelper from '@/core/helpers/component.helper';
import * as TextureHelper from '@/core/helpers/texture.helper';
import type { LensFlareEffect } from '../effects/lens-flare.effect';
import type { PlanetMeshData, EditorSceneData, AtmosphereMeshData, CloudsMeshData, RingMeshData } from '../types';
import { EDITOR_STATE } from '../state/editor.state';
import {
  Observer,
  ObservableEventAction,
  ObservableEvent,
  type ObservableEventOperation,
  type ObservableEventHandlerCtor,
} from '../utils/observable-utils';

const genericHandler: ObservableEventHandlerCtor = (operation: ObservableEventOperation) => ({
  handle: operation,
});
const globalHandler: ObservableEventHandlerCtor = (operation: ObservableEventOperation) => ({
  type: 'global',
  handle: operation,
});
const keyedHandler: ObservableEventHandlerCtor = (operation: ObservableEventOperation) => ({
  type: 'keyed',
  handle: operation,
});

export class PlanetDataObserver extends Observer {
  public hookEditorSceneData(sceneData: EditorSceneData) {
    const planetData = EDITOR_STATE.value.planetData;
    this.registerLightingDataUpdates(
      planetData,
      sceneData.sunLight,
      sceneData.ambLight,
      sceneData.atmosphere,
      sceneData.lensFlare!,
    );
    this.registerPlanetRenderingDataUpdates(
      planetData,
      sceneData.planetGroup,
      sceneData.planet,
      sceneData.atmosphere,
      sceneData.clouds,
    );
    this.registerSurfaceDataUpdates(planetData, sceneData.planet);
    this.registerBiomeDataUpdates(planetData, sceneData.planet);
    this.registerAtmosphereDataUpdates(planetData, sceneData.atmosphere);
    this.registerCloudDataUpdates(planetData, sceneData.clouds);
    this.registerRingsDataUpdates(planetData, sceneData.ringAnchor, sceneData.rings);
  }

  // ----------------------------------------------------------------------------

  public override onEvent(event: ObservableEvent): void {
    EDITOR_STATE.value.planetEditedFlag = true;
    if (event.type === 'global') {
      this.eventHandlerMap.forEach((handler) => {
        if (handler.type === 'keyed') return;
        handler.handle(event);
      });
    } else {
      this.eventHandlerMap.get(event.key!)?.handle(event);
    }
  }

  // ----------------------------------------------------------------------------

  // prettier-ignore
  private registerLightingDataUpdates(data: PlanetData, sunLight: DirectionalLight, ambLight: AmbientLight, atmosphere: AtmosphereMeshData, lensFlare: LensFlareEffect): void {
    this.registerEventHandler('_lensFlareEnabled',         genericHandler(() => lensFlare.mesh.visible = data.lensFlareEnabled));
    this.registerEventHandler('_lensFlareEnabled',         genericHandler(() => lensFlare.mesh.visible = data.lensFlareEnabled));
    this.registerEventHandler('_lensFlarePointsIntensity', genericHandler(() => lensFlare.uniforms.starPointsIntensity.value = data.lensFlarePointsIntensity));
    this.registerEventHandler('_lensFlareGlareIntensity',  genericHandler(() => lensFlare.uniforms.glareIntensity.value = data.lensFlareGlareIntensity));
    this.registerEventHandler('_sunLightAngle',            genericHandler(() => {
      const v = degToRad(Number.isNaN(data.sunLightAngle) ? 0 : data.sunLightAngle);
      const newPos = Globals.SUN_INIT_POS.clone().applyAxisAngle(Globals.AXIS_X, v);
      sunLight.position.set(newPos.x, newPos.y, newPos.z);
      atmosphere.uniforms!.sunlight.position.value = sunLight.position;
    }));
    this.registerEventHandler('_sunLightColor', genericHandler(() => {
      sunLight.color.set(data.sunLightColor);
      lensFlare.uniforms.colorGain.value = data.sunLightColor;
    }));
    this.registerEventHandler('_sunLightIntensity', genericHandler(() => sunLight.intensity = data.sunLightIntensity));
    this.registerEventHandler('_ambLightColor',     genericHandler(() => ambLight.color.set(data.ambLightColor)));
    this.registerEventHandler('_ambLightIntensity', genericHandler(() => ambLight.intensity = data.ambLightIntensity));
  }

  // prettier-ignore
  private registerPlanetRenderingDataUpdates(
    data: PlanetData,
    planetGroup: Group,
    planet: PlanetMeshData,
    atmosphere: AtmosphereMeshData,
    clouds: CloudsMeshData,
  ): void {
    this.registerEventHandler('_planetRadius', genericHandler(() => {
      const v = data.planetRadius;
      planetGroup.scale.setScalar(v);
      planet.uniforms!.radius.value = v;
      atmosphere.uniforms!.transform.surfaceRadius.value = v;
      atmosphere.uniforms!.transform.radius.value = data.planetRadius + data.atmosphereHeight;
    }));
    this.registerEventHandler('_planetAxialTilt', genericHandler(() => {
      const v = degToRad(Number.isNaN(data.planetAxialTilt) ? 0 : data.planetAxialTilt);
      planetGroup.setRotationFromAxisAngle(Globals.AXIS_X, v);
    }));
    this.registerEventHandler('_planetRotation', genericHandler(() => {
      const vRad = degToRad(Number.isNaN(data.planetRotation) ? 0 : data.planetRotation);
      const cloudsRotationRad = degToRad(Number.isNaN(data.cloudsRotation) ? 0 : data.cloudsRotation);
      planet.mesh!.setRotationFromAxisAngle(planet.mesh!.up, vRad);
      clouds.mesh!.setRotationFromAxisAngle(clouds.mesh!.up, vRad + cloudsRotationRad);
    }));
    this.registerEventHandler('_planetWaterLevel',              genericHandler(() => (planet.uniforms!.pbr.waterLevel.value = data.planetWaterLevel)));
    this.registerEventHandler('_planetWaterRoughness',          genericHandler(() => (planet.uniforms!.pbr.metallicRoughness.value.x = data.planetWaterRoughness)));
    this.registerEventHandler('_planetWaterMetalness',          genericHandler(() => (planet.uniforms!.pbr.metallicRoughness.value.y = data.planetWaterMetalness)));
    this.registerEventHandler('_planetGroundRoughness',         genericHandler(() => (planet.uniforms!.pbr.metallicRoughness.value.z = data.planetGroundRoughness)));
    this.registerEventHandler('_planetGroundMetalness',         genericHandler(() => (planet.uniforms!.pbr.metallicRoughness.value.w = data.planetGroundMetalness)));
    this.registerEventHandler('_planetShowEmissive',            genericHandler(() => (planet.uniforms!.flags.array[4] = +data.planetShowEmissive)));
    this.registerEventHandler('_planetWaterEmissiveIntensity',  genericHandler(() => (planet.uniforms!.pbr.emissive.value.x = data.planetWaterEmissiveIntensity)));
    this.registerEventHandler('_planetGroundEmissiveIntensity', genericHandler(() => {
      planet.uniforms!.pbr.emissive.value.y = data.planetGroundEmissiveIntensity;
      planet.biomeEmissiveLayersTexture!.updateAllLayers(data.biomesParams);
    }));
  }

  // prettier-ignore
  private registerSurfaceDataUpdates(data: PlanetData, planet: PlanetMeshData): void {
    this.registerEventHandler('_planetSurfaceShowBumps',    genericHandler(() => (planet.uniforms!.flags.array[2] = +data.planetSurfaceShowBumps)));
    this.registerEventHandler('_planetSurfaceBumpStrength', genericHandler(() => (planet.uniforms!.bumpStrength.value = data.planetSurfaceBumpStrength)));
    // Color
    this.registerEventHandler('_planetSurfaceColorRamp', genericHandler(() => {
      const v = data.planetSurfaceColorRamp
      TextureHelper.recalculateRampTexture(planet.surfaceBuffer, Globals.TEXTURE_SIZES.SURFACE, v.steps)
      planet.surfaceTexture!.needsUpdate = true
    }));

    // Warping
    this.registerEventHandler('_planetSurfaceShowWarping', genericHandler(() => (planet.uniforms!.flags.array[0] = +data.planetSurfaceShowWarping)));
    this.registerEventHandler('_planetSurfaceNoise._warpFactor', genericHandler(() => {
      // noinspection JSSuspiciousNameCombination
      planet.uniforms!.surface.warping.value.y = data.planetSurfaceNoise.xWarpFactor
      planet.uniforms!.surface.warping.value.z = data.planetSurfaceNoise.yWarpFactor
      planet.uniforms!.surface.warping.value.w = data.planetSurfaceNoise.zWarpFactor
    }));

    // Displacement
    this.registerEventHandler('_planetSurfaceShowDisplacement',         genericHandler(() => (planet.uniforms!.flags.array[1] = +data.planetSurfaceShowDisplacement)));
    this.registerEventHandler('_planetSurfaceDisplacement._factor',     genericHandler(() => (planet.uniforms!.surface.displacement.params.value.x = data.planetSurfaceDisplacement.factor)));
    this.registerEventHandler('_planetSurfaceDisplacement._epsilon',    genericHandler(() => (planet.uniforms!.surface.displacement.params.value.y = data.planetSurfaceDisplacement.epsilon)));
    this.registerEventHandler('_planetSurfaceDisplacement._multiplier', genericHandler(() => (planet.uniforms!.surface.displacement.params.value.z = data.planetSurfaceDisplacement.multiplier)));
    this.registerEventHandler('_planetSurfaceDisplacement._frequency',  genericHandler(() => (planet.uniforms!.surface.displacement.noise.value.x = data.planetSurfaceDisplacement.frequency)));
    this.registerEventHandler('_planetSurfaceDisplacement._amplitude',  genericHandler(() => (planet.uniforms!.surface.displacement.noise.value.y = data.planetSurfaceDisplacement.amplitude)));
    this.registerEventHandler('_planetSurfaceDisplacement._lacunarity', genericHandler(() => (planet.uniforms!.surface.displacement.noise.value.z = data.planetSurfaceDisplacement.lacunarity)));
    this.registerEventHandler('_planetSurfaceDisplacement._octaves',    genericHandler(() => (planet.uniforms!.surface.displacement.noise.value.w = data.planetSurfaceDisplacement.octaves)));

    // Noise
    this.registerEventHandler('_planetSurfaceNoise._layers',     genericHandler(() => (planet.uniforms!.surface.warping.value.x = data.planetSurfaceNoise.layers)));
    this.registerEventHandler('_planetSurfaceNoise._frequency',  genericHandler(() => (planet.uniforms!.surface.noise.value.x = data.planetSurfaceNoise.frequency)));
    this.registerEventHandler('_planetSurfaceNoise._amplitude',  genericHandler(() => (planet.uniforms!.surface.noise.value.y = data.planetSurfaceNoise.amplitude)));
    this.registerEventHandler('_planetSurfaceNoise._lacunarity', genericHandler(() => (planet.uniforms!.surface.noise.value.z = data.planetSurfaceNoise.lacunarity)));
    this.registerEventHandler('_planetSurfaceNoise._octaves',    genericHandler(() => (planet.uniforms!.surface.noise.value.w = data.planetSurfaceNoise.octaves)));
  }

  // prettier-ignore
  private registerBiomeDataUpdates(data: PlanetData, planet: PlanetMeshData): void {
    this.registerEventHandler('_biomesEnabled',                      genericHandler(() => (planet.uniforms!.flags.array[3] = +data.biomesEnabled)));
    // Temperature
    this.registerEventHandler('_biomesTemperatureMode',              genericHandler(() => (planet.uniforms!.biomes.temperatureMode.value = data.biomesTemperatureMode)));
    this.registerEventHandler('_biomesTemperatureNoise._frequency',  genericHandler(() => (planet.uniforms!.biomes.temperatureNoise.value.x = data.biomesTemperatureNoise.frequency)));
    this.registerEventHandler('_biomesTemperatureNoise._amplitude',  genericHandler(() => (planet.uniforms!.biomes.temperatureNoise.value.y = data.biomesTemperatureNoise.amplitude)));
    this.registerEventHandler('_biomesTemperatureNoise._lacunarity', genericHandler(() => (planet.uniforms!.biomes.temperatureNoise.value.z = data.biomesTemperatureNoise.lacunarity)));
    this.registerEventHandler('_biomesTemperatureNoise._octaves',    genericHandler(() => (planet.uniforms!.biomes.temperatureNoise.value.w = data.biomesTemperatureNoise.octaves)));
    // Humidity
    this.registerEventHandler('_biomesHumidityMode',                 genericHandler(() => (planet.uniforms!.biomes.humidityMode.value = data.biomesHumidityMode)));
    this.registerEventHandler('_biomesHumidityNoise._frequency',     genericHandler(() => (planet.uniforms!.biomes.humidityNoise.value.x = data.biomesHumidityNoise.frequency)));
    this.registerEventHandler('_biomesHumidityNoise._amplitude',     genericHandler(() => (planet.uniforms!.biomes.humidityNoise.value.y = data.biomesHumidityNoise.amplitude)));
    this.registerEventHandler('_biomesHumidityNoise._lacunarity',    genericHandler(() => (planet.uniforms!.biomes.humidityNoise.value.z = data.biomesHumidityNoise.lacunarity)));
    this.registerEventHandler('_biomesHumidityNoise._octaves',       genericHandler(() => (planet.uniforms!.biomes.humidityNoise.value.w = data.biomesHumidityNoise.octaves)));
    this.registerEventHandler('_biomesParams', globalHandler(() => {
      planet.biomeLayersTexture!.reset(data.biomesParams);
      planet.biomeEmissiveLayersTexture!.reset(data.biomesParams);
    }));
    this.registerEventHandler('_biomesParams[element]', keyedHandler((event) => {
      const biome = event.data!.biome as BiomeParameters;
      const biomeParamsIdx = data.findBiomeIndexById(biome.id);
      if (biomeParamsIdx === -1) return;
      switch (event.action) {
        case ObservableEventAction.ADD:
          planet.biomeLayersTexture!.addLayer(biome);
          planet.biomeEmissiveLayersTexture!.addLayer(biome);
          break;
        case ObservableEventAction.EDIT:
          planet.biomeLayersTexture!.updateLayer(biomeParamsIdx, biome);
          planet.biomeEmissiveLayersTexture!.updateLayer(biomeParamsIdx, biome);
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
    this.registerEventHandler('_cloudsEnabled',  genericHandler(() => (clouds.mesh!.visible = data.cloudsEnabled)));
    this.registerEventHandler('_cloudsRotation', genericHandler(() => {
      const planetRotation = degToRad(Number.isNaN(data.planetRotation) ? 0 : data.planetRotation);
      const v = degToRad(Number.isNaN(data.cloudsRotation) ? 0 : data.cloudsRotation);
      clouds.mesh!.setRotationFromAxisAngle(clouds.mesh!.up, planetRotation + v);
    }));
    // Warping
    this.registerEventHandler('_cloudsShowWarping',       genericHandler(() => (clouds.uniforms!.flags.array[0] = +data.cloudsShowWarping)));
    this.registerEventHandler('_cloudsNoise._warpFactor', genericHandler(() => {
      // noinspection JSSuspiciousNameCombination
      clouds.uniforms!.warping.value.y = data.cloudsNoise.xWarpFactor;
      clouds.uniforms!.warping.value.z = data.cloudsNoise.yWarpFactor;
      clouds.uniforms!.warping.value.w = data.cloudsNoise.zWarpFactor;
    }));
    // Displacement
    this.registerEventHandler('_cloudsShowDisplacement',         genericHandler(() => (clouds.uniforms!.flags.array[1] = +data.cloudsShowDisplacement)));
    this.registerEventHandler('_cloudsDisplacement._factor',     genericHandler(() => (clouds.uniforms!.displacement.params.value.x = data.cloudsDisplacement.factor)));
    this.registerEventHandler('_cloudsDisplacement._epsilon',    genericHandler(() => (clouds.uniforms!.displacement.params.value.y = data.cloudsDisplacement.epsilon)));
    this.registerEventHandler('_cloudsDisplacement._multiplier', genericHandler(() => (clouds.uniforms!.displacement.params.value.z = data.cloudsDisplacement.multiplier)));
    this.registerEventHandler('_cloudsDisplacement._frequency',  genericHandler(() => (clouds.uniforms!.displacement.noise.value.x = data.cloudsDisplacement.frequency)));
    this.registerEventHandler('_cloudsDisplacement._amplitude',  genericHandler(() => (clouds.uniforms!.displacement.noise.value.y = data.cloudsDisplacement.amplitude)));
    this.registerEventHandler('_cloudsDisplacement._lacunarity', genericHandler(() => (clouds.uniforms!.displacement.noise.value.z = data.cloudsDisplacement.lacunarity)));
    this.registerEventHandler('_cloudsDisplacement._octaves',    genericHandler(() => (clouds.uniforms!.displacement.noise.value.w = data.cloudsDisplacement.octaves)));
    // Noise
    this.registerEventHandler('_cloudsNoise._frequency',  genericHandler(() => (clouds.uniforms!.noise.value.x = data.cloudsNoise.frequency)));
    this.registerEventHandler('_cloudsNoise._amplitude',  genericHandler(() => (clouds.uniforms!.noise.value.y = data.cloudsNoise.amplitude)));
    this.registerEventHandler('_cloudsNoise._lacunarity', genericHandler(() => (clouds.uniforms!.noise.value.z = data.cloudsNoise.lacunarity)));
    this.registerEventHandler('_cloudsNoise._octaves',    genericHandler(() => (clouds.uniforms!.noise.value.w = data.cloudsNoise.octaves)));
    // Color
    this.registerEventHandler('_cloudsColor',             genericHandler(() =>  (clouds.uniforms!.color.value = data.cloudsColor)));
    this.registerEventHandler('_cloudsColorRamp',         genericHandler(() =>  {
      const v = data.cloudsColorRamp;
      TextureHelper.recalculateRampTexture(clouds.buffer, Globals.TEXTURE_SIZES.CLOUDS, v.steps);
      clouds.texture!.needsUpdate = true;
    }));
  }

  // prettier-ignore
  private registerAtmosphereDataUpdates(data: PlanetData, atmosphere: AtmosphereMeshData): void {
    this.registerEventHandler('_atmosphereEnabled', genericHandler(() => (atmosphere.mesh!.visible = data.atmosphereEnabled)));
    this.registerEventHandler('_atmosphereHeight',  genericHandler(() => {
      atmosphere.mesh!.geometry.dispose();
      atmosphere.mesh!.geometry = ComponentHelper.createSphereGeometryComponent(data.planetMeshQuality, 1 + data.atmosphereHeight);
      atmosphere.uniforms!.transform.radius.value = data.planetRadius + data.atmosphereHeight;
    }));
    this.registerEventHandler('_atmosphereDensityScale',          genericHandler(() =>  (atmosphere.uniforms!.render.density.value = data.atmosphereDensityScale)));
    this.registerEventHandler('_atmosphereIntensity',             genericHandler(() =>  (atmosphere.uniforms!.render.intensity.value = data.atmosphereIntensity)));
    this.registerEventHandler('_atmosphereColorMode',             genericHandler(() =>  (atmosphere.uniforms!.render.colorMode.value = data.atmosphereColorMode)));
    this.registerEventHandler('_atmosphereHue',                   genericHandler(() =>  (atmosphere.uniforms!.render.hue.value = data.atmosphereHue)));
    this.registerEventHandler('_atmosphereTint',                  genericHandler(() =>  (atmosphere.uniforms!.render.tint.value = data.atmosphereTint)));
    this.registerEventHandler('_atmosphereMieScatteringConstant', genericHandler(() =>  (atmosphere.uniforms!.render.advanced.mieScatteringConstant.value = data.atmosphereMieScatteringConstant)));
    this.registerEventHandler('_atmosphereRayleighDensityRatio',  genericHandler(() =>  (atmosphere.uniforms!.render.advanced.rayleighDensityRatio.value = data.atmosphereRayleighDensityRatio)));
    this.registerEventHandler('_atmosphereMieDensityRatio',       genericHandler(() =>  (atmosphere.uniforms!.render.advanced.mieDensityRatio.value = data.atmosphereMieDensityRatio)));
    this.registerEventHandler('_atmosphereOpticalDensityRatio',   genericHandler(() =>  (atmosphere.uniforms!.render.advanced.opticalDensityRatio.value = data.atmosphereOpticalDensityRatio)));
  }

  // prettier-ignore
  private registerRingsDataUpdates(data: PlanetData, ringAnchor: Group, ringsMeshData: RingMeshData[]): void {
    this.registerEventHandler('_ringsEnabled', genericHandler(() => {
      ringAnchor.visible = data.ringsEnabled
      ringAnchor.children.forEach(r => r.visible = data.ringsEnabled)
    }));
    this.registerEventHandler('_ringsParams', globalHandler(() => {
      ComponentHelper.disposeAllRings(ringAnchor, ringsMeshData);
      data.ringsParams.forEach(r => {
        const newRing = ComponentHelper.createRing(data, r)
        ringsMeshData.push(newRing)
        ringAnchor.add(newRing.mesh!)
      })
    }));
    this.registerEventHandler('_ringsParams[element]', keyedHandler((event) => {
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
            ringAnchor.add(newRing.mesh!)
          })
          break;
        }
        case ObservableEventAction.DELETE: {
          ComponentHelper.disposeRing(ringAnchor, ringsMeshData, sourceRingParams);
          break;
        }
      }
    }));
    this.registerEventHandler(`_ringsParams[element]._innerRadius`, keyedHandler((event) => {
      const ringParams = event.data!.ring as RingParameters
      const rmd = ringsMeshData.find(r => r.mesh!.name === ringParams.id)
      if (!rmd) return;
      rmd.mesh!.geometry.dispose()
      rmd.mesh!.geometry = ComponentHelper.createRingGeometryComponent(data.planetMeshQuality, ringParams.innerRadius, ringParams.outerRadius)
      rmd.uniforms!.innerRadius.value = ringParams.innerRadius
    }));
    this.registerEventHandler(`_ringsParams[element]._outerRadius`, keyedHandler((event) => {
      const ringParams = event.data!.ring as RingParameters
      const rmd = ringsMeshData.find(r => r.mesh!.name === ringParams.id)
      if (!rmd) return;
      rmd.mesh!.geometry.dispose()
      rmd.mesh!.geometry = ComponentHelper.createRingGeometryComponent(data.planetMeshQuality, ringParams.innerRadius, ringParams.outerRadius)
      rmd.uniforms!.outerRadius.value = ringParams.outerRadius
    }));
    this.registerEventHandler(`_ringsParams[element]._colorRamp`, keyedHandler((event) => {
      const colorRamp = event.data!.ramp as ColorRamp
      const ringParams = data.ringsParams.find(rp => rp.colorRamp.hash === colorRamp.hash)
      const rmd = ringsMeshData.find(r => r.mesh!.name === ringParams?.id)
      if (!ringParams || !rmd) return;
      TextureHelper.recalculateRampTexture(rmd.buffer!, Globals.TEXTURE_SIZES.RING, ringParams.colorRamp.steps)
      rmd.texture!.needsUpdate = true
    }));
  }
}
