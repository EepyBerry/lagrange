import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import { TGALoader } from 'three/addons/loaders/TGALoader.js'

import perlinNoise from '@/assets/glsl/classic_pnoise.func.glsl?raw'
import planetFragShader from '@/assets/glsl/planet.frag.glsl?raw'
import planetVertShader from '@/assets/glsl/planet.vert.glsl?raw'

export type SceneElements = {
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera
}

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
  renderer.setClearColor(0xffffff, 0)
  renderer.setClearAlpha(0)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.autoUpdate = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // setup camera
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1e9)
  camera.position.z = 3

  return { scene, renderer, camera }
}

export function createSun() {
  const geometry = new THREE.IcosahedronGeometry(50, 4)
  const material = new THREE.MeshStandardMaterial( { color: 0xffffff, emissive: new THREE.Color(100, 100, 100) } )
  const sun = new THREE.PointLight(0xfff6e8, 5e8)
  sun.castShadow = true
  sun.receiveShadow = false
  sun.add(new THREE.Mesh(geometry, material))
  return sun
}

export function createPlanetMesh()  {
  const geometry = new THREE.IcosahedronGeometry(1, 12)
  const defaultTexture = loadTextureFromUrl('/2k_earth_daymap.jpg', THREE.SRGBColorSpace)
  /* const material = new THREE.MeshStandardMaterial ({
    map: defaultTexture,
  }) */
  const material = createRawShaderMaterial(perlinNoise, {
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
    u_time: { value: 0 },
  }, )
  //const material = createShaderBackedMaterial()
  const mesh = new THREE.Mesh(geometry, material)
  mesh.receiveShadow = true
  return mesh
}

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

// ----------------------------------------------------------------------------------------------------------------------
// SHADER FUNCTIONS

export function createShaderBackedMaterial() {
  const mat = new THREE.MeshLambertMaterial()
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = `
      	varying vec3 vPos;
        ${shader.vertexShader}
      `.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>
        	vPos = position;
        `
      );
      console.log(shader.vertexShader);
      shader.fragmentShader = `
      	varying vec3 vPos;
        ${perlinNoise}
        ${shader.fragmentShader}
      `.replace(
        `vec4 diffuseColor = vec4( diffuse, opacity );`,
        `
        float noise = cnoise(normalize(vPos) * vec3(1, 2., 1.) * 2.);
        float r = max(0.0, noise);
        float b = max(0.0, -noise);
        
        vec4 diffuseColor = vec4( vec3(r, 0, b), opacity );`
      );
      console.log(shader.fragmentShader);
  }
  return mat;
}

/**
 * Creates a RawShaderMaterial instance from the given parameters
 * @param uniforms shader uniforms
 * @param vertexShader GLSL vertex shader
 * @param fragmentShader GLSL fragment shader
 * @returns the RawShaderMaterial instance
 */
export function createRawShaderMaterial(
  shaderFunctions: string,
  uniforms: { [uniform: string]: THREE.IUniform<any>; }
) {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: planetVertShader,
    fragmentShader: planetFragShader.replace('/*__SHADER_FUNCTIONS__*/', shaderFunctions), 
    glslVersion: THREE.GLSL1
  })
}

// ----------------------------------------------------------------------------------------------------------------------
// DEBUG FUNCTIONS

export function createPlanetWireframe(mesh: THREE.Mesh): THREE.LineSegments {
  const wireframe = new THREE.WireframeGeometry(mesh.geometry)
  const line = new THREE.LineSegments( wireframe );
  const mat = line.material as THREE.Material
  mat.depthTest = true
  mat.opacity = 0.25
  mat.transparent = true
  return line
}