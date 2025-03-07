import { ref, type Ref } from 'vue'
import * as Globals from '@core/globals'
import * as ComponentBuilder from '@core/three/component.builder'
import { degToRad } from 'three/src/math/MathUtils.js'
import { patchMeshUniform, setMeshUniform, setMeshUniforms } from '@/utils/three-utils'
import { recalculateBiomeTexture, recalculateRampTexture } from './texture.helper'
import type { ColorRampStep } from '../models/color-ramp.model'
import type { GenericMeshData, PlanetSceneData } from '../types'
import type { AmbientLight, DataTexture, DirectionalLight, Group, Mesh } from 'three'
import type { LensFlareEffect } from '../three/lens-flare.effect'
import type { BiomeParameters } from '../models/biome-parameters.model'
import type PlanetData from '../models/planet-data.model'

const UNIFORM_UPDATE_MAP: Ref<Map<string, () => void>> = ref(new Map<string, () => void>())

export function initUniformUpdateMap(sceneData: PlanetSceneData, planetData: PlanetData, texBufs: Uint8Array[]) {
  registerLightingDataUpdates(planetData, sceneData.sunLight!, sceneData.ambLight!, sceneData.lensFlare!)
  registerPlanetRenderingDataUpdates(planetData, sceneData.planetGroup!, sceneData.planet!, sceneData.atmosphere!, sceneData.clouds!)
  registerSurfaceDataUpdates(planetData, sceneData.planet!, sceneData.surfaceDataTex!, texBufs[0])
  registerBiomeDataUpdates(planetData, sceneData.planet!, sceneData.biomeDataTex!, texBufs[1])
  registerCloudDataUpdates(planetData, sceneData.clouds!, sceneData.cloudsDataTex!, texBufs[2])
  registerAtmosphereDataUpdates(planetData, sceneData.atmosphere!)
  registerRingsDataUpdates(planetData, sceneData.rings!)
}

export function reloadRingDataUpdates(sceneData: PlanetSceneData, planetData: PlanetData) {
  const ringKeys = [...UNIFORM_UPDATE_MAP.value.keys()].filter(k => k.startsWith('_ringsParameters'))
  ringKeys.forEach(k => {
    UNIFORM_UPDATE_MAP.value.delete(k)
  });
  registerRingsDataUpdates(planetData, sceneData.rings!)
  planetData.markForChange('_ringsParameters')
}

export function clearUniformUpdateMap() {
  UNIFORM_UPDATE_MAP.value.clear()
}

export function execUniformUpdate(key: string) {
  UNIFORM_UPDATE_MAP.value.get(key)?.()
}

// prettier-ignore
function registerLightingDataUpdates(data: PlanetData, sunLight: DirectionalLight, ambLight: AmbientLight, lensFlare: LensFlareEffect): void {
  UNIFORM_UPDATE_MAP.value.set('_lensFlareEnabled',         () => lensFlare.mesh.visible = data.lensFlareEnabled)
  UNIFORM_UPDATE_MAP.value.set('_lensFlarePointsIntensity', () => setMeshUniform(lensFlare, 'starPointsIntensity', data.lensFlarePointsIntensity))
  UNIFORM_UPDATE_MAP.value.set('_lensFlareGlareIntensity',  () => setMeshUniform(lensFlare, 'glareIntensity', data.lensFlareGlareIntensity))
  UNIFORM_UPDATE_MAP.value.set('_sunLightAngle', () => {
    const v = degToRad(isNaN(data.sunLightAngle) ? 0 : data.sunLightAngle)
    const newPos = Globals.SUN_INIT_POS.clone().applyAxisAngle(Globals.AXIS_X, v)
    sunLight.position.set(newPos.x, newPos.y, newPos.z)
  })
  UNIFORM_UPDATE_MAP.value.set('_sunLightColor', () => {
    sunLight.color.set(data.sunLightColor)
    setMeshUniform(lensFlare, 'colorGain', data.sunLightColor)
  })
  UNIFORM_UPDATE_MAP.value.set('_sunLightIntensity', () => sunLight.intensity = data.sunLightIntensity)
  UNIFORM_UPDATE_MAP.value.set('_ambLightColor',     () => ambLight.color.set(data.ambLightColor))
  UNIFORM_UPDATE_MAP.value.set('_ambLightIntensity', () => ambLight.intensity = data.ambLightIntensity)
}

