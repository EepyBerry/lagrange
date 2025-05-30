import { ref, type Ref } from 'vue'
import * as Globals from '@core/globals'
import { degToRad } from 'three/src/math/MathUtils.js'
import type { PlanetMeshData, EditorSceneData, AtmosphereMeshData, CloudsMeshData, RingMeshData } from '../types'
import type { AmbientLight, DirectionalLight, Group } from 'three'
import type { LensFlareEffect } from '../three/lens-flare.effect'
import type PlanetData from '../models/planet-data.model'
import { recalculateBiomeTexture, recalculateRampTexture } from './texture.helper'
import * as ComponentBuilder from '../three/component.builder'

const UNIFORM_UPDATE_MAP: Ref<Map<string, () => void>> = ref(new Map<string, () => void>())

export function initUniformUpdateMap(sceneData: EditorSceneData, planetData: PlanetData) {
  registerLightingDataUpdates(planetData, sceneData.sunLight!, sceneData.ambLight!, sceneData.lensFlare!)
  registerPlanetRenderingDataUpdates(
    planetData,
    sceneData.planetGroup!,
    sceneData.planet!,
    sceneData.atmosphere!,
    sceneData.clouds!,
  )
  registerSurfaceDataUpdates(planetData, sceneData.planet!)
  registerBiomeDataUpdates(planetData, sceneData.planet!)
  registerAtmosphereDataUpdates(planetData, sceneData.atmosphere!)
  registerCloudDataUpdates(planetData, sceneData.clouds!)
  registerRingsDataUpdates(planetData, sceneData.rings!)
}

export function reloadRingDataUpdates(sceneData: EditorSceneData, planetData: PlanetData) {
  const ringKeys = [...UNIFORM_UPDATE_MAP.value.keys()].filter((k) => k.startsWith('_ringsParameters'))
  ringKeys.forEach((k) => {
    UNIFORM_UPDATE_MAP.value.delete(k)
  })
  registerRingsDataUpdates(planetData, sceneData.rings!)
}

export function clearUniformUpdateMap() {
  UNIFORM_UPDATE_MAP.value.clear()
}

export function execUniformUpdate(key: string) {
  UNIFORM_UPDATE_MAP.value.get(key)?.()
}

// prettier-ignore
function registerLightingDataUpdates(data: PlanetData, sunLight: DirectionalLight, ambLight: AmbientLight, lensFlare: LensFlareEffect): void {
  /* UNIFORM_UPDATE_MAP.value.set('_lensFlareEnabled',         () => lensFlare.mesh.visible = data.lensFlareEnabled)
  UNIFORM_UPDATE_MAP.value.set('_lensFlarePointsIntensity', () => setMeshUniform(lensFlare, 'starPointsIntensity', data.lensFlarePointsIntensity))
  UNIFORM_UPDATE_MAP.value.set('_lensFlareGlareIntensity',  () => setMeshUniform(lensFlare, 'glareIntensity', data.lensFlareGlareIntensity))
   */
  UNIFORM_UPDATE_MAP.value.set('_sunLightAngle', () => {
    const v = degToRad(isNaN(data.sunLightAngle) ? 0 : data.sunLightAngle)
    const newPos = Globals.SUN_INIT_POS.clone().applyAxisAngle(Globals.AXIS_X, v)
    sunLight.position.set(newPos.x, newPos.y, newPos.z)
  })
  /* UNIFORM_UPDATE_MAP.value.set('_sunLightColor', () => {
    sunLight.color.set(data.sunLightColor)
    setMeshUniform(lensFlare, 'colorGain', data.sunLightColor)
  }) */
  UNIFORM_UPDATE_MAP.value.set('_sunLightIntensity', () => sunLight.intensity = data.sunLightIntensity)
  UNIFORM_UPDATE_MAP.value.set('_ambLightColor',     () => ambLight.color.set(data.ambLightColor))
  UNIFORM_UPDATE_MAP.value.set('_ambLightIntensity', () => ambLight.intensity = data.ambLightIntensity)
}

