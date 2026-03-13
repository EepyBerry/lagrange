import type PlanetData from '../models/planet-data.model';
import {
  Observable,
  ObservableRelay,
  Observer,
  ObservableKeyedEvent,
  ObservableEventAction,
  ObservableGlobalEvent,
  type ObservableType,
} from '../utils/observable-utils';
import * as Globals from '@core/globals';
import * as ComponentHelper from '@/core/helpers/component.helper';
import * as TextureHelper from '@/core/helpers/texture.helper';
import { degToRad } from 'three/src/math/MathUtils.js';
import type { PlanetMeshData, EditorSceneData, AtmosphereMeshData, CloudsMeshData, RingMeshData } from '../types';
import type { AmbientLight, DirectionalLight, Group } from 'three';
import type { LensFlareEffect } from '../effects/lens-flare.effect';
import type { BiomeParameters } from '../models/biome-parameters.model';
import { RingParameters } from '../models/ring-parameters.model';
import type { ColorRamp } from '../models/color-ramp.model';
import type { NodeMaterial } from 'three/webgpu';
import { EDITOR_STATE } from '../state/editor.state';

export class PlanetDataUniformifierObserver extends Observer {
  private readonly UNIFORM_UPDATE_MAP: Map<
    string,
    <T extends ObservableType>(source?: T, action?: ObservableEventAction, data?: Record<string, unknown>) => void
  > = new Map<string, () => void>();

