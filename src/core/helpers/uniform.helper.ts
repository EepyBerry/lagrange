import { ref, type Ref } from "vue";
import { LG_BUFFER_BIOME, LG_BUFFER_CLOUDS, LG_BUFFER_RING, LG_BUFFER_SURFACE, LG_PLANET_DATA } from "../services/planet-editor.service";
import * as Globals from '@core/globals'
import * as ComponentBuilder from '@core/three/component.builder'
import { degToRad } from "three/src/math/MathUtils.js";
import { patchMeshUniform, setMeshUniform, setMeshUniforms } from "@/utils/three-utils";
import { recalculateBiomeTexture, recalculateRampTexture } from "./texture.helper";
import type { ColorRampStep } from "../models/color-ramp.model";
import type { PlanetSceneData } from "../types";
import type { AmbientLight, DataTexture, DirectionalLight, Group, Mesh } from "three";
import type { LensFlareEffect } from "../three/lens-flare.effect";
import type { BiomeParameters } from "../models/biome-parameters.model";

const UNIFORM_UPDATE_MAP: Ref<Map<string, () => void>> = ref(new Map<string, () => void>())

export function initUniformUpdateMap(sceneData: PlanetSceneData) {
  registerLightingDataUpdates(sceneData.sunLight!, sceneData.ambLight!, sceneData.lensFlare!)
  registerPlanetRenderingDataUpdates(sceneData.planetGroup!, sceneData.planet!, sceneData.atmosphere!, sceneData.clouds!)
  registerSurfaceDataUpdates(sceneData.planet!, sceneData.surfaceDataTex!)
  registerBiomeDataUpdates(sceneData.planet!, sceneData.biomeDataTex!)
  registerCloudDataUpdates(sceneData.clouds!, sceneData.cloudsDataTex!)
  registerAtmosphereDataUpdates(sceneData.atmosphere!)
  registerRingDataUpdates(sceneData.ring!, sceneData.ringDataTex!)
}

export function clearUniformUpdateMap() {
  UNIFORM_UPDATE_MAP.value.clear()
}

export function execUniformUpdate(key: string) {
  UNIFORM_UPDATE_MAP.value.get(key)?.()
}

// prettier-ignore
function registerLightingDataUpdates(sunLight: DirectionalLight, ambLight: AmbientLight, lensFlare: LensFlareEffect): void {
  UNIFORM_UPDATE_MAP.value.set('_lensFlareEnabled',         () => lensFlare.mesh.visible = LG_PLANET_DATA.value.lensFlareEnabled)
  UNIFORM_UPDATE_MAP.value.set('_lensFlarePointsIntensity', () => setMeshUniform(lensFlare, 'starPointsIntensity', LG_PLANET_DATA.value.lensFlarePointsIntensity))
  UNIFORM_UPDATE_MAP.value.set('_lensFlareGlareIntensity',  () => setMeshUniform(lensFlare, 'glareIntensity', LG_PLANET_DATA.value.lensFlareGlareIntensity))
  UNIFORM_UPDATE_MAP.value.set('_sunLightAngle', () => {
    const v = degToRad(isNaN(LG_PLANET_DATA.value.sunLightAngle) ? 0 : LG_PLANET_DATA.value.sunLightAngle)
    const newPos = Globals.SUN_INIT_POS.clone().applyAxisAngle(Globals.AXIS_X, v)
    sunLight.position.set(newPos.x, newPos.y, newPos.z)
  })
  UNIFORM_UPDATE_MAP.value.set('_sunLightColor', () => {
    sunLight.color.set(LG_PLANET_DATA.value.sunLightColor)
    setMeshUniform(lensFlare, 'colorGain', LG_PLANET_DATA.value.sunLightColor)
  })
  UNIFORM_UPDATE_MAP.value.set('_sunLightIntensity', () => sunLight.intensity = LG_PLANET_DATA.value.sunLightIntensity)
  UNIFORM_UPDATE_MAP.value.set('_ambLightColor',     () => ambLight.color.set(LG_PLANET_DATA.value.ambLightColor))
  UNIFORM_UPDATE_MAP.value.set('_ambLightIntensity', () => ambLight.intensity = LG_PLANET_DATA.value.ambLightIntensity)
}

