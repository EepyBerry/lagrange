import * as THREE from 'three'
import planetFragShader from '@assets/glsl/planet.frag.glsl?raw'
import planetVertShader from '@assets/glsl/planet.vert.glsl?raw'
import cloudsFragShader from '@assets/glsl/clouds.frag.glsl?raw'
import cloudsVertShader from '@assets/glsl/clouds.vert.glsl?raw'
import atmosphereFragShader from '@assets/glsl/atmosphere.frag.glsl?raw'
import atmosphereVertShader from '@assets/glsl/atmosphere.vert.glsl?raw'
import { degToRad } from 'three/src/math/MathUtils.js'
import {
  LG_PARAMETERS,
  LG_NAME_CLOUDS,
  LG_NAME_PLANET,
  LG_HEIGHT_DIVIDER,
  LG_NAME_AMBLIGHT,
  LG_NAME_ATMOSPHERE,
  LG_NAME_SUN,
} from '@core/globals'
import { GeometryType } from '@core/types'
import { loadCubeTexture } from '@/core/three/external-data.loader'
import { createAmbientight, createGeometry, createPerspectiveCamera, createRenderer, createShaderMaterial } from '@/core/three/component.builder'
import { SceneElements } from './models/scene-elements.model'
import { LensFlareEffect } from './three/lens-flare.effect'

// ----------------------------------------------------------------------------------------------------------------------
// SCENE FUNCTIONS

export function createScene(width: number, height: number, pixelRatio: number): SceneElements
{
  // setup cubemap
  const scene = new THREE.Scene()
  scene.background = loadCubeTexture('/skybox/', [
    'space_ft.png',
    'space_bk.png',
    'space_up.png',
    'space_dn.png',
    'space_rt.png',
    'space_lf.png',
  ])

  // setup scene (renderer, cam, lighting)
  const renderer = createRenderer(width, height, pixelRatio)
  const camera = createPerspectiveCamera(
    50, width / height, 0.1, 1e6,
    new THREE.Spherical(
      LG_PARAMETERS.initCamDistance,
      Math.PI / 2.0,
      degToRad(LG_PARAMETERS.initCamAngle)
    )
  )
  const ambientLight = createAmbientight(
    LG_PARAMETERS.ambLightColor,
    LG_PARAMETERS.ambLightIntensity
  )
  ambientLight.name = LG_NAME_AMBLIGHT
  scene.add(ambientLight)

  return new SceneElements(scene, renderer, camera)
}

export function createSun() {
  const sun = new THREE.DirectionalLight(
    LG_PARAMETERS.sunLightColor, 
    LG_PARAMETERS.sunLightIntensity
  )
  sun.position.set(0, 2e3, 4e3)
  sun.userData.lens = 'no-occlusion'
  sun.name = LG_NAME_SUN
  return sun
}

export function createLensFlare(sun: THREE.DirectionalLight) {
  return new LensFlareEffect({
    opacity: 1,
    lensPosition: sun.position,
    colorGain: sun.color,
    glareIntensity: LG_PARAMETERS.lensFlareGlareIntensity
  })
}