// prettier-ignore
function registerPlanetRenderingDataUpdates(data: PlanetData, planetGroup: Group, planet: Mesh, atmosphere: Mesh, clouds: Mesh): void {
  UNIFORM_UPDATE_MAP.value.set('_planetRadius', () => {
    const v = data.planetRadius
    const atmosHeight = data.atmosphereHeight / Globals.ATMOSPHERE_HEIGHT_DIVIDER
    planetGroup.scale.setScalar(v)
    setMeshUniform(planet, 'u_radius', v)
    setMeshUniforms(atmosphere, ['u_surface_radius', 'u_radius'], [v, v + atmosHeight])
  })
  UNIFORM_UPDATE_MAP.value.set('_planetAxialTilt', () => {
    const v = degToRad(isNaN(data.planetAxialTilt) ? 0 : data.planetAxialTilt)
    planetGroup.setRotationFromAxisAngle(Globals.AXIS_X, v)
  })
  UNIFORM_UPDATE_MAP.value.set('_planetRotation', () => {
    const vRad = degToRad(isNaN(data.planetRotation) ? 0 : data.planetRotation)
    const cloudsRotationRad = degToRad(
      isNaN(data.cloudsRotation) ? 0 : data.cloudsRotation,
    )
    planet.setRotationFromAxisAngle(planet.up, vRad)
    clouds.setRotationFromAxisAngle(clouds.up, vRad + cloudsRotationRad)
  })
  UNIFORM_UPDATE_MAP.value.set('_planetWaterRoughness',  () => patchMeshUniform(planet, 'u_pbr_params', { wrough: data.planetWaterRoughness }))
  UNIFORM_UPDATE_MAP.value.set('_planetWaterMetalness',  () => patchMeshUniform(planet, 'u_pbr_params', { wmetal: data.planetWaterMetalness }))
  UNIFORM_UPDATE_MAP.value.set('_planetGroundRoughness', () => patchMeshUniform(planet, 'u_pbr_params', { grough: data.planetGroundRoughness }))
  UNIFORM_UPDATE_MAP.value.set('_planetGroundMetalness', () => patchMeshUniform(planet, 'u_pbr_params', { gmetal: data.planetGroundMetalness }))
  UNIFORM_UPDATE_MAP.value.set('_planetWaterLevel',      () => patchMeshUniform(planet, 'u_pbr_params', { wlevel: data.planetWaterLevel }))
}

