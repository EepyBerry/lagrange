<template>
  <div ref="sceneRoot"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import * as THREE from 'three'
import { MeshPhysicalNodeMaterial, normalWorld, mx_fractal_noise_vec3 } from 'three/nodes';
import { nodeFrame } from 'three/addons/renderers/webgl-legacy/nodes/WebGLNodes.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
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

  const texture = new THREE.TextureLoader().load('/2k_earth_daymap.jpg'); 
  const geometry = new THREE.IcosahedronGeometry(1, 10)
  //const material = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture })
  const material = new MeshPhysicalNodeMaterial()
  material.colorNode = mx_fractal_noise_vec3(normalWorld.mul(.5))

  const mesh = new THREE.Mesh(geometry, material)
  const wireframeLines = initWireframe(mesh)
  scene.add(wireframeLines)
  scene.add(mesh)

  const particleLight = new THREE.Mesh(
    new THREE.SphereGeometry( 0.4, 8, 8 ),
    new THREE.MeshBasicMaterial( { color: 0xffffff } )
  );
  scene.add( particleLight );
  particleLight.add( new THREE.PointLight( 0xffffff, 1000 ) );


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
  controls.enableDamping = false
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
	nodeFrame.update();
  renderer.render(scene, camera)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
</script>