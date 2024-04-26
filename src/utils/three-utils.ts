import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import * as lygia from 'resolve-lygia';

const TEXTURE_LOADER = new THREE.TextureLoader()

// ----------------------------------------------------------------------------------------------------------------------
// SCENE FUNCTIONS

export function createControls(camera: THREE.Camera, canvas: HTMLCanvasElement): OrbitControls {
  const controls = new OrbitControls( camera, canvas );
  controls.enablePan = false
  controls.enableDamping = false
  controls.dampingFactor = 0.05
  controls.screenSpacePanning = false
  controls.minDistance = 1
  controls.maxDistance = 5
  controls.maxPolarAngle = Math.PI
  controls.rotateSpeed = 0.5
  return controls
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
export function loadTextureFromUrl(url: string, colorSpace:  THREE.ColorSpace) {
  const texture = TEXTURE_LOADER.load('/2k_earth_daymap.jpg'); 
  texture.colorSpace = colorSpace
  return texture
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
export function createRawShaderMaterial(uniforms: { [uniform: string]: THREE.IUniform<any>; }, vertexShader: string, fragmentShader: string) {
  return new THREE.RawShaderMaterial({ uniforms, vertexShader: lygia.resolveLygia(vertexShader), fragmentShader: lygia.resolveLygia(fragmentShader), glslVersion: THREE.GLSL3 })
}

// ----------------------------------------------------------------------------------------------------------------------
// DEBUG FUNCTIONS

export function createWireframe(mesh: THREE.Mesh): THREE.LineSegments {
  const wireframe = new THREE.WireframeGeometry(mesh.geometry)
  const line = new THREE.LineSegments( wireframe );
  const mat = line.material as THREE.Material
  mat.depthTest = false
  mat.opacity = 0.25
  mat.transparent = true
  return line
}