// prettier-ignore
function registerSurfaceDataUpdates(data: PlanetData, planet: Mesh, surfaceDataTex: DataTexture, buffer: Uint8Array): void {
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceShowBumps',                () => setMeshUniform(planet,   'u_bump', data.planetSurfaceShowBumps))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceBumpStrength',             () => setMeshUniform(planet,   'u_bump_strength', data.planetSurfaceBumpStrength))
  // Warping
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceShowWarping',              () => setMeshUniform(planet,   'u_warp', data.planetSurfaceShowWarping))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceNoise._warpFactor',        () => patchMeshUniform(planet, 'u_surface_noise', {
    xwarp: data.planetSurfaceNoise.xWarpFactor,
    ywarp: data.planetSurfaceNoise.yWarpFactor,
    zwarp: data.planetSurfaceNoise.zWarpFactor
  }))
  // Displacement
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceShowDisplacement',         () => setMeshUniform(planet,   'u_displace', data.planetSurfaceShowDisplacement))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceDisplacement._factor',     () => patchMeshUniform(planet, 'u_surface_displacement', { fac: data.planetSurfaceDisplacement.factor }))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceDisplacement._epsilon',    () => patchMeshUniform(planet, 'u_surface_displacement', { eps: data.planetSurfaceDisplacement.epsilon }))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceDisplacement._multiplier', () => patchMeshUniform(planet, 'u_surface_displacement', { mul: data.planetSurfaceDisplacement.multiplier }))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceDisplacement._frequency',  () => patchMeshUniform(planet, 'u_surface_displacement', { freq: data.planetSurfaceDisplacement.frequency }))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceDisplacement._amplitude',  () => patchMeshUniform(planet, 'u_surface_displacement', { amp: data.planetSurfaceDisplacement.amplitude }))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceDisplacement._lacunarity', () => patchMeshUniform(planet, 'u_surface_displacement', { lac: data.planetSurfaceDisplacement.lacunarity }))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceDisplacement._octaves',    () => patchMeshUniform(planet, 'u_surface_displacement', { oct: data.planetSurfaceDisplacement.octaves }))
  // Noise
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceNoise._frequency',         () => patchMeshUniform(planet, 'u_surface_noise', { freq: data.planetSurfaceNoise.frequency }))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceNoise._amplitude',         () => patchMeshUniform(planet, 'u_surface_noise', { amp: data.planetSurfaceNoise.amplitude }))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceNoise._lacunarity',        () => patchMeshUniform(planet, 'u_surface_noise', { lac: data.planetSurfaceNoise.lacunarity }))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceNoise._octaves',           () => patchMeshUniform(planet, 'u_surface_noise', { oct: data.planetSurfaceNoise.octaves }))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceNoise._layers',            () => patchMeshUniform(planet, 'u_surface_noise', { layers: data.planetSurfaceNoise.layers }))
  // Color
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceColorRamp',         () => {
    const v = data.planetSurfaceColorRamp
    recalculateRampTexture(buffer, Globals.TEXTURE_SIZES.SURFACE, v.steps as ColorRampStep[])
    surfaceDataTex.needsUpdate = true
  })
}

// prettier-ignore
function registerBiomeDataUpdates(data: PlanetData, planet: Mesh, biomeDataTex: DataTexture, buffer: Uint8Array): void {
  UNIFORM_UPDATE_MAP.value.set('_biomesEnabled',                      () => setMeshUniform(planet, 'u_biomes', data.biomesEnabled))
  // Temperature
  UNIFORM_UPDATE_MAP.value.set('_biomesTemperatureMode',              () => patchMeshUniform(planet, 'u_temp_noise', { mode: data.biomesTemperatureMode }))
  UNIFORM_UPDATE_MAP.value.set('_biomesTemperatureNoise._frequency',  () => patchMeshUniform(planet, 'u_temp_noise', { freq: data.biomesTemperatureNoise.frequency }))
  UNIFORM_UPDATE_MAP.value.set('_biomesTemperatureNoise._amplitude',  () => patchMeshUniform(planet, 'u_temp_noise', { amp: data.biomesTemperatureNoise.amplitude }))
  UNIFORM_UPDATE_MAP.value.set('_biomesTemperatureNoise._lacunarity', () => patchMeshUniform(planet, 'u_temp_noise', { lac: data.biomesTemperatureNoise.lacunarity }))
  UNIFORM_UPDATE_MAP.value.set('_biomesTemperatureNoise._octaves',    () => patchMeshUniform(planet, 'u_temp_noise', { oct: data.biomesTemperatureNoise.octaves }))
  // Humidity
  UNIFORM_UPDATE_MAP.value.set('_biomesHumidityMode',                 () => patchMeshUniform(planet, 'u_humi_noise', { mode: data.biomesHumidityMode }))
  UNIFORM_UPDATE_MAP.value.set('_biomesHumidityNoise._frequency',     () => patchMeshUniform(planet, 'u_humi_noise', { freq: data.biomesHumidityNoise.frequency }))
  UNIFORM_UPDATE_MAP.value.set('_biomesHumidityNoise._amplitude',     () => patchMeshUniform(planet, 'u_humi_noise', { amp: data.biomesHumidityNoise.amplitude }))
  UNIFORM_UPDATE_MAP.value.set('_biomesHumidityNoise._lacunarity',    () => patchMeshUniform(planet, 'u_humi_noise', { lac: data.biomesHumidityNoise.lacunarity }))
  UNIFORM_UPDATE_MAP.value.set('_biomesHumidityNoise._octaves',       () => patchMeshUniform(planet, 'u_humi_noise', { oct: data.biomesHumidityNoise.octaves }))
  UNIFORM_UPDATE_MAP.value.set('_biomesParameters', () => {
    recalculateBiomeTexture(buffer, Globals.TEXTURE_SIZES.BIOME, data.biomesParams as BiomeParameters[])
    biomeDataTex.needsUpdate = true
  })
}

