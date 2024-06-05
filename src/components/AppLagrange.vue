<template>
  <AppSidebar />
  <div ref="sceneRoot"></div>
  <OverlaySpinner :load="showSpinner" />
</template>

<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue'
import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js';
import * as ThreeUtils from '@/utils/three-utils';
import AppSidebar from './AppSidebar.vue';
import { LG_PARAMETERS } from '@core/globals';
import type LagrangeParameters from '@/core/models/lagrange-parameters.model';
import { degToRad } from 'three/src/math/MathUtils.js';
import { GeometryType, type SceneElements } from '@core/types';

// THREE canvas/scene root
const sceneRoot: Ref<any> = ref(null)
const showSpinner: Ref<boolean> = ref(false)

// Main THREE objects
let $se: SceneElements
let _sun: THREE.Object3D
let _planet: THREE.Object3D

const VEC_Z = new THREE.Vector3(0, 0, 1)
const VEC_UP = new THREE.Vector3(0, 1, 0)

onMounted(() => init())
watch(LG_PARAMETERS, (newValue) => updateScene(newValue as LagrangeParameters))

function init() {
  const width = window.innerWidth, height = window.innerHeight
  $se = ThreeUtils.createScene(width, height)

  initSun()
  initPlanet()
  initRendering(width, height)

  ThreeUtils.createControls($se.camera, $se.renderer.domElement)
  window.addEventListener('resize', onWindowResize);
}

function initRendering(width: number, height: number) {
  const stats = new Stats();
  stats.dom.style.right = '0'
  stats.dom.style.left = 'auto'
	document.body.appendChild( stats.dom )

  $se.renderer.setSize( width, height )
  $se.renderer.setAnimationLoop(() => renderFrame(stats))
  sceneRoot.value.appendChild($se.renderer.domElement)
}

function initPlanet(): void {
  const planet = ThreeUtils.createPlanet(GeometryType.ICOSPHERE)
  $se.scene.add(planet)
  _planet = planet
}

function initSun(): void {
  const sun = ThreeUtils.createSun()
  sun.position.set(0, 5e3, 1e4)
  $se.scene.add(sun)
  _sun = sun
}

function renderFrame(stats: Stats) {
  stats.update()
  $se.renderer.render($se.scene, $se.camera)
}

function onWindowResize() {
  $se.camera.aspect = window.innerWidth / window.innerHeight
  $se.camera.updateProjectionMatrix()
  $se.renderer.setSize(window.innerWidth, window.innerHeight)
}

function updateScene(params: LagrangeParameters) {
  for (const entry of Object.entries(params)) {
    const key = entry[0]
    const value = entry[1]
    switch (key) {
      case '_planetGeometryType': {
        showSpinner.value = true
        const newPlanet = ThreeUtils.switchPlanetMesh($se.scene, value)
        _planet = newPlanet
        showSpinner.value = false
        break
      }
      case '_planetRadius':
        _planet.scale.setScalar(isNaN(value) ? 1 : value)
        break;
      case '_planetAxialTilt':
        _planet.rotateOnWorldAxis(VEC_Z, degToRad(isNaN(value) ? 0 : value) - _planet.rotation.z)
        break;
      case '_planetRotation':
        _planet.rotateOnAxis(VEC_UP, degToRad(isNaN(value) ? 0 : value) - _planet.rotation.y)
        break;
    }
  }
}
</script>