export function createPlanet(type: GeometryType): THREE.Mesh {
  const geometry = createGeometry(type)
  geometry.computeTangents()

  const material = createShaderMaterial(planetVertShader, planetFragShader, {
    u_resolution:           { value: new THREE.Vector2(256, 256)},
    u_radius:               { value: LG_PARAMETERS.initPlanetRadius },
    u_octaves:              { value: 8 },
    u_frequency:            { value: LG_PARAMETERS.planetSurfaceNoise.frequency },
    u_amplitude:            { value: LG_PARAMETERS.planetSurfaceNoise.amplitude },
    u_lacunarity:           { value: LG_PARAMETERS.planetSurfaceNoise.lacunarity },
    u_water_roughness:      { value: LG_PARAMETERS.planetWaterRoughness },
    u_water_metalness:      { value: LG_PARAMETERS.planetWaterMetalness },
    u_ground_roughness:     { value: LG_PARAMETERS.planetGroundRoughness },
    u_ground_metalness:     { value: LG_PARAMETERS.planetGroundMetalness },
    u_water_level:          { value: LG_PARAMETERS.planetWaterLevel },
    u_bump:                 { value: LG_PARAMETERS.planetSurfaceShowBumps },
    u_bump_strength:        { value: LG_PARAMETERS.planetSurfaceBumpStrength },
    u_bump_offset:          { value: 0.005 },
    u_biomes:               { value: LG_PARAMETERS.biomesEnabled },
    u_show_poles:           { value: LG_PARAMETERS.biomePolesEnabled },
    u_pole_limit:           { value: 0.8 },
    u_cr_colors:            { value: LG_PARAMETERS.planetSurfaceColorRamp.colors },
    u_cr_positions:         { value: LG_PARAMETERS.planetSurfaceColorRamp.factors },
    u_cr_size:              { value: LG_PARAMETERS.planetSurfaceColorRampSize },
  }, THREE.MeshStandardMaterial)

  const mesh = new THREE.Mesh(geometry, material)
  mesh.receiveShadow = true
  mesh.name = LG_NAME_PLANET
  return mesh
}

export function createClouds(type: GeometryType): THREE.Mesh {
  const cloudHeight = (LG_PARAMETERS.cloudsHeight / LG_HEIGHT_DIVIDER)
  const geometry = createGeometry(type, cloudHeight)
  const material = createShaderMaterial(cloudsVertShader, cloudsFragShader, {
    u_resolution:     { value: new THREE.Vector2(256, 256) },
    u_octaves:        { value: 8 },
    u_frequency:      { value: LG_PARAMETERS.cloudsNoise.frequency },
    u_amplitude:      { value: LG_PARAMETERS.cloudsNoise.amplitude },
    u_lacunarity:     { value: LG_PARAMETERS.cloudsNoise.lacunarity },
    u_color:          { value: LG_PARAMETERS.cloudsColor },
    u_cr_colors:      { value: LG_PARAMETERS.cloudsColorRamp.colors },
    u_cr_positions:   { value: LG_PARAMETERS.cloudsColorRamp.factors },
    u_cr_size:        { value: LG_PARAMETERS.cloudsColorRampSize },
  }, THREE.MeshStandardMaterial)
  material.transparent = true
  material.shadowSide = THREE.DoubleSide

  const mesh = new THREE.Mesh(geometry, material)
  mesh.userData.lens = 'no-occlusion';
  mesh.name = LG_NAME_CLOUDS
  mesh.receiveShadow = true
  mesh.castShadow = true
  return mesh
}

export function createAtmosphere(type: GeometryType, sunPos: THREE.Vector3): THREE.Mesh {
  const atmosHeight = (LG_PARAMETERS.atmosphereHeight / LG_HEIGHT_DIVIDER)
  const atmosDensity = (LG_PARAMETERS.atmosphereDensityScale / LG_HEIGHT_DIVIDER)
  const geometry = createGeometry(type, atmosHeight)
  const material = createShaderMaterial(atmosphereVertShader, atmosphereFragShader, {
    u_light_position:   { value: sunPos },
    u_light_intensity:  { value: LG_PARAMETERS.sunLightIntensity },
    u_surface_radius:   { value: LG_PARAMETERS.initPlanetRadius },
    u_radius:           { value: LG_PARAMETERS.initPlanetRadius + atmosHeight },
    u_density:          { value: atmosDensity },
    u_hue:              { value: LG_PARAMETERS.atmosphereHue },
    u_intensity:        { value: LG_PARAMETERS.atmosphereIntensity }
  }, THREE.ShaderMaterial)
  material.transparent = true

  const mesh = new THREE.Mesh(geometry, material)
  mesh.userData.lens = 'no-occlusion';
  mesh.name = LG_NAME_ATMOSPHERE
  return mesh
}
