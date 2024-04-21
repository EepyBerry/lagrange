<template>
  <div ref="sceneRoot"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// THREE canvas/scene root
const sceneRoot: Ref<any> = ref(null)

// Main THREE objects
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
// End main THREE objects

onMounted(() => init())

function init() {
  const width = window.innerWidth, height = window.innerHeight

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10)
  renderer = new THREE.WebGLRenderer( { antialias: true } )
  camera.position.z = 5

  const geometry = new THREE.SphereGeometry(1, 64, 32)
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  const mesh = new THREE.Mesh(geometry, material)
  const wireframeLines = initWireframe(mesh)
  //scene.add(mesh)
  scene.add(wireframeLines)

  renderer.setSize( width, height )
  renderer.setAnimationLoop((time: number) => renderFrame(mesh, time))
  sceneRoot.value.appendChild(renderer.domElement)

  const controls = initControls(camera, renderer.domElement)
  const gui = new GUI();
  gui.add(controls, 'zoomToCursor');

  window.addEventListener( 'resize', onWindowResize );
}

function initControls(camera: THREE.Camera, canvas: HTMLCanvasElement): OrbitControls {
  const controls = new OrbitControls( camera, canvas );
  controls.enablePan = false
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.screenSpacePanning = false
  controls.minDistance = 1
  controls.maxDistance = 5
  controls.maxPolarAngle = Math.PI
  return controls
}

function initWireframe(mesh: THREE.Mesh): THREE.LineSegments {
  const wireframe = new THREE.WireframeGeometry(mesh.geometry)
  let line = new THREE.LineSegments( wireframe );
  const mat = line.material as THREE.Material
  mat.depthTest = false
  mat.opacity = 0.25
  mat.transparent = true
  return line
}

function renderFrame(mesh: THREE.Mesh, time: number) {
  renderer.render(scene, camera)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
</script>