  constructor(sceneData: EditorSceneData) {
    super();
    const planetData = EDITOR_STATE.value.planetData;

    // register uniform functions
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

  public onGlobalEvent(event: ObservableGlobalEvent<ObservableType>): void {
    this.UNIFORM_UPDATE_MAP.forEach((func) => func(event.source));
  }

  public onKeyedEvent(event: ObservableKeyedEvent<Observable | ObservableRelay>): void {
    console.log(event.key);
    this.UNIFORM_UPDATE_MAP.get(event.key)?.(event.source, event.action);
  }

  public clearUniformUpdateMap() {
    this.UNIFORM_UPDATE_MAP.clear();
  }

  // prettier-ignore
  private registerLightingDataUpdates(data: PlanetData, sunLight: DirectionalLight, ambLight: AmbientLight, lensFlare: LensFlareEffect): void {
    this.UNIFORM_UPDATE_MAP.set('_lensFlareEnabled',         () => lensFlare.mesh.visible = data.lensFlareEnabled)
    this.UNIFORM_UPDATE_MAP.set('_lensFlarePointsIntensity', () => lensFlare.uniforms.starPointsIntensity.value = data.lensFlarePointsIntensity)
    this.UNIFORM_UPDATE_MAP.set('_lensFlareGlareIntensity',  () => lensFlare.uniforms.glareIntensity.value = data.lensFlareGlareIntensity)
    this.UNIFORM_UPDATE_MAP.set('_sunLightAngle', () => {
      const v = degToRad(isNaN(data.sunLightAngle) ? 0 : data.sunLightAngle)
      const newPos = Globals.SUN_INIT_POS.clone().applyAxisAngle(Globals.AXIS_X, v)
      sunLight.position.set(newPos.x, newPos.y, newPos.z)
    })
    this.UNIFORM_UPDATE_MAP.set('_sunLightColor', () => {
      sunLight.color.set(data.sunLightColor)
      lensFlare.uniforms.colorGain.value = data.sunLightColor
    })
    this.UNIFORM_UPDATE_MAP.set('_sunLightIntensity', () => sunLight.intensity = data.sunLightIntensity)
    this.UNIFORM_UPDATE_MAP.set('_ambLightColor',     () => ambLight.color.set(data.ambLightColor))
    this.UNIFORM_UPDATE_MAP.set('_ambLightIntensity', () => ambLight.intensity = data.ambLightIntensity)
  }

  // prettier-ignore
  private registerPlanetRenderingDataUpdates(
    data: PlanetData,
    planetGroup: Group,
    planet: PlanetMeshData,
    atmosphere: AtmosphereMeshData,
    clouds: CloudsMeshData,
  ): void {
    this.UNIFORM_UPDATE_MAP.set('_planetRadius', () => {
      const v = data.planetRadius
      planetGroup.scale.setScalar(v)
      planet.uniforms!.radius.value = v
      atmosphere.uniforms!.transform.surfaceRadius.value = v
      atmosphere.uniforms!.transform.radius.value = data.planetRadius + data.atmosphereHeight
    })
    this.UNIFORM_UPDATE_MAP.set('_planetAxialTilt', () => {
      const v = degToRad(isNaN(data.planetAxialTilt) ? 0 : data.planetAxialTilt)
      planetGroup.setRotationFromAxisAngle(Globals.AXIS_X, v)
    })
    this.UNIFORM_UPDATE_MAP.set('_planetRotation', () => {
      const vRad = degToRad(isNaN(data.planetRotation) ? 0 : data.planetRotation)
      const cloudsRotationRad = degToRad(isNaN(data.cloudsRotation) ? 0 : data.cloudsRotation)
      planet.mesh!.setRotationFromAxisAngle(planet.mesh!.up, vRad)
      clouds.mesh!.setRotationFromAxisAngle(clouds.mesh!.up, vRad + cloudsRotationRad)
    })
    this.UNIFORM_UPDATE_MAP.set('_planetWaterLevel', () => (planet.uniforms!.pbr.waterLevel.value = data.planetWaterLevel))
    this.UNIFORM_UPDATE_MAP.set('_planetWaterRoughness', () => (planet.uniforms!.pbr.metallicRoughness.value.x = data.planetWaterRoughness))
    this.UNIFORM_UPDATE_MAP.set('_planetWaterMetalness', () => (planet.uniforms!.pbr.metallicRoughness.value.y = data.planetWaterMetalness))
    this.UNIFORM_UPDATE_MAP.set('_planetGroundRoughness', () => (planet.uniforms!.pbr.metallicRoughness.value.z = data.planetGroundRoughness))
    this.UNIFORM_UPDATE_MAP.set('_planetGroundMetalness', () => (planet.uniforms!.pbr.metallicRoughness.value.w = data.planetGroundMetalness))
    this.UNIFORM_UPDATE_MAP.set('_planetShowEmissive', () => (planet.uniforms!.flags.array[4] = +data.planetShowEmissive))
    this.UNIFORM_UPDATE_MAP.set('_planetWaterEmissiveIntensity', () => (planet.uniforms!.pbr.emissive.value.x = data.planetWaterEmissiveIntensity))
    this.UNIFORM_UPDATE_MAP.set('_planetGroundEmissiveIntensity', () => {
      planet.uniforms!.pbr.emissive.value.y = data.planetGroundEmissiveIntensity;
      planet.biomeEmissiveLayersTexture?.updateAllLayers(data.biomesParams)
    })
  }

  // prettier-ignore
  private registerSurfaceDataUpdates(data: PlanetData, planet: PlanetMeshData): void {
    this.UNIFORM_UPDATE_MAP.set('_planetSurfaceShowBumps',                () => (planet.uniforms!.flags.array[2] = +data.planetSurfaceShowBumps))
    this.UNIFORM_UPDATE_MAP.set('_planetSurfaceBumpStrength',             () => (planet.uniforms!.bumpStrength.value = data.planetSurfaceBumpStrength))
    // Color
    this.UNIFORM_UPDATE_MAP.set('_planetSurfaceColorRamp', () => {
      const v = data.planetSurfaceColorRamp
      TextureHelper.recalculateRampTexture(planet.surfaceBuffer, Globals.TEXTURE_SIZES.SURFACE, v.steps)
      planet.surfaceTexture!.needsUpdate = true
    })

    // Warping
    this.UNIFORM_UPDATE_MAP.set('_planetSurfaceShowWarping', () => (planet.uniforms!.flags.array[0] = +data.planetSurfaceShowWarping))
    this.UNIFORM_UPDATE_MAP.set('_planetSurfaceNoise._warpFactor', () => {
      planet.uniforms!.surface.warping.value.y = data.planetSurfaceNoise.xWarpFactor
      planet.uniforms!.surface.warping.value.z = data.planetSurfaceNoise.yWarpFactor
      planet.uniforms!.surface.warping.value.w = data.planetSurfaceNoise.zWarpFactor
    })

    // Displacement
    this.UNIFORM_UPDATE_MAP.set('_planetSurfaceShowDisplacement',         () => (planet.uniforms!.flags.array[1] = +data.planetSurfaceShowDisplacement))
    this.UNIFORM_UPDATE_MAP.set('_planetSurfaceDisplacement._factor',     () => (planet.uniforms!.surface.displacement.params.value.x = data.planetSurfaceDisplacement.factor))
    this.UNIFORM_UPDATE_MAP.set('_planetSurfaceDisplacement._epsilon',    () => (planet.uniforms!.surface.displacement.params.value.y = data.planetSurfaceDisplacement.epsilon))
    this.UNIFORM_UPDATE_MAP.set('_planetSurfaceDisplacement._multiplier', () => (planet.uniforms!.surface.displacement.params.value.z = data.planetSurfaceDisplacement.multiplier))
    this.UNIFORM_UPDATE_MAP.set('_planetSurfaceDisplacement._frequency',  () => (planet.uniforms!.surface.displacement.noise.value.x = data.planetSurfaceDisplacement.frequency))
    this.UNIFORM_UPDATE_MAP.set('_planetSurfaceDisplacement._amplitude',  () => (planet.uniforms!.surface.displacement.noise.value.y = data.planetSurfaceDisplacement.amplitude))
    this.UNIFORM_UPDATE_MAP.set('_planetSurfaceDisplacement._lacunarity', () => (planet.uniforms!.surface.displacement.noise.value.z = data.planetSurfaceDisplacement.lacunarity))
    this.UNIFORM_UPDATE_MAP.set('_planetSurfaceDisplacement._octaves',    () => (planet.uniforms!.surface.displacement.noise.value.w = data.planetSurfaceDisplacement.octaves))

    // Noise
    this.UNIFORM_UPDATE_MAP.set('_planetSurfaceNoise._layers',     () => (planet.uniforms!.surface.warping.value.x = data.planetSurfaceNoise.layers))
    this.UNIFORM_UPDATE_MAP.set('_planetSurfaceNoise._frequency',  () => (planet.uniforms!.surface.noise.value.x = data.planetSurfaceNoise.frequency),)
    this.UNIFORM_UPDATE_MAP.set('_planetSurfaceNoise._amplitude',  () => (planet.uniforms!.surface.noise.value.y = data.planetSurfaceNoise.amplitude))
    this.UNIFORM_UPDATE_MAP.set('_planetSurfaceNoise._lacunarity', () => (planet.uniforms!.surface.noise.value.z = data.planetSurfaceNoise.lacunarity),)
    this.UNIFORM_UPDATE_MAP.set('_planetSurfaceNoise._octaves',    () => (planet.uniforms!.surface.noise.value.w = data.planetSurfaceNoise.octaves),)
  }

  // prettier-ignore
  private registerBiomeDataUpdates(data: PlanetData, planet: PlanetMeshData): void {
    this.UNIFORM_UPDATE_MAP.set('_biomesEnabled',                      () => (planet.uniforms!.flags.array[3] = +data.biomesEnabled))
    // Temperature
    this.UNIFORM_UPDATE_MAP.set('_biomesTemperatureMode',              () => (planet.uniforms!.biomes.temperatureMode.value = data.biomesTemperatureMode))
    this.UNIFORM_UPDATE_MAP.set('_biomesTemperatureNoise._frequency',  () => (planet.uniforms!.biomes.temperatureNoise.value.x = data.biomesTemperatureNoise.frequency))
    this.UNIFORM_UPDATE_MAP.set('_biomesTemperatureNoise._amplitude',  () => (planet.uniforms!.biomes.temperatureNoise.value.y = data.biomesTemperatureNoise.amplitude))
    this.UNIFORM_UPDATE_MAP.set('_biomesTemperatureNoise._lacunarity', () => (planet.uniforms!.biomes.temperatureNoise.value.z = data.biomesTemperatureNoise.lacunarity))
    this.UNIFORM_UPDATE_MAP.set('_biomesTemperatureNoise._octaves',    () => (planet.uniforms!.biomes.temperatureNoise.value.w = data.biomesTemperatureNoise.octaves))
    // Humidity
    this.UNIFORM_UPDATE_MAP.set('_biomesHumidityMode',                 () => (planet.uniforms!.biomes.humidityMode.value = data.biomesHumidityMode))
    this.UNIFORM_UPDATE_MAP.set('_biomesHumidityNoise._frequency',     () => (planet.uniforms!.biomes.humidityNoise.value.x = data.biomesHumidityNoise.frequency))
    this.UNIFORM_UPDATE_MAP.set('_biomesHumidityNoise._amplitude',     () => (planet.uniforms!.biomes.humidityNoise.value.y = data.biomesHumidityNoise.amplitude))
    this.UNIFORM_UPDATE_MAP.set('_biomesHumidityNoise._lacunarity',    () => (planet.uniforms!.biomes.humidityNoise.value.z = data.biomesHumidityNoise.lacunarity))
    this.UNIFORM_UPDATE_MAP.set('_biomesHumidityNoise._octaves',       () => (planet.uniforms!.biomes.humidityNoise.value.w = data.biomesHumidityNoise.octaves))
    this.UNIFORM_UPDATE_MAP.set('_biomesParams', () => {
      planet.biomeLayersTexture!.reset(data.biomesParams)
      planet.biomeEmissiveLayersTexture!.reset(data.biomesParams)
    })
    this.UNIFORM_UPDATE_MAP.set('_biomesParams[element]', (source, action) => {
      const biome = source as BiomeParameters
      const biomeParamsIdx = data.findBiomeIndexById(biome.id)
      console.log(source)
      if (biomeParamsIdx === -1) return
      switch (action) {
        case ObservableEventAction.ADD:
          planet.biomeLayersTexture!.addLayer(biome!)
          planet.biomeEmissiveLayersTexture!.addLayer(biome!)
          break;
        case ObservableEventAction.EDIT:
          planet.biomeLayersTexture!.updateLayer(biomeParamsIdx, biome!)
          planet.biomeEmissiveLayersTexture!.updateLayer(biomeParamsIdx, biome!)
          break;
        case ObservableEventAction.DELETE:
          planet.biomeLayersTexture!.removeLayer(biomeParamsIdx)
          planet.biomeEmissiveLayersTexture!.removeLayer(biomeParamsIdx)
          break;
        case ObservableEventAction.SORT_UP:
          planet.biomeLayersTexture!.moveLayer(biomeParamsIdx, -1)
          planet.biomeEmissiveLayersTexture!.moveLayer(biomeParamsIdx, -1)
          break;
        case ObservableEventAction.SORT_DOWN:
          planet.biomeLayersTexture!.moveLayer(biomeParamsIdx, 1)
          planet.biomeEmissiveLayersTexture!.moveLayer(biomeParamsIdx, 1)
          break;
      }
    })
  }

  // prettier-ignore
  private registerCloudDataUpdates(data: PlanetData, clouds: CloudsMeshData): void {
    this.UNIFORM_UPDATE_MAP.set('_cloudsEnabled',  () => clouds.mesh!.visible = data.cloudsEnabled)
    this.UNIFORM_UPDATE_MAP.set('_cloudsRotation', () => {
      const planetRotation = degToRad(isNaN(data.planetRotation) ? 0 : data.planetRotation)
      const v = degToRad(isNaN(data.cloudsRotation) ? 0 : data.cloudsRotation)
      clouds.mesh!.setRotationFromAxisAngle(clouds.mesh!.up, planetRotation + v)
    })
    // Warping
    this.UNIFORM_UPDATE_MAP.set('_cloudsShowWarping',       () => clouds.uniforms!.flags.array[0] = +data.cloudsShowWarping)
    this.UNIFORM_UPDATE_MAP.set('_cloudsNoise._warpFactor', () => {
      clouds.uniforms!.warping.value.y = data.cloudsNoise.xWarpFactor
      clouds.uniforms!.warping.value.z = data.cloudsNoise.yWarpFactor
      clouds.uniforms!.warping.value.w = data.cloudsNoise.zWarpFactor
    })
    // Displacement
    this.UNIFORM_UPDATE_MAP.set('_cloudsShowDisplacement',       () => (clouds.uniforms!.flags.array[1] = +data.cloudsShowDisplacement))
    this.UNIFORM_UPDATE_MAP.set('_cloudsDisplacement._factor',     () => (clouds.uniforms!.displacement.params.value.x = data.cloudsDisplacement.factor))
    this.UNIFORM_UPDATE_MAP.set('_cloudsDisplacement._epsilon',    () => (clouds.uniforms!.displacement.params.value.y = data.cloudsDisplacement.epsilon))
    this.UNIFORM_UPDATE_MAP.set('_cloudsDisplacement._multiplier', () => (clouds.uniforms!.displacement.params.value.z = data.cloudsDisplacement.multiplier))
    this.UNIFORM_UPDATE_MAP.set('_cloudsDisplacement._frequency',  () => (clouds.uniforms!.displacement.noise.value.x = data.cloudsDisplacement.frequency))
    this.UNIFORM_UPDATE_MAP.set('_cloudsDisplacement._amplitude',  () => (clouds.uniforms!.displacement.noise.value.y = data.cloudsDisplacement.amplitude))
    this.UNIFORM_UPDATE_MAP.set('_cloudsDisplacement._lacunarity', () => (clouds.uniforms!.displacement.noise.value.z = data.cloudsDisplacement.lacunarity))
    this.UNIFORM_UPDATE_MAP.set('_cloudsDisplacement._octaves',    () => (clouds.uniforms!.displacement.noise.value.w = data.cloudsDisplacement.octaves))
    // Noise
    this.UNIFORM_UPDATE_MAP.set('_cloudsNoise._frequency',  () => (clouds.uniforms!.noise.value.x = data.cloudsNoise.frequency),)
    this.UNIFORM_UPDATE_MAP.set('_cloudsNoise._amplitude',  () => (clouds.uniforms!.noise.value.y = data.cloudsNoise.amplitude))
    this.UNIFORM_UPDATE_MAP.set('_cloudsNoise._lacunarity', () => (clouds.uniforms!.noise.value.z = data.cloudsNoise.lacunarity),)
    this.UNIFORM_UPDATE_MAP.set('_cloudsNoise._octaves',    () => (clouds.uniforms!.noise.value.w = data.cloudsNoise.octaves),)
    // Color
    this.UNIFORM_UPDATE_MAP.set('_cloudsColor',             () =>  clouds.uniforms!.color.value = data.cloudsColor)
    this.UNIFORM_UPDATE_MAP.set('_cloudsColorRamp',         () =>  {
      const v = data.cloudsColorRamp
      TextureHelper.recalculateRampTexture(clouds.buffer!, Globals.TEXTURE_SIZES.CLOUDS, v.steps)
      clouds.texture!.needsUpdate = true
    })
  }

  // prettier-ignore
  private registerAtmosphereDataUpdates(data: PlanetData, atmosphere: AtmosphereMeshData): void {
    this.UNIFORM_UPDATE_MAP.set('_atmosphereEnabled', () => atmosphere.mesh!.visible = data.atmosphereEnabled)
    this.UNIFORM_UPDATE_MAP.set('_atmosphereHeight',  () => {
      atmosphere.mesh!.geometry.dispose()
      atmosphere.mesh!.geometry = ComponentHelper.createSphereGeometryComponent(data.planetMeshQuality, 1.0 + data.atmosphereHeight)
      atmosphere.uniforms!.transform.radius.value = data.planetRadius + data.atmosphereHeight
    })
    this.UNIFORM_UPDATE_MAP.set('_atmosphereDensityScale', () =>  atmosphere.uniforms!.render.density.value = data.atmosphereDensityScale)
    this.UNIFORM_UPDATE_MAP.set('_atmosphereIntensity',    () =>  atmosphere.uniforms!.render.intensity.value = data.atmosphereIntensity)
    this.UNIFORM_UPDATE_MAP.set('_atmosphereColorMode',    () =>  atmosphere.uniforms!.render.colorMode.value = data.atmosphereColorMode)
    this.UNIFORM_UPDATE_MAP.set('_atmosphereHue',          () =>  atmosphere.uniforms!.render.hue.value = data.atmosphereHue)
    this.UNIFORM_UPDATE_MAP.set('_atmosphereTint',         () =>  atmosphere.uniforms!.render.tint.value = data.atmosphereTint)
    this.UNIFORM_UPDATE_MAP.set('_atmosphereMieScatteringConstant',  () =>  atmosphere.uniforms!.render.advanced.mieScatteringConstant.value = data.atmosphereMieScatteringConstant)
    this.UNIFORM_UPDATE_MAP.set('_atmosphereRayleighDensityRatio',   () =>  atmosphere.uniforms!.render.advanced.rayleighDensityRatio.value = data.atmosphereRayleighDensityRatio)
    this.UNIFORM_UPDATE_MAP.set('_atmosphereMieDensityRatio',        () =>  atmosphere.uniforms!.render.advanced.mieDensityRatio.value = data.atmosphereMieDensityRatio)
    this.UNIFORM_UPDATE_MAP.set('_atmosphereOpticalDensityRatio',   () =>  atmosphere.uniforms!.render.advanced.opticalDensityRatio.value = data.atmosphereOpticalDensityRatio)
  }

  // prettier-ignore
  private registerRingsDataUpdates(data: PlanetData, ringAnchor: Group, ringsMeshData: RingMeshData[]): void {
    this.UNIFORM_UPDATE_MAP.set('_ringsEnabled', () => {
      ringAnchor.visible = data.ringsEnabled
      ringAnchor.children.forEach(r => r.visible = data.ringsEnabled)
    })
    this.UNIFORM_UPDATE_MAP.set('_ringsParams', (source, action) => {
      console.log(source)
      const sourceRingParams = source as RingParameters;
      switch (action) {
        case ObservableEventAction.ADD: {
          const newRingParams = data.addRing();
          const newMeshData = ComponentHelper.createRing(data, newRingParams);
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
          data.removeRing(sourceRingParams.id)
          ComponentHelper.disposeRing(data, ringAnchor, ringsMeshData, source as RingParameters)
          break;
        }
      }
    })
    this.UNIFORM_UPDATE_MAP.set(`_ringsParams[element]._innerRadius`, (source) => {
      const ringParams = source as RingParameters
      const rmd = ringsMeshData.find(r => r.mesh!.name === ringParams.id)
      if (!rmd) return;
      rmd.mesh!.geometry.dispose()
      rmd.mesh!.geometry = ComponentHelper.createRingGeometryComponent(data.planetMeshQuality, ringParams.innerRadius, ringParams.outerRadius)
      rmd.uniforms!.innerRadius.value = ringParams.innerRadius
    })
    this.UNIFORM_UPDATE_MAP.set(`_ringsParams[element]._outerRadius`, (source) => {
      const ringParams = source as RingParameters
      const rmd = ringsMeshData.find(r => r.mesh!.name === ringParams.id)
      if (!rmd) return;
      rmd.mesh!.geometry.dispose()
      rmd.mesh!.geometry = ComponentHelper.createRingGeometryComponent(data.planetMeshQuality, ringParams.innerRadius, ringParams.outerRadius)
      rmd.uniforms!.outerRadius.value = ringParams.outerRadius
    })
    this.UNIFORM_UPDATE_MAP.set(`_ringsParams[element]._colorRamp`, (source) => {
      const colorRamp = source as ColorRamp
      const ringParams = data.ringsParams.find(rp => rp.colorRamp.hash === colorRamp.hash)
      const rmd = ringsMeshData.find(r => r.mesh!.name === ringParams?.id)
      if (!ringParams || !rmd) return;
      TextureHelper.recalculateRampTexture(rmd.buffer!, Globals.TEXTURE_SIZES.RING, ringParams.colorRamp.steps)
      rmd.texture!.needsUpdate = true
    })
  }
}