// prettier-ignore
function registerPlanetRenderingDataUpdates(planetGroup: Group, planet: Mesh, atmosphere: Mesh, clouds: Mesh): void {
  UNIFORM_UPDATE_MAP.value.set('_planetRadius', () => {
    const v = LG_PLANET_DATA.value.planetRadius
    const atmosHeight = LG_PLANET_DATA.value.atmosphereHeight / Globals.ATMOSPHERE_HEIGHT_DIVIDER
    planetGroup.scale.setScalar(v)
    setMeshUniform(planet, 'u_radius', v)
    setMeshUniforms(atmosphere, ['u_surface_radius', 'u_radius'], [v, v + atmosHeight])
  })
  UNIFORM_UPDATE_MAP.value.set('_planetAxialTilt', () => {
    const v = degToRad(isNaN(LG_PLANET_DATA.value.planetAxialTilt) ? 0 : LG_PLANET_DATA.value.planetAxialTilt)
    planetGroup.setRotationFromAxisAngle(Globals.AXIS_X, v)
  })
  UNIFORM_UPDATE_MAP.value.set('_planetRotation', () => {
    const vRad = degToRad(isNaN(LG_PLANET_DATA.value.planetRotation) ? 0 : LG_PLANET_DATA.value.planetRotation)
    const cloudsRotationRad = degToRad(
      isNaN(LG_PLANET_DATA.value.cloudsRotation) ? 0 : LG_PLANET_DATA.value.cloudsRotation,
    )
    planet.setRotationFromAxisAngle(planet.up, vRad)
    clouds.setRotationFromAxisAngle(clouds.up, vRad + cloudsRotationRad)
  })
  UNIFORM_UPDATE_MAP.value.set('_planetWaterRoughness',  () => patchMeshUniform(planet, 'u_pbr_params', { wrough: LG_PLANET_DATA.value.planetWaterRoughness }))
  UNIFORM_UPDATE_MAP.value.set('_planetWaterMetalness',  () => patchMeshUniform(planet, 'u_pbr_params', { wmetal: LG_PLANET_DATA.value.planetWaterMetalness }))
  UNIFORM_UPDATE_MAP.value.set('_planetGroundRoughness', () => patchMeshUniform(planet, 'u_pbr_params', { grough: LG_PLANET_DATA.value.planetGroundRoughness }))
  UNIFORM_UPDATE_MAP.value.set('_planetGroundMetalness', () => patchMeshUniform(planet, 'u_pbr_params', { gmetal: LG_PLANET_DATA.value.planetGroundMetalness }))
  UNIFORM_UPDATE_MAP.value.set('_planetWaterLevel',      () => patchMeshUniform(planet, 'u_pbr_params', { wlevel: LG_PLANET_DATA.value.planetWaterLevel }))
}