// prettier-ignore
function registerPlanetRenderingDataUpdates(
  data: PlanetData,
  planetGroup: Group,
  planet: PlanetMeshData,
  atmosphere: AtmosphereMeshData,
  clouds: CloudsMeshData,
): void {
  UNIFORM_UPDATE_MAP.value.set('_planetRadius', () => {
    const v = data.planetRadius
    planetGroup.scale.setScalar(v)
    planet.uniforms!.radius.value = v
    atmosphere.uniforms!.transform.surfaceRadius.value = v
    atmosphere.uniforms!.transform.radius.value = v + (data.atmosphereHeight / Globals.ATMOSPHERE_HEIGHT_DIVIDER)
  })
  UNIFORM_UPDATE_MAP.value.set('_planetAxialTilt', () => {
    const v = degToRad(isNaN(data.planetAxialTilt) ? 0 : data.planetAxialTilt)
    planetGroup.setRotationFromAxisAngle(Globals.AXIS_X, v)
  })
  UNIFORM_UPDATE_MAP.value.set('_planetRotation', () => {
    const vRad = degToRad(isNaN(data.planetRotation) ? 0 : data.planetRotation)
    const cloudsRotationRad = degToRad(isNaN(data.cloudsRotation) ? 0 : data.cloudsRotation)
    planet.mesh!.setRotationFromAxisAngle(planet.mesh!.up, vRad)
    clouds.mesh!.setRotationFromAxisAngle(clouds.mesh!.up, vRad + cloudsRotationRad)
  })
  UNIFORM_UPDATE_MAP.value.set('_planetWaterLevel', () => (planet.uniforms!.pbr.array[0] = data.planetWaterLevel))
  UNIFORM_UPDATE_MAP.value.set('_planetWaterRoughness', () => (planet.uniforms!.pbr.array[1] = data.planetWaterRoughness))
  UNIFORM_UPDATE_MAP.value.set('_planetWaterMetalness', () => (planet.uniforms!.pbr.array[2] = data.planetWaterMetalness))
  UNIFORM_UPDATE_MAP.value.set('_planetGroundRoughness', () => (planet.uniforms!.pbr.array[3] = data.planetGroundRoughness))
  UNIFORM_UPDATE_MAP.value.set('_planetGroundMetalness', () => (planet.uniforms!.pbr.array[4] = data.planetGroundMetalness))
}

// prettier-ignore
function registerSurfaceDataUpdates(data: PlanetData, planet: PlanetMeshData): void {
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceShowBumps',                () => (planet.uniforms!.flags.array[2] = +data.planetSurfaceShowBumps))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceBumpStrength',             () => (planet.uniforms!.bumpStrength.value = data.planetSurfaceBumpStrength))
  // Color
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceColorRamp', () => {
    const v = data.planetSurfaceColorRamp
    recalculateRampTexture(planet.surfaceBuffer, Globals.TEXTURE_SIZES.SURFACE, v.steps)
    planet.surfaceTexture!.needsUpdate = true
  })

  // Warping
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceShowWarping', () => (planet.uniforms!.flags.array[0] = +data.planetSurfaceShowWarping))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceNoise._warpFactor', () => {
    planet.uniforms!.warping.value.y = data.planetSurfaceNoise.xWarpFactor
    planet.uniforms!.warping.value.z = data.planetSurfaceNoise.yWarpFactor
    planet.uniforms!.warping.value.w = data.planetSurfaceNoise.zWarpFactor
  })

  // Displacement
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceShowDisplacement',         () => (planet.uniforms!.flags.array[1] = +data.planetSurfaceShowDisplacement))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceDisplacement._factor',     () => (planet.uniforms!.displacement.params.value.x = data.planetSurfaceDisplacement.factor))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceDisplacement._epsilon',    () => (planet.uniforms!.displacement.params.value.y = data.planetSurfaceDisplacement.epsilon))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceDisplacement._multiplier', () => (planet.uniforms!.displacement.params.value.z = data.planetSurfaceDisplacement.multiplier))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceDisplacement._frequency',  () => (planet.uniforms!.displacement.noise.value.x = data.planetSurfaceDisplacement.frequency))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceDisplacement._amplitude',  () => (planet.uniforms!.displacement.noise.value.y = data.planetSurfaceDisplacement.amplitude))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceDisplacement._lacunarity', () => (planet.uniforms!.displacement.noise.value.z = data.planetSurfaceDisplacement.lacunarity))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceDisplacement._octaves',    () => (planet.uniforms!.displacement.noise.value.w = data.planetSurfaceDisplacement.octaves))

  // Noise
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceNoise._layers',     () => (planet.uniforms!.warping.value.x = data.planetSurfaceNoise.layers))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceNoise._frequency',  () => (planet.uniforms!.noise.value.x = data.planetSurfaceNoise.frequency),)
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceNoise._amplitude',  () => (planet.uniforms!.noise.value.y = data.planetSurfaceNoise.amplitude))
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceNoise._lacunarity', () => (planet.uniforms!.noise.value.z = data.planetSurfaceNoise.lacunarity),)
  UNIFORM_UPDATE_MAP.value.set('_planetSurfaceNoise._octaves',    () => (planet.uniforms!.noise.value.w = data.planetSurfaceNoise.octaves),)
}

