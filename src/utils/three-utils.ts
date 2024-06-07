import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import { TGALoader } from 'three/addons/loaders/TGALoader.js'

import fbmNoise from '@assets/glsl/functions/fbm.func.glsl?raw'
import colorUtils from '@assets/glsl/functions/color_utils.func.glsl?raw'
import planetFragShader from '@assets/glsl/planet.frag.glsl?raw'
import planetVertShader from '@assets/glsl/planet.vert.glsl?raw'
import cloudsFragShader from '@assets/glsl/clouds.frag.glsl?raw'
import cloudsVertShader from '@assets/glsl/clouds.vert.glsl?raw'
import { degToRad } from 'three/src/math/MathUtils.js'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import { LG_PARAMETERS, LG_NAME_CLOUDS, LG_NAME_PLANET, LG_NAME_SUN, LG_CLOUDS_DIVIDER, LG_CLOUDS_SHADOW_HEIGHT } from '@core/globals'
import { GeometryType, type SceneElements } from '@core/types'
import type { ColorRampStep } from '@core/models/color-ramp.model'

const CUBE_TEXTURE_LOADER = new THREE.CubeTextureLoader()
const TEXTURE_LOADER = new THREE.TextureLoader()
const TGA_LOADER = new TGALoader()

// ----------------------------------------------------------------------------------------------------------------------
// SCENE FUNCTIONS