// prettier-ignore
function registerSurfaceDataUpdates(planet: Mesh, surfaceDataTex: DataTexture): void {
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceShowBumps',                () => setMeshUniform(planet,   'u_bump', LG_PLANET_DATA.value.planetSurfaceShowBumps))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceBumpStrength',             () => setMeshUniform(planet,   'u_bump_strength', LG_PLANET_DATA.value.planetSurfaceBumpStrength))
  // Displacement
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceShowDisplacement',         () => setMeshUniform(planet,   'u_displace', LG_PLANET_DATA.value.planetSurfaceShowDisplacement))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceDisplacement._factor',     () => patchMeshUniform(planet, 'u_surface_displacement', { fac: LG_PLANET_DATA.value.planetSurfaceDisplacement.factor }))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceDisplacement._epsilon',    () => patchMeshUniform(planet, 'u_surface_displacement', { eps: LG_PLANET_DATA.value.planetSurfaceDisplacement.epsilon }))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceDisplacement._multiplier', () => patchMeshUniform(planet, 'u_surface_displacement', { mul: LG_PLANET_DATA.value.planetSurfaceDisplacement.multiplier }))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceDisplacement._frequency',  () => patchMeshUniform(planet, 'u_surface_displacement', { freq: LG_PLANET_DATA.value.planetSurfaceDisplacement.frequency }))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceDisplacement._amplitude',  () => patchMeshUniform(planet, 'u_surface_displacement', { amp: LG_PLANET_DATA.value.planetSurfaceDisplacement.amplitude }))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceDisplacement._lacunarity', () => patchMeshUniform(planet, 'u_surface_displacement', { lac: LG_PLANET_DATA.value.planetSurfaceDisplacement.lacunarity }))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceDisplacement._octaves',    () => patchMeshUniform(planet, 'u_surface_displacement', { oct: LG_PLANET_DATA.value.planetSurfaceDisplacement.octaves }))
  // Noise
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceNoise._frequency',         () => patchMeshUniform(planet, 'u_surface_noise', { freq: LG_PLANET_DATA.value.planetSurfaceNoise.frequency }))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceNoise._amplitude',         () => patchMeshUniform(planet, 'u_surface_noise', { amp: LG_PLANET_DATA.value.planetSurfaceNoise.amplitude }))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceNoise._lacunarity',        () => patchMeshUniform(planet, 'u_surface_noise', { lac: LG_PLANET_DATA.value.planetSurfaceNoise.lacunarity }))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceNoise._octaves',           () => patchMeshUniform(planet, 'u_surface_noise', { oct: LG_PLANET_DATA.value.planetSurfaceNoise.octaves }))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceNoise._layers',            () => patchMeshUniform(planet, 'u_surface_noise', { layers: LG_PLANET_DATA.value.planetSurfaceNoise.layers }))
  // Warping
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceShowWarping',              () => setMeshUniform(planet,   'u_warp', LG_PLANET_DATA.value.planetSurfaceShowWarping))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceNoise._warpFactor',        () => patchMeshUniform(planet, 'u_surface_noise', {
    xwarp: LG_PLANET_DATA.value.planetSurfaceNoise.xWarpFactor,
    ywarp: LG_PLANET_DATA.value.planetSurfaceNoise.yWarpFactor,
    zwarp: LG_PLANET_DATA.value.planetSurfaceNoise.zWarpFactor
  }))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceColorRamp',         () => {
    const v = LG_PLANET_DATA.value.planetSurfaceColorRamp
    recalculateRampTexture(LG_BUFFER_SURFACE, Globals.TEXTURE_SIZES.SURFACE, v.steps as ColorRampStep[])
    surfaceDataTex.needsUpdate = true
  })
}

