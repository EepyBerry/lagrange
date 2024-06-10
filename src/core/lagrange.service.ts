import * as THREE from 'three'
import fbmNoise from '@assets/glsl/functions/fbm.func.glsl?raw'
import colorUtils from '@assets/glsl/functions/color_utils.func.glsl?raw'
import bumpMap from '@assets/glsl/functions/bump_map.func.glsl?raw'
import planetFragShader from '@assets/glsl/planet.frag.glsl?raw'
import planetVertShader from '@assets/glsl/planet.vert.glsl?raw'
import cloudsFragShader from '@assets/glsl/clouds.frag.glsl?raw'
import cloudsVertShader from '@assets/glsl/clouds.vert.glsl?raw'
import { degToRad } from 'three/src/math/MathUtils.js'
import {
  LG_PARAMETERS,
  LG_NAME_CLOUDS,
  LG_NAME_PLANET,
  LG_NAME_SUN,
  LG_CLOUDS_DIVIDER,
} from '@core/globals'
import { GeometryType, type SceneElements } from '@core/types'
import { loadCubeTexture } from '@/core/three/external-data.loader'
import { createAmbientight, createGeometry, createPerspectiveCamera, createRenderer, createShaderMaterial } from '@/core/three/component.builder'

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
    50, width / height, 0.1, 1e9,
    new THREE.Spherical(
      LG_PARAMETERS.initCamDistance,
      Math.PI / 2.0,
      degToRad(LG_PARAMETERS.initCamAngle)
    )
  )
  const ambientLight = createAmbientight(0xffffff, 0.1)
  scene.add(ambientLight);

  return { scene, renderer, camera }
}

export function createSun() {
  const geometry = new THREE.IcosahedronGeometry(50, 4)
  const material = new THREE.MeshStandardMaterial( { color: 0xffffff, emissive: new THREE.Color(100, 100, 100) } )
  const sun = new THREE.PointLight(0xfff6e8, 5e8)
  sun.castShadow = true
  sun.add(new THREE.Mesh(geometry, material))
  sun.name = LG_NAME_SUN
  return sun
}

export function createPlanet(type: GeometryType)  {
  const geometry = createGeometry(type)
  const material = createShaderMaterial(
    planetVertShader,
    planetFragShader,
    [fbmNoise, colorUtils, bumpMap], {
    u_resolution:     { value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
    u_octaves:        { value: 16 },
    u_frequency:      { value: LG_PARAMETERS.planetSurfaceNoise.frequency },
    u_amplitude:      { value: LG_PARAMETERS.planetSurfaceNoise.amplitude },
    u_lacunarity:     { value: LG_PARAMETERS.planetSurfaceNoise.lacunarity },
    u_cr_colors:      { value: LG_PARAMETERS.planetSurfaceColorRamp.definedColors },
    u_cr_positions:   { value: LG_PARAMETERS.planetSurfaceColorRamp.definedFactors },
    u_cr_size:        { value: LG_PARAMETERS.planetSurfaceColorRampSize },
  }, THREE.MeshStandardMaterial)

  const mesh = new THREE.Mesh(geometry, material)
  mesh.receiveShadow = true
  mesh.name = LG_NAME_PLANET
  return mesh
}

export function createClouds(type: GeometryType) {
  const cloudHeight = (LG_PARAMETERS.cloudsHeight / LG_CLOUDS_DIVIDER)
  const geometry = createGeometry(type, cloudHeight)
  const material = createShaderMaterial(cloudsVertShader, cloudsFragShader, [fbmNoise, colorUtils], {
    u_resolution:     { value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
    u_octaves:        { value: 12 },
    //u_frequency:      { value: LG_PARAMETERS.planetSurfaceNoise.frequency },
    //u_amplitude:      { value: LG_PARAMETERS.planetSurfaceNoise.amplitude },
    //u_lacunarity:     { value: LG_PARAMETERS.planetSurfaceNoise.lacunarity },
    u_cr_colors:      { value: LG_PARAMETERS.cloudsColorRamp.definedColors },
    u_cr_positions:   { value: LG_PARAMETERS.cloudsColorRamp.definedFactors },
    u_cr_size:        { value: LG_PARAMETERS.cloudsColorRampSize },
  })
  material.transparent = true
  material.side = THREE.DoubleSide
  material.shadowSide = THREE.BackSide

  const mesh = new THREE.Mesh(geometry, material)
  mesh.receiveShadow = true
  mesh.name = LG_NAME_CLOUDS
  return mesh
}

// ----------------------------------------------------------------------------------------------------------------------
// UPDATE FUNCTIONS

export function switchPlanetMesh(scene: THREE.Scene, type: GeometryType): THREE.Mesh {
  const planet = scene.getObjectByName(LG_NAME_PLANET) as THREE.Mesh
  if (
    planet.geometry instanceof THREE.IcosahedronGeometry && type === GeometryType.ICOSPHERE
    || planet.geometry instanceof THREE.TorusGeometry && type === GeometryType.TORUS
    || planet.geometry instanceof THREE.BoxGeometry && type === GeometryType.BOX
  ) {
    return planet
  }

  (planet.material as THREE.Material).dispose()
  planet.geometry.dispose()
  scene.remove(planet)

  const newPlanet = createPlanet(type)
  scene.add(newPlanet)
  return newPlanet
}

export function forceUpdatePlanet(scene: THREE.Scene): THREE.Mesh {
  const planet = scene.getObjectByName(LG_NAME_PLANET) as THREE.Mesh
  (planet.material as THREE.Material).dispose()
  planet.geometry.dispose()
  scene.remove(planet)

  const newPlanet = createPlanet(LG_PARAMETERS.planetGeometryType)
  scene.add(newPlanet)
  return newPlanet
}

export function forceUpdateClouds(scene: THREE.Scene): THREE.Mesh {
  const clouds = scene.getObjectByName(LG_NAME_CLOUDS) as THREE.Mesh
  (clouds.material as THREE.Material).dispose()
  clouds.geometry.dispose()
  scene.remove(clouds)

  const newClouds = createClouds(LG_PARAMETERS.planetGeometryType)
  scene.add(newClouds)
  return newClouds
}