// prettier-ignore
function registerCloudDataUpdates(data: PlanetData, clouds: Mesh, cloudsDataTex: DataTexture, buffer: Uint8Array): void {
  UNIFORM_UPDATE_MAP.value.set('_cloudsEnabled',  () => clouds.visible = data.cloudsEnabled)
  UNIFORM_UPDATE_MAP.value.set('_cloudsRotation', () => {
    const planetRotation = degToRad(isNaN(data.planetRotation) ? 0 : data.planetRotation)
    const v = degToRad(isNaN(data.cloudsRotation) ? 0 : data.cloudsRotation)
    clouds.setRotationFromAxisAngle(clouds.up, planetRotation + v)
  })
  // Warping
  UNIFORM_UPDATE_MAP.value.set('_cloudsShowWarping',       () => setMeshUniform(clouds,   'u_warp', data.cloudsShowWarping))
  UNIFORM_UPDATE_MAP.value.set('_cloudsNoise._warpFactor', () => patchMeshUniform(clouds, 'u_noise', {
    xwarp: data.cloudsNoise.xWarpFactor,
    ywarp: data.cloudsNoise.yWarpFactor,
    zwarp: data.cloudsNoise.zWarpFactor,
  }))
  // Displacement
  UNIFORM_UPDATE_MAP.value.set('_cloudsShowDisplacement',         () => setMeshUniform(clouds,   'u_displace', data.cloudsShowDisplacement))
  UNIFORM_UPDATE_MAP.value.set('_cloudsDisplacement._factor',     () => patchMeshUniform(clouds, 'u_displacement', { fac: data.cloudsDisplacement.factor }))
  UNIFORM_UPDATE_MAP.value.set('_cloudsDisplacement._epsilon',    () => patchMeshUniform(clouds, 'u_displacement', { eps: data.cloudsDisplacement.epsilon }))
  UNIFORM_UPDATE_MAP.value.set('_cloudsDisplacement._multiplier', () => patchMeshUniform(clouds, 'u_displacement', { mul: data.cloudsDisplacement.multiplier }))
  UNIFORM_UPDATE_MAP.value.set('_cloudsDisplacement._frequency',  () => patchMeshUniform(clouds, 'u_displacement', { freq: data.cloudsDisplacement.frequency }))
  UNIFORM_UPDATE_MAP.value.set('_cloudsDisplacement._amplitude',  () => patchMeshUniform(clouds, 'u_displacement', { amp: data.cloudsDisplacement.amplitude }))
  UNIFORM_UPDATE_MAP.value.set('_cloudsDisplacement._lacunarity', () => patchMeshUniform(clouds, 'u_displacement', { lac: data.cloudsDisplacement.lacunarity }))
  UNIFORM_UPDATE_MAP.value.set('_cloudsDisplacement._octaves',    () => patchMeshUniform(clouds, 'u_displacement', { oct: data.cloudsDisplacement.octaves }))
  // Noise
  UNIFORM_UPDATE_MAP.value.set('_cloudsNoise._frequency',  () => patchMeshUniform(clouds, 'u_noise', { freq: data.cloudsNoise.frequency }))
  UNIFORM_UPDATE_MAP.value.set('_cloudsNoise._amplitude',  () => patchMeshUniform(clouds, 'u_noise', { amp: data.cloudsNoise.amplitude }))
  UNIFORM_UPDATE_MAP.value.set('_cloudsNoise._lacunarity', () => patchMeshUniform(clouds, 'u_noise', { lac: data.cloudsNoise.lacunarity }))
  UNIFORM_UPDATE_MAP.value.set('_cloudsNoise._octaves',    () => patchMeshUniform(clouds, 'u_noise', { oct: data.cloudsNoise.octaves }))
  // Color
  UNIFORM_UPDATE_MAP.value.set('_cloudsColor',             () =>  setMeshUniform(clouds, 'u_color', data.cloudsColor))
  UNIFORM_UPDATE_MAP.value.set('_cloudsColorRamp',         () =>  {
    const v = data.cloudsColorRamp
    recalculateRampTexture(buffer, Globals.TEXTURE_SIZES.CLOUDS, v.steps as ColorRampStep[])
    cloudsDataTex.needsUpdate = true
  })
}

