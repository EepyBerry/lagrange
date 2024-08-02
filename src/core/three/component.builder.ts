import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import CustomShaderMaterial, { type MaterialConstructor } from 'three-custom-shader-material/vanilla'
import { GeometryType } from '../types'
import { LG_PLANET_DATA } from '../services/planet-editor.service'
import { resolveImports } from './shader-imports.loader'

/**
 * Creates a WebGL-based renderer
 * @param width canvas width
 * @param height canvas height
 * @returns the renderer
 */
export function createRendererComponent(width: number, height: number, pixelRatio?: number) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
  if (pixelRatio) {
    renderer.setPixelRatio(pixelRatio)
  }
  renderer.setSize(width, height)
  renderer.setClearColor(0x000000, 0)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.autoUpdate = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  return renderer
}

/**
 * Creates a perspective camera with the given params and optional orbit settings
 * @param fov Field of View, in degrees
 * @param ratio aspect ratio, i.e. width/height
 * @param near closest rendering distance
 * @param far furthest rendering distance
 * @param initialOrbit (optional) orbit settings (angle, etc)
 * @returns the configured camera
 */
export function createPerspectiveCameraComponent(
  fov: number,
  ratio: number,
  near: number,
  far: number,
  initialOrbit?: THREE.Spherical,
): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(fov, ratio, near, far)
  if (initialOrbit) {
    initialOrbit.makeSafe()
    camera.position.setFromSpherical(initialOrbit)
  }
  return camera
}

/**
 * Creates a simple ambient light
 * @param color light color
 * @param intensity light intensity
 * @returns the AmbientLight instance
 */
export function createAmbientightComponent(color: THREE.ColorRepresentation, intensity: number) {
  const light = new THREE.AmbientLight(color)
  light.intensity = intensity
  return light
}

/**
 * Creates the base geometry for the planet
 * @param type type of mesh to use
 * @param addtlRadius additional radius to add, used for clouds and other above-surface elements
 * @returns the geometry instance
 */
export function createGeometryComponent(type: GeometryType, addtlRadius: number = 0): THREE.BufferGeometry {
  switch (type) {
    case GeometryType.SPHERE:
      return new THREE.SphereGeometry(
        1.0 + addtlRadius,
        LG_PLANET_DATA.value.planetMeshQuality,
        LG_PLANET_DATA.value.planetMeshQuality / 2.0,
      )
    case GeometryType.TORUS:
      return new THREE.TorusGeometry(
        1.0 + addtlRadius / 4.0,
        1.0 / 2.0 + addtlRadius * 2.0,
        LG_PLANET_DATA.value.planetMeshQuality * 2.0,
        LG_PLANET_DATA.value.planetMeshQuality * 4.0,
      )
    case GeometryType.BOX:
      return new THREE.BoxGeometry(1.0 * 1.5 + addtlRadius, 1.0 * 1.5 + addtlRadius, 1.0 * 1.5 + addtlRadius)
  }
}

/**
 * Creates a CustomShaderMaterial instance from the given parameters
 * @param vertexShader GLSL vertex shader
 * @param fragmentShader GLSL fragment shader
 * @param shaderFunctions additional shader functions
 * @param uniforms shader uniforms
 * @param baseMaterial (optional) base material to use
 * @returns the RawShaderMaterial instance
 */
export function createShaderMaterialComponent<T extends MaterialConstructor>(
  vertexShader: string,
  fragmentShader?: string,
  uniforms?: { [uniform: string]: THREE.IUniform<any> },
  baseMaterial?: T,
): CustomShaderMaterial<T> {
  const mat = new CustomShaderMaterial({
    baseMaterial: baseMaterial ?? THREE.MeshStandardMaterial,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader ? resolveImports(fragmentShader) : undefined,
    uniforms,
    silent: true,
  })
  return mat
}

/**
 * Creates standard OrbitControls
 * @param camera the camera to control
 * @param canvas the render canvas
 * @returns an instance of OrbitControls
 */
export function createControlsComponent(camera: THREE.Camera, canvas: HTMLCanvasElement): OrbitControls {
  const controls = new OrbitControls(camera, canvas)
  controls.enablePan = false
  controls.enableDamping = false
  controls.dampingFactor = 0.05
  controls.screenSpacePanning = false
  controls.minDistance = 2.5
  controls.maxDistance = 10
  controls.maxPolarAngle = Math.PI
  controls.rotateSpeed = 0.5
  controls.zoomSpeed = 1.5
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.DOLLY,
  }
  return controls
}