// prettier-ignore
function registerBiomeDataUpdates(planet: Mesh, biomeDataTex: DataTexture): void {
  UNIFORM_UPDATE_MAP.value.set('_biomesEnabled',                      () => setMeshUniform(planet, 'u_biomes', LG_PLANET_DATA.value.biomesEnabled))
  // Temperature
  UNIFORM_UPDATE_MAP.value.set('_biomesTemperatureMode',              () => patchMeshUniform(planet, 'u_temp_noise', { mode: LG_PLANET_DATA.value.biomesTemperatureMode }))
  UNIFORM_UPDATE_MAP.value.set('_biomesTemperatureNoise._frequency',  () => patchMeshUniform(planet, 'u_temp_noise', { lac: LG_PLANET_DATA.value.biomesTemperatureNoise.frequency }))
  UNIFORM_UPDATE_MAP.value.set('_biomesTemperatureNoise._amplitude',  () => patchMeshUniform(planet, 'u_temp_noise', { amp: LG_PLANET_DATA.value.biomesTemperatureNoise.amplitude }))
  UNIFORM_UPDATE_MAP.value.set('_biomesTemperatureNoise._lacunarity', () => patchMeshUniform(planet, 'u_temp_noise', { lac: LG_PLANET_DATA.value.biomesTemperatureNoise.lacunarity }))
  UNIFORM_UPDATE_MAP.value.set('_biomesTemperatureNoise._octaves',    () => patchMeshUniform(planet, 'u_temp_noise', { oct: LG_PLANET_DATA.value.biomesTemperatureNoise.octaves }))
  // Humidity
  UNIFORM_UPDATE_MAP.value.set('_biomesHumidityMode',                 () => patchMeshUniform(planet, 'u_humi_noise', { mode: LG_PLANET_DATA.value.biomesHumidityMode }))
  UNIFORM_UPDATE_MAP.value.set('_biomesHumidityNoise._frequency',     () => patchMeshUniform(planet, 'u_humi_noise', { lac: LG_PLANET_DATA.value.biomesHumidityNoise.frequency }))
  UNIFORM_UPDATE_MAP.value.set('_biomesHumidityNoise._amplitude',     () => patchMeshUniform(planet, 'u_humi_noise', { amp: LG_PLANET_DATA.value.biomesHumidityNoise.amplitude }))
  UNIFORM_UPDATE_MAP.value.set('_biomesHumidityNoise._lacunarity',    () => patchMeshUniform(planet, 'u_humi_noise', { lac: LG_PLANET_DATA.value.biomesHumidityNoise.lacunarity }))
  UNIFORM_UPDATE_MAP.value.set('_biomesHumidityNoise._octaves',       () => patchMeshUniform(planet, 'u_humi_noise', { oct: LG_PLANET_DATA.value.biomesHumidityNoise.octaves }))
  UNIFORM_UPDATE_MAP.value.set('_biomesParameters', () => {
    recalculateBiomeTexture(LG_BUFFER_BIOME, Globals.TEXTURE_SIZES.BIOME, LG_PLANET_DATA.value.biomesParams as BiomeParameters[])
    biomeDataTex.needsUpdate = true
  })
}

// prettier-ignore
function registerCloudDataUpdates(clouds: Mesh, cloudsDataTex: DataTexture): void {
  UNIFORM_UPDATE_MAP.value.set('_cloudsEnabled',  () => clouds.visible = LG_PLANET_DATA.value.cloudsEnabled)
  UNIFORM_UPDATE_MAP.value.set('_cloudsRotation', () => {
    const planetRotation = degToRad(isNaN(LG_PLANET_DATA.value.planetRotation) ? 0 : LG_PLANET_DATA.value.planetRotation)
    const v = degToRad(isNaN(LG_PLANET_DATA.value.cloudsRotation) ? 0 : LG_PLANET_DATA.value.cloudsRotation)
    clouds.setRotationFromAxisAngle(clouds.up, planetRotation + v)
  })
  UNIFORM_UPDATE_MAP.value.set('_cloudsShowWarping',       () => setMeshUniform(clouds,   'u_warp', LG_PLANET_DATA.value.cloudsShowWarping))
  UNIFORM_UPDATE_MAP.value.set('_cloudsNoise._frequency',  () => patchMeshUniform(clouds, 'u_noise', { freq: LG_PLANET_DATA.value.cloudsNoise.frequency }))
  UNIFORM_UPDATE_MAP.value.set('_cloudsNoise._amplitude',  () => patchMeshUniform(clouds, 'u_noise', { amp: LG_PLANET_DATA.value.cloudsNoise.amplitude }))
  UNIFORM_UPDATE_MAP.value.set('_cloudsNoise._lacunarity', () => patchMeshUniform(clouds, 'u_noise', { lac: LG_PLANET_DATA.value.cloudsNoise.lacunarity }))
  UNIFORM_UPDATE_MAP.value.set('_cloudsNoise._octaves',    () => patchMeshUniform(clouds, 'u_noise', { oct: LG_PLANET_DATA.value.cloudsNoise.octaves }))
  UNIFORM_UPDATE_MAP.value.set('_cloudsNoise._warpFactor', () => patchMeshUniform(clouds, 'u_noise', {
    xwarp: LG_PLANET_DATA.value.cloudsNoise.xWarpFactor,
    ywarp: LG_PLANET_DATA.value.cloudsNoise.yWarpFactor,
    zwarp: LG_PLANET_DATA.value.cloudsNoise.zWarpFactor,
  }))
  UNIFORM_UPDATE_MAP.value.set('_cloudsColor',             () =>  setMeshUniform(clouds, 'u_color', LG_PLANET_DATA.value.cloudsColor))
  UNIFORM_UPDATE_MAP.value.set('_cloudsColorRamp',         () =>  {
    const v = LG_PLANET_DATA.value.cloudsColorRamp
    recalculateRampTexture(LG_BUFFER_CLOUDS, Globals.TEXTURE_SIZES.CLOUDS, v.steps as ColorRampStep[])
    cloudsDataTex.needsUpdate = true
  })
}

