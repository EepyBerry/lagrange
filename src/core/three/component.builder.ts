import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import CustomShaderMaterial, { type MaterialConstructor } from 'three-custom-shader-material/vanilla'
import { LG_PLANET_DATA } from '../services/planet-editor.service'
import * as ShaderLoader from './shader.loader'

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
  renderer.setTransparentSort((a, b) => a.z - b.z) // Invert transparent sorting to have a "filter" effect for transparent objects (atmos/ring)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.autoUpdate = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
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
 * Creates a perspective camera with the given params and optional orbit settings
 * @param fov Field of View, in degrees
 * @param ratio aspect ratio, i.e. width/height
 * @param near closest rendering distance
 * @param far furthest rendering distance
 * @param initialOrbit (optional) orbit settings (angle, etc)
 * @returns the configured camera
 */
export function createOrthgraphicCameraComponent(
  width: number,
  height: number,
  near: number,
  far: number,
): THREE.OrthographicCamera {
  return new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, near, far)
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

export function createSphereGeometryComponent(addtlRadius: number = 0): THREE.SphereGeometry {
  return new THREE.SphereGeometry(
    1.0 + addtlRadius,
    LG_PLANET_DATA.value.planetMeshQuality,
    LG_PLANET_DATA.value.planetMeshQuality / 2.0,
  )
}

export function createRingGeometryComponent(
  innerRadius: number = 1.25,
  outerRadius: number = 1.75,
): THREE.RingGeometry {
  return new THREE.RingGeometry(innerRadius, outerRadius, LG_PLANET_DATA.value.planetMeshQuality)
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
export function createCustomShaderMaterialComponent<T extends MaterialConstructor>(
  vertexShader: string,
  fragmentShader?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uniforms?: { [uniform: string]: THREE.IUniform<any> },
  baseMaterial?: T,
): CustomShaderMaterial<T> {
  const mat = new CustomShaderMaterial({
    baseMaterial: baseMaterial ?? THREE.MeshStandardMaterial,
    vertexShader,
    fragmentShader: fragmentShader ? ShaderLoader.resolveImports(fragmentShader) : undefined,
    uniforms,
    silent: true,
  })
  return mat
}

export function createShaderMaterialComponent(
  vertexShader: string,
  fragmentShader?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uniforms?: { [uniform: string]: THREE.IUniform<any> },
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: fragmentShader ? ShaderLoader.resolveImports(fragmentShader) : undefined,
    uniforms,
  })
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
  controls.minDistance = 1.5
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
