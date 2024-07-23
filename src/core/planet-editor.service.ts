import * as THREE from 'three'
import planetFragShader from '@assets/glsl/planet.frag.glsl?raw'
import planetVertShader from '@assets/glsl/planet.vert.glsl?raw'
import cloudsFragShader from '@assets/glsl/clouds.frag.glsl?raw'
import cloudsVertShader from '@assets/glsl/clouds.vert.glsl?raw'
import atmosphereFragShader from '@assets/glsl/atmosphere.frag.glsl?raw'
import atmosphereVertShader from '@assets/glsl/atmosphere.vert.glsl?raw'
import { degToRad } from 'three/src/math/MathUtils.js'
import {
  LG_NAME_CLOUDS,
  LG_NAME_PLANET,
  LG_NAME_AMBLIGHT,
  LG_NAME_ATMOSPHERE,
  LG_NAME_SUN,
} from '@core/globals'
import { GeometryType } from '@core/types'
import { loadCubeTexture } from '@core/three/external-data.loader'
import {
  createAmbientightComponent,
  createGeometryComponent,
  createPerspectiveCameraComponent,
  createRendererComponent,
  createShaderMaterialComponent,
} from '@core/three/component.builder'
import { SceneElements } from './models/scene-elements.model'
import { LensFlareEffect } from './three/lens-flare.effect'
import PlanetData from './models/planet-data.model'
import { ref } from 'vue'

// Editor constants
export const LG_PLANET_DATA = ref(new PlanetData())
export const LG_HEIGHT_DIVIDER = 200.0

// ----------------------------------------------------------------------------------------------------------------------
// SCENE FUNCTIONS

export function createScene(data: PlanetData, width: number, height: number, pixelRatio: number): SceneElements {
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
  const renderer = createRendererComponent(width, height, pixelRatio)
  const camera = createPerspectiveCameraComponent(
    50,
    width / height,
    0.1,
    1e6,
    new THREE.Spherical(data.initCamDistance, Math.PI / 2.0, degToRad(data.initCamAngle)),
  )
  const ambientLight = createAmbientightComponent(data.ambLightColor, data.ambLightIntensity)
  ambientLight.name = LG_NAME_AMBLIGHT
  scene.add(ambientLight)

  return new SceneElements(scene, renderer, camera)
}

export function createSun(data: PlanetData) {
  const sun = new THREE.DirectionalLight(data.sunLightColor, data.sunLightIntensity)
  sun.frustumCulled = false
  sun.userData.lens = 'no-occlusion'
  sun.name = LG_NAME_SUN
  return sun
}

export function createLensFlare(data: PlanetData, pos: THREE.Vector3, color: THREE.Color) {
  return new LensFlareEffect({
    opacity: 1,
    lensPosition: pos,
    colorGain: color,
    starPointsIntensity: data.lensFlarePointsIntensity,
    glareIntensity: data.lensFlareGlareIntensity,
  })
}

export function createPlanet(data: PlanetData): THREE.Mesh {
  const geometry = createGeometryComponent(GeometryType.SPHERE)
  geometry.computeTangents()

  const material = createShaderMaterialComponent(
    planetVertShader,
    planetFragShader,
    {
      u_radius: { value: data.initPlanetRadius },
      u_octaves: { value: 6 },
      u_frequency: { value: data.planetSurfaceNoise.frequency },
      u_amplitude: { value: data.planetSurfaceNoise.amplitude },
      u_lacunarity: { value: data.planetSurfaceNoise.lacunarity },
      u_water_roughness: { value: data.planetWaterRoughness },
      u_water_metalness: { value: data.planetWaterMetalness },
      u_ground_roughness: { value: data.planetGroundRoughness },
      u_ground_metalness: { value: data.planetGroundMetalness },
      u_water_level: { value: data.planetWaterLevel },
      u_bump: { value: data.planetSurfaceShowBumps },
      u_bump_strength: { value: data.planetSurfaceBumpStrength },
      u_bump_offset: { value: 0.005 },
      u_biomes: { value: data.biomesEnabled },
      u_show_poles: { value: data.biomePolesEnabled },
      u_pole_limit: { value: 0.8 },
      u_cr_colors: { value: data.planetSurfaceColorRamp.colors },
      u_cr_positions: { value: data.planetSurfaceColorRamp.factors },
      u_cr_size: { value: data.planetSurfaceColorRampSize },
    },
    THREE.MeshStandardMaterial,
  )

  const mesh = new THREE.Mesh(geometry, material)
  mesh.receiveShadow = true
  mesh.name = LG_NAME_PLANET
  return mesh
}

export function createClouds(data: PlanetData): THREE.Mesh {
  const cloudHeight = data.cloudsHeight / LG_HEIGHT_DIVIDER
  const geometry = createGeometryComponent(GeometryType.SPHERE, cloudHeight)
  const material = createShaderMaterialComponent(
    cloudsVertShader,
    cloudsFragShader,
    {
      u_octaves: { value: 4 },
      u_frequency: { value: data.cloudsNoise.frequency },
      u_amplitude: { value: data.cloudsNoise.amplitude },
      u_lacunarity: { value: data.cloudsNoise.lacunarity },
      u_color: { value: data.cloudsColor },
      u_cr_colors: { value: data.cloudsColorRamp.colors },
      u_cr_positions: { value: data.cloudsColorRamp.factors },
      u_cr_size: { value: data.cloudsColorRampSize },
    },
    THREE.MeshStandardMaterial,
  )
  material.transparent = true
  material.shadowSide = THREE.DoubleSide

  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = LG_NAME_CLOUDS
  mesh.receiveShadow = true
  mesh.castShadow = true
  return mesh
}

export function createAtmosphere(data: PlanetData, sunPos: THREE.Vector3): THREE.Mesh {
  const atmosHeight = data.atmosphereHeight / LG_HEIGHT_DIVIDER
  const atmosDensity = data.atmosphereDensityScale / LG_HEIGHT_DIVIDER
  const geometry = createGeometryComponent(GeometryType.SPHERE, atmosHeight)
  const material = createShaderMaterialComponent(
    atmosphereVertShader,
    atmosphereFragShader,
    {
      u_light_position: { value: sunPos },
      u_light_intensity: { value: data.sunLightIntensity },
      u_surface_radius: { value: data.initPlanetRadius },
      u_radius: { value: data.initPlanetRadius + atmosHeight },
      u_density: { value: atmosDensity },
      u_hue: { value: data.atmosphereHue },
      u_intensity: { value: data.atmosphereIntensity },
    },
    THREE.ShaderMaterial,
  )
  material.transparent = true

  const mesh = new THREE.Mesh(geometry, material)
  mesh.userData.lens = 'no-occlusion'
  mesh.name = LG_NAME_ATMOSPHERE
  return mesh
}