// prettier-ignore
function registerAtmosphereDataUpdates(atmosphere: Mesh): void {
  UNIFORM_UPDATE_MAP.value.set('_atmosphereEnabled', () => atmosphere.visible = LG_PLANET_DATA.value.atmosphereEnabled)
  UNIFORM_UPDATE_MAP.value.set('_atmosphereHeight',  () => {
    const atmosHeight = LG_PLANET_DATA.value.atmosphereHeight / Globals.ATMOSPHERE_HEIGHT_DIVIDER
    setMeshUniform(atmosphere, 'u_radius', LG_PLANET_DATA.value.planetRadius + atmosHeight)
  })
  UNIFORM_UPDATE_MAP.value.set('_atmosphereDensityScale', () => setMeshUniform(atmosphere, 'u_density', LG_PLANET_DATA.value.atmosphereDensityScale / Globals.ATMOSPHERE_HEIGHT_DIVIDER))
  UNIFORM_UPDATE_MAP.value.set('_atmosphereIntensity',    () => setMeshUniform(atmosphere, 'u_intensity', LG_PLANET_DATA.value.atmosphereIntensity))
  UNIFORM_UPDATE_MAP.value.set('_atmosphereColorMode',    () => setMeshUniform(atmosphere, 'u_color_mode', LG_PLANET_DATA.value.atmosphereColorMode))
  UNIFORM_UPDATE_MAP.value.set('_atmosphereHue',          () => setMeshUniform(atmosphere, 'u_hue', LG_PLANET_DATA.value.atmosphereHue))
  UNIFORM_UPDATE_MAP.value.set('_atmosphereTint',         () => setMeshUniform(atmosphere, 'u_tint', LG_PLANET_DATA.value.atmosphereTint))
}

// prettier-ignore
function registerRingDataUpdates(ring: Mesh, ringDataTex: DataTexture): void {
  UNIFORM_UPDATE_MAP.value.set('_ringEnabled', () => ring.visible = LG_PLANET_DATA.value.ringEnabled)
  UNIFORM_UPDATE_MAP.value.set('_ringInnerRadius', () => {
    ring.geometry.dispose()
    ring.geometry = ComponentBuilder.createRingGeometryComponent(LG_PLANET_DATA.value.ringInnerRadius, LG_PLANET_DATA.value.ringOuterRadius)
    setMeshUniform(ring, 'u_inner_radius', LG_PLANET_DATA.value.ringInnerRadius)
  })
  
  UNIFORM_UPDATE_MAP.value.set('_ringOuterRadius', () => setMeshUniform(ring, 'u_outer_radius', LG_PLANET_DATA.value.ringOuterRadius))
  UNIFORM_UPDATE_MAP.value.set('_ringColorRamp', () => {
    const v = LG_PLANET_DATA.value.ringColorRamp
    recalculateRampTexture(LG_BUFFER_RING, Globals.TEXTURE_SIZES.RING, v.steps as ColorRampStep[])
    ringDataTex.needsUpdate = true
  })
}