// prettier-ignore
function registerBiomeDataUpdates(data: PlanetData, planet: PlanetMeshData): void {
  UNIFORM_UPDATE_MAP.value.set('_biomesEnabled',                      () => (planet.uniforms!.flags.array[3] = +data.biomesEnabled))
  // Temperature
  UNIFORM_UPDATE_MAP.value.set('_biomesTemperatureMode',              () => (planet.uniforms!.biomes.temperatureMode.value = data.biomesTemperatureMode))
  UNIFORM_UPDATE_MAP.value.set('_biomesTemperatureNoise._frequency',  () => (planet.uniforms!.biomes.temperatureNoise.value.x = data.biomesTemperatureNoise.frequency))
  UNIFORM_UPDATE_MAP.value.set('_biomesTemperatureNoise._amplitude',  () => (planet.uniforms!.biomes.temperatureNoise.value.y = data.biomesTemperatureNoise.amplitude))
  UNIFORM_UPDATE_MAP.value.set('_biomesTemperatureNoise._lacunarity', () => (planet.uniforms!.biomes.temperatureNoise.value.z = data.biomesTemperatureNoise.lacunarity))
  UNIFORM_UPDATE_MAP.value.set('_biomesTemperatureNoise._octaves',    () => (planet.uniforms!.biomes.temperatureNoise.value.w = data.biomesTemperatureNoise.octaves))
  // Humidity
  UNIFORM_UPDATE_MAP.value.set('_biomesHumidityMode',                 () => (planet.uniforms!.biomes.humidityMode.value = data.biomesHumidityMode))
  UNIFORM_UPDATE_MAP.value.set('_biomesHumidityNoise._frequency',     () => (planet.uniforms!.biomes.humidityNoise.value.x = data.biomesHumidityNoise.frequency))
  UNIFORM_UPDATE_MAP.value.set('_biomesHumidityNoise._amplitude',     () => (planet.uniforms!.biomes.humidityNoise.value.y = data.biomesHumidityNoise.amplitude))
  UNIFORM_UPDATE_MAP.value.set('_biomesHumidityNoise._lacunarity',    () => (planet.uniforms!.biomes.humidityNoise.value.z = data.biomesHumidityNoise.lacunarity))
  UNIFORM_UPDATE_MAP.value.set('_biomesHumidityNoise._octaves',       () => (planet.uniforms!.biomes.humidityNoise.value.w = data.biomesHumidityNoise.octaves))
  UNIFORM_UPDATE_MAP.value.set('_biomesParameters', () => {
    recalculateBiomeTexture(planet.biomesBuffer!, Globals.TEXTURE_SIZES.BIOME, data.biomesParams)
    planet.biomesTexture!.needsUpdate = true
  })
}

// prettier-ignore
function registerCloudDataUpdates(data: PlanetData, clouds: CloudsMeshData): void {
  UNIFORM_UPDATE_MAP.value.set('_cloudsEnabled',  () => clouds.mesh!.visible = data.cloudsEnabled)
  UNIFORM_UPDATE_MAP.value.set('_cloudsRotation', () => {
    const planetRotation = degToRad(isNaN(data.planetRotation) ? 0 : data.planetRotation)
    const v = degToRad(isNaN(data.cloudsRotation) ? 0 : data.cloudsRotation)
    clouds.mesh!.setRotationFromAxisAngle(clouds.mesh!.up, planetRotation + v)
  })
  // Warping
  UNIFORM_UPDATE_MAP.value.set('_cloudsShowWarping',       () => clouds.uniforms!.flags.array[0] = +data.cloudsShowWarping)
  UNIFORM_UPDATE_MAP.value.set('_cloudsNoise._warpFactor', () => {
    clouds.uniforms!.warping.value.y = data.cloudsNoise.xWarpFactor
    clouds.uniforms!.warping.value.z = data.cloudsNoise.yWarpFactor
    clouds.uniforms!.warping.value.w = data.cloudsNoise.zWarpFactor
  })
  // Displacement
  UNIFORM_UPDATE_MAP.value.set('_cloudsShowDisplacement',       () => (clouds.uniforms!.flags.array[1] = +data.cloudsShowDisplacement))
  UNIFORM_UPDATE_MAP.value.set('_cloudsDisplacement._factor',     () => (clouds.uniforms!.displacement.params.value.x = data.cloudsDisplacement.factor))
  UNIFORM_UPDATE_MAP.value.set('_cloudsDisplacement._epsilon',    () => (clouds.uniforms!.displacement.params.value.y = data.cloudsDisplacement.epsilon))
  UNIFORM_UPDATE_MAP.value.set('_cloudsDisplacement._multiplier', () => (clouds.uniforms!.displacement.params.value.z = data.cloudsDisplacement.multiplier))
  UNIFORM_UPDATE_MAP.value.set('_cloudsDisplacement._frequency',  () => (clouds.uniforms!.displacement.noise.value.x = data.cloudsDisplacement.frequency))
  UNIFORM_UPDATE_MAP.value.set('_cloudsDisplacement._amplitude',  () => (clouds.uniforms!.displacement.noise.value.y = data.cloudsDisplacement.amplitude))
  UNIFORM_UPDATE_MAP.value.set('_cloudsDisplacement._lacunarity', () => (clouds.uniforms!.displacement.noise.value.z = data.cloudsDisplacement.lacunarity))
  UNIFORM_UPDATE_MAP.value.set('_cloudsDisplacement._octaves',    () => (clouds.uniforms!.displacement.noise.value.w = data.cloudsDisplacement.octaves))
  // Noise
  UNIFORM_UPDATE_MAP.value.set('_cloudsNoise._frequency',  () => (clouds.uniforms!.noise.value.x = data.cloudsNoise.frequency),)
  UNIFORM_UPDATE_MAP.value.set('_cloudsNoise._amplitude',  () => (clouds.uniforms!.noise.value.y = data.cloudsNoise.amplitude))
  UNIFORM_UPDATE_MAP.value.set('_cloudsNoise._lacunarity', () => (clouds.uniforms!.noise.value.z = data.cloudsNoise.lacunarity),)
  UNIFORM_UPDATE_MAP.value.set('_cloudsNoise._octaves',    () => (clouds.uniforms!.noise.value.w = data.cloudsNoise.octaves),)
  // Color
  UNIFORM_UPDATE_MAP.value.set('_cloudsColor',             () =>  clouds.uniforms!.color.value = data.cloudsColor)
  UNIFORM_UPDATE_MAP.value.set('_cloudsColorRamp',         () =>  {
    const v = data.cloudsColorRamp
    recalculateRampTexture(clouds.buffer!, Globals.TEXTURE_SIZES.CLOUDS, v.steps)
    clouds.texture!.needsUpdate = true
  })
}