export function createScene(width: number, height: number): SceneElements
{
  // setup scene
  const scene = new THREE.Scene()
  const cubemap: THREE.CubeTexture = CUBE_TEXTURE_LOADER.setPath('/skybox/').load([
    'space_ft.png',
    'space_bk.png',
    'space_up.png',
    'space_dn.png',
    'space_rt.png',
    'space_lf.png',
  ])
  cubemap.minFilter = THREE.NearestFilter
  scene.background = cubemap

  // setup renderer
  const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } )
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(width, height)
  renderer.setClearColor(0x0, 0)
  renderer.setClearAlpha(0)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.autoUpdate = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // setup camera
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1e9)
  const planetOrbit = new THREE.Spherical(
    LG_PARAMETERS.initCamDistance,
    Math.PI / 2.0,
    degToRad(LG_PARAMETERS.initCamAngle)
  );
  planetOrbit.makeSafe();
  camera.position.setFromSpherical(planetOrbit);

  // Setup ambient light
  const light = new THREE.AmbientLight(0xffffff); // soft white light
  light.intensity = 0.125
  scene.add(light);

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
  let geometry = undefined
  switch (type) {
    case GeometryType.ICOSPHERE:
      geometry = new THREE.IcosahedronGeometry(
        LG_PARAMETERS.initPlanetRadius,
        LG_PARAMETERS.planetMeshQuality,
      )
      break;
    case GeometryType.TORUS:
      geometry = new THREE.TorusGeometry(
        LG_PARAMETERS.initPlanetRadius,
        LG_PARAMETERS.initPlanetRadius / 2.0,
        LG_PARAMETERS.planetMeshQuality * 2.0,
        LG_PARAMETERS.planetMeshQuality * 4.0,
      )
      break;
    case GeometryType.BOX:
      geometry = new THREE.BoxGeometry(
        LG_PARAMETERS.initPlanetRadius * 1.5,
        LG_PARAMETERS.initPlanetRadius * 1.5,
        LG_PARAMETERS.initPlanetRadius * 1.5,
      )
      break;
  }

  const material = createShaderMaterial(planetVertShader, planetFragShader, [fbmNoise, colorUtils], {
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
    u_octaves: { value: 16 },
    u_cr_colors: { value: LG_PARAMETERS.planetSurfaceColorRamp.definedColors },
    u_cr_positions: { value: LG_PARAMETERS.planetSurfaceColorRamp.definedFactors },
    u_cr_size: { value: LG_PARAMETERS.planetSurfaceColorRampSize },
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.receiveShadow = true
  mesh.name = LG_NAME_PLANET
  return mesh
}

export function createClouds(type: GeometryType) {
  let geometry = undefined
  const cloudHeight = (LG_PARAMETERS.cloudsHeight / LG_CLOUDS_DIVIDER)
  switch (type) {
    case GeometryType.ICOSPHERE:
      geometry = new THREE.IcosahedronGeometry(
        LG_PARAMETERS.initPlanetRadius + cloudHeight,
        LG_PARAMETERS.planetMeshQuality,
      )
      break;
    case GeometryType.TORUS:
      geometry = new THREE.TorusGeometry(
        LG_PARAMETERS.initPlanetRadius + (cloudHeight / 4.0),
        (LG_PARAMETERS.initPlanetRadius / 2.0) + (cloudHeight * 2.0),
        LG_PARAMETERS.planetMeshQuality * 2.0,
        LG_PARAMETERS.planetMeshQuality * 4.0,
      )
      break;
    case GeometryType.BOX:
      geometry = new THREE.BoxGeometry(
        LG_PARAMETERS.initPlanetRadius * 1.5 + cloudHeight,
        LG_PARAMETERS.initPlanetRadius * 1.5 + cloudHeight,
        LG_PARAMETERS.initPlanetRadius * 1.5 + cloudHeight,
      )
      break;
  }
  const material = createShaderMaterial(cloudsVertShader, cloudsFragShader, [fbmNoise, colorUtils], {
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
    u_octaves: { value: 12 },
    u_cr_colors: { value: LG_PARAMETERS.cloudsColorRamp.definedColors },
    u_cr_positions: { value: LG_PARAMETERS.cloudsColorRamp.definedFactors },
    u_cr_size: { value: LG_PARAMETERS.cloudsColorRampSize },
  })
  material.transparent = true
  material.side = THREE.DoubleSide
  material.shadowSide = THREE.BackSide

  const mesh = new THREE.Mesh(geometry, material)
  mesh.receiveShadow = true
  mesh.name = LG_NAME_CLOUDS
  return mesh
}

export function createCloudsShadows(type: GeometryType) {
  let geometry = undefined
  switch (type) {
    case GeometryType.ICOSPHERE:
      geometry = new THREE.IcosahedronGeometry(
        LG_PARAMETERS.initPlanetRadius + LG_CLOUDS_SHADOW_HEIGHT,
        LG_PARAMETERS.planetMeshQuality,
      )
      break;
    case GeometryType.TORUS:
      geometry = new THREE.TorusGeometry(
        LG_PARAMETERS.initPlanetRadius + LG_CLOUDS_SHADOW_HEIGHT,
        (LG_PARAMETERS.initPlanetRadius / 2.0) - LG_CLOUDS_SHADOW_HEIGHT,
        LG_PARAMETERS.planetMeshQuality * 2.0,
        LG_PARAMETERS.planetMeshQuality * 4.0,
      )
      break;
    case GeometryType.BOX:
      geometry = new THREE.BoxGeometry(
        LG_PARAMETERS.initPlanetRadius * 1.5 + LG_CLOUDS_SHADOW_HEIGHT,
        LG_PARAMETERS.initPlanetRadius * 1.5 + LG_CLOUDS_SHADOW_HEIGHT,
        LG_PARAMETERS.initPlanetRadius * 1.5 + LG_CLOUDS_SHADOW_HEIGHT,
      )
      break;
  }
  const material = createShaderMaterial(cloudsVertShader, cloudsFragShader, [fbmNoise, colorUtils], {
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
    u_octaves: { value: 12 },
    u_cr_colors: { value: LG_PARAMETERS.cloudsColorRamp.definedColors },
    u_cr_positions: { value: LG_PARAMETERS.cloudsColorRamp.definedFactors },
    u_cr_size: { value: LG_PARAMETERS.cloudsColorRampSize },
  })
  material.transparent = true

  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = LG_NAME_CLOUDS
  return mesh
}


export function createControls(camera: THREE.Camera, canvas: HTMLCanvasElement): OrbitControls {
  const controls = new OrbitControls( camera, canvas );
  controls.enablePan = false
  controls.enableDamping = false
  controls.dampingFactor = 0.05
  controls.screenSpacePanning = false
  controls.minDistance = 1.5
  controls.maxDistance = 16
  controls.maxPolarAngle = Math.PI
  controls.rotateSpeed = 0.5
  return controls
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

// ----------------------------------------------------------------------------------------------------------------------
// DATA FUNCTIONS

/**
 * Loads a texture from a raw data-string
 * @param data the image as a string
 */
export function loadTextureFromData(data: string) {
  // TODO
}

/**
 * Loads a texture from a local URL (for pre-stored textures)
 * @param data the image URL
 */
export function loadTextureFromUrl(url: string, colorSpace: THREE.ColorSpace) {
  let texture
  if (url.endsWith('.tga')) {
    texture = TGA_LOADER.load(url); 
    texture.colorSpace = colorSpace
  } else {
    texture = TEXTURE_LOADER.load(url, undefined, undefined, (err) => console.error(err)); 
    texture.colorSpace = colorSpace
  }
  return texture
}

export function buildColorRamp(steps: ColorRampStep[]): { rampSize: number, steps: ColorRampStep[] } {
  const filledSteps = Array(16) // max length
    .fill({color: new THREE.Color(0x0), factor: -1})
    .map((step, i) => i < steps.length ? ({color: steps[i].color, factor: steps[i].factor}) : step)
    return { rampSize: steps.length, steps: filledSteps }
}

// ----------------------------------------------------------------------------------------------------------------------
// SHADER FUNCTIONS

/**
 * Creates a RawShaderMaterial instance from the given parameters
 * @param uniforms shader uniforms
 * @param vertexShader GLSL vertex shader
 * @param fragmentShader GLSL fragment shader
 * @returns the RawShaderMaterial instance
 */
export function createShaderMaterial(
  vertexShader: string,
  fragmentShader: string,
  shaderFunctions: string[],
  uniforms: { [uniform: string]: THREE.IUniform<any>; },
  baseMaterial?: THREE.Material
) {
  const mat = new CustomShaderMaterial({
    baseMaterial: baseMaterial ?? THREE.MeshStandardMaterial,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader.replace('/*__SHADER_FUNCTIONS__*/', shaderFunctions.join('\r\n')),
    uniforms,
  })
  mat.needsUpdate = true
  return mat
}