// prettier-ignore
function registerAtmosphereDataUpdates(data: PlanetData, atmosphere: Mesh): void {
  UNIFORM_UPDATE_MAP.value.set('_atmosphereEnabled', () => atmosphere.visible = data.atmosphereEnabled)
  UNIFORM_UPDATE_MAP.value.set('_atmosphereHeight',  () => {
    const atmosHeight = data.atmosphereHeight / Globals.ATMOSPHERE_HEIGHT_DIVIDER
    setMeshUniform(atmosphere, 'u_radius', data.planetRadius + atmosHeight)
  })
  UNIFORM_UPDATE_MAP.value.set('_atmosphereDensityScale', () => setMeshUniform(atmosphere, 'u_density', data.atmosphereDensityScale / Globals.ATMOSPHERE_HEIGHT_DIVIDER))
  UNIFORM_UPDATE_MAP.value.set('_atmosphereIntensity',    () => setMeshUniform(atmosphere, 'u_intensity', data.atmosphereIntensity))
  UNIFORM_UPDATE_MAP.value.set('_atmosphereColorMode',    () => setMeshUniform(atmosphere, 'u_color_mode', data.atmosphereColorMode))
  UNIFORM_UPDATE_MAP.value.set('_atmosphereHue',          () => setMeshUniform(atmosphere, 'u_hue', data.atmosphereHue))
  UNIFORM_UPDATE_MAP.value.set('_atmosphereTint',         () => setMeshUniform(atmosphere, 'u_tint', data.atmosphereTint))
}

// prettier-ignore
function registerRingsDataUpdates(data: PlanetData, ringsData: GenericMeshData[]): void {
  UNIFORM_UPDATE_MAP.value.set('_ringsEnabled', () => ringsData.forEach(rd => rd.mesh.visible = data.ringsEnabled))

  const ringsParams = data.ringsParams
  ringsData.forEach(rd => {
    const ringParams = ringsParams.find(r => r.id === rd.mesh.name)
    if (!ringParams) return

    UNIFORM_UPDATE_MAP.value.set(`_ringsParameters.${ringParams.id}._innerRadius`, () => {
      rd.mesh.geometry.dispose()
      rd.mesh.geometry = ComponentBuilder.createRingGeometryComponent(data.planetMeshQuality, ringParams.innerRadius, ringParams.outerRadius)
      setMeshUniform(rd.mesh, 'u_inner_radius', ringParams.innerRadius)
    })
    UNIFORM_UPDATE_MAP.value.set(`_ringsParameters.${ringParams.id}._outerRadius`, () => {
      rd.mesh.geometry.dispose()
      rd.mesh.geometry = ComponentBuilder.createRingGeometryComponent(data.planetMeshQuality, ringParams.innerRadius, ringParams.outerRadius)
      setMeshUniform(rd.mesh, 'u_outer_radius', ringParams.outerRadius)
    })
    UNIFORM_UPDATE_MAP.value.set(`_ringsParameters.${ringParams.id}._colorRamp`, () => {
      const v = ringParams.colorRamp
      recalculateRampTexture(rd.buffer, Globals.TEXTURE_SIZES.RING, v.steps as ColorRampStep[])
      rd.texture.needsUpdate = true
    })
  })
}