// prettier-ignore
function registerAtmosphereDataUpdates(data: PlanetData, atmosphere: AtmosphereMeshData): void {
  UNIFORM_UPDATE_MAP.value.set('_atmosphereEnabled', () => atmosphere.mesh!.visible = data.atmosphereEnabled)
  UNIFORM_UPDATE_MAP.value.set('_atmosphereHeight',  () => {
    const atmosHeight = data.atmosphereHeight / Globals.ATMOSPHERE_HEIGHT_DIVIDER
    atmosphere.uniforms!.transform.radius.value = data.planetRadius + atmosHeight
  })
  UNIFORM_UPDATE_MAP.value.set('_atmosphereDensityScale', () =>  atmosphere.uniforms!.render.density.value = data.atmosphereDensityScale / Globals.ATMOSPHERE_HEIGHT_DIVIDER)
  UNIFORM_UPDATE_MAP.value.set('_atmosphereIntensity',    () =>  atmosphere.uniforms!.render.intensity.value = data.atmosphereIntensity)
  UNIFORM_UPDATE_MAP.value.set('_atmosphereColorMode',    () =>  atmosphere.uniforms!.render.colorMode.value = data.atmosphereColorMode)
  UNIFORM_UPDATE_MAP.value.set('_atmosphereHue',          () =>  atmosphere.uniforms!.render.hue.value = data.atmosphereHue)
  UNIFORM_UPDATE_MAP.value.set('_atmosphereTint',         () =>  atmosphere.uniforms!.render.tint.value = data.atmosphereTint)
}

// prettier-ignore
function registerRingsDataUpdates(data: PlanetData, ringsData: RingMeshData[]): void {
  UNIFORM_UPDATE_MAP.value.set('_ringsEnabled', () => ringsData.forEach(rd => rd.mesh!.visible = data.ringsEnabled))

  const ringsParams = data.ringsParams
  ringsData.forEach(rd => {
    const ringParams = ringsParams.find(r => r.id === rd.mesh!.name)
    if (!ringParams) return

    UNIFORM_UPDATE_MAP.value.set(`_ringsParameters.${ringParams.id}._innerRadius`, () => {
      rd.mesh!.geometry.dispose()
      rd.mesh!.geometry = ComponentBuilder.createRingGeometryComponent(data.planetMeshQuality, ringParams.innerRadius, ringParams.outerRadius)
      rd.uniforms!.innerRadius.value = ringParams.innerRadius
    })
    UNIFORM_UPDATE_MAP.value.set(`_ringsParameters.${ringParams.id}._outerRadius`, () => {
      rd.mesh!.geometry.dispose()
      rd.mesh!.geometry = ComponentBuilder.createRingGeometryComponent(data.planetMeshQuality, ringParams.innerRadius, ringParams.outerRadius)
      rd.uniforms!.outerRadius.value = ringParams.outerRadius
    })
    UNIFORM_UPDATE_MAP.value.set(`_ringsParameters.${ringParams.id}._colorRamp`, () => {
      const v = ringParams.colorRamp
      recalculateRampTexture(rd.buffer!, Globals.TEXTURE_SIZES.RING, v.steps)
      rd.texture!.needsUpdate = true
    })
  })
}
