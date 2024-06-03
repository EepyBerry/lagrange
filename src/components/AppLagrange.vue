<template>
  <AppSidebar />
  <div ref="sceneRoot"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import * as THREE from 'three'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';
import * as ThreeUtils from '@/utils/three-utils';
import AppSidebar from './AppSidebar.vue';
import LagrangeParameters from '@/utils/lagrange-parameters'

// THREE canvas/scene root
const sceneRoot: Ref<any> = ref(null)

// Main THREE objects
let $scene: ThreeUtils.SceneElements

onMounted(() => init())

function init() {
  const width = window.innerWidth, height = window.innerHeight
  $scene = ThreeUtils.createScene(width, height)

  const planet = initPlanet()
  initSun()

  initRendering(width, height, planet)
  ThreeUtils.createControls($scene.camera, $scene.renderer.domElement)
  window.addEventListener('resize', onWindowResize);
}

function initRendering(width: number, height: number, planet: THREE.Mesh) {
  const stats = new Stats();
  stats.dom.style.right = "0"
  stats.dom.style.left = "auto"
	document.body.appendChild( stats.dom )

  $scene.renderer.setSize( width, height )
  $scene.renderer.setAnimationLoop(() => renderFrame(stats))
  sceneRoot.value.appendChild($scene.renderer.domElement)
}

function initPlanet(wireframe: boolean = false): THREE.Mesh {
  const planet = ThreeUtils.createPlanet()
  $scene.scene.add(planet)
  if (wireframe) {
    $scene.scene.add(ThreeUtils.createPlanetWireframe(planet))
  }
  return planet
}

function initSun(): THREE.PointLight {
  const sun = ThreeUtils.createSun()
  sun.position.set(0, 5e3, 1e4)
  $scene.scene.add(sun)
  return sun
}

function renderFrame(stats: Stats) {
  stats.update()
  $scene.renderer.render($scene.scene, $scene.camera)
}

function onWindowResize() {
  $scene.camera.aspect = window.innerWidth / window.innerHeight
  $scene.camera.updateProjectionMatrix()
  $scene.renderer.setSize(window.innerWidth, window.innerHeight)
}
</script>