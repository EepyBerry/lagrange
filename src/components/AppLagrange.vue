<template>
  <div ref="sceneRoot"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import * as THREE from 'three'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import * as ThreeUtils from '@/utils/three-utils';

import fbmFragmentShader from '@/assets/glsl/generative_fbm.frag.glsl?raw'
import defaultVertexShader from '@/assets/glsl/default.vert.glsl?raw'

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
  scene.background = new THREE.Color(0x0)
  scene.background.convertLinearToSRGB()
  renderer = new THREE.WebGLRenderer( { antialias: true } )
  camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10)
  camera.position.z = 3

  const geometry = new THREE.IcosahedronGeometry(1, 10)
/*   const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: ThreeUtils.loadTextureFromUrl('/2k_earth_daymap.jpg', THREE.SRGBColorSpace),
    toneMapped: false
  }) */
  const material = ThreeUtils.createRawShaderMaterial({
    u_resolution: { value: new THREE.Vector2(width, height)},
    u_time: { value: 0 }
  }, defaultVertexShader, fbmFragmentShader)

  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  renderer.setSize( width, height )
  renderer.setAnimationLoop((time: number) => renderFrame(mesh, time))
  sceneRoot.value.appendChild(renderer.domElement)

  const controls = ThreeUtils.createControls(camera, renderer.domElement)
  const gui = new GUI();
  gui.add(controls, 'zoomToCursor');

  window.addEventListener( 'resize', onWindowResize );
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