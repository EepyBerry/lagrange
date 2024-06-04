<template>
  <AppSidebar />
  <div ref="sceneRoot"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue'
import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js';
import * as ThreeUtils from '@/utils/three-utils';
import AppSidebar from './AppSidebar.vue';
import { LG_PARAMETERS } from '@/utils/globals';
import type LagrangeParameters from '@/utils/lagrange-parameters';
import { degToRad } from 'three/src/math/MathUtils.js';

// THREE canvas/scene root
const sceneRoot: Ref<any> = ref(null)

// Main THREE objects
let $scene: ThreeUtils.SceneElements
let _sun: THREE.Object3D
let _planet: THREE.Object3D

const VEC_Z = new THREE.Vector3(0, 0, 1)
const VEC_UP = new THREE.Vector3(0, 1, 0)

onMounted(() => init())
watch(LG_PARAMETERS, (newValue) => {
  updateScene(newValue)
})

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
  _planet = planet
  return planet
}

function initSun(): THREE.PointLight {
  const sun = ThreeUtils.createSun()
  sun.position.set(0, 5e3, 1e4)
  $scene.scene.add(sun)
  _sun = sun
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

function updateScene(params: LagrangeParameters) {
  for (const entry of Object.entries(params)) {
    const key = entry[0]
    const value = entry[1]
    switch (key) {
      case 'planetRadius':
        _planet.scale.setScalar(isNaN(value) ? 1 : value)
        break;
      case 'planetAxialTilt':
        _planet.rotateOnWorldAxis(VEC_Z, degToRad(isNaN(value) ? 0 : value) - _planet.rotation.z)
        break;
      case 'planetRotation':
        _planet.rotateOnAxis(VEC_UP, degToRad(isNaN(value) ? 0 : value) - _planet.rotation.y)
        break;
    }
  }
}
</script>