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
import { LG_PARAMETERS, LG_UPDATE_PARAMS } from '@core/globals';
import type LagrangeParameters from '@/core/models/lagrange-parameters.model';
import { degToRad } from 'three/src/math/MathUtils.js';
import { GeometryType, type SceneElements } from '@core/types';
import { extractChanges, hasAnyProperty } from '@/utils/utils';

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
watch(() => ({ ...LG_PARAMETERS }), (newValue, oldValue) => {
  let changes = extractChanges(oldValue,newValue)
  if (hasAnyProperty(changes, LG_UPDATE_PARAMS)) {
    changes = LG_PARAMETERS
  }
  updateScene(changes)
}, { deep: true })

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

function updateScene(params: Partial<LagrangeParameters>) {
  for (const key of Object.keys(params)) {
    switch (key) {
      case '_planetGeometryType': {
        const v = LG_PARAMETERS.planetGeometryType
        const newPlanet = ThreeUtils.switchPlanetMesh($se.scene, v)
        _planet = newPlanet
        break
      }
      case '_planetMeshQuality': {
        const newPlanet = ThreeUtils.forceUpdatePlanet($se.scene)
        _planet = newPlanet
        break
      }
      case '_planetRadius': {
        const v = LG_PARAMETERS.initPlanetRadius
        _planet.scale.setScalar(isNaN(v) ? 1 : v)
        break;
      }
      case '_planetAxialTilt': {
        const v = LG_PARAMETERS.planetAxialTilt
        _planet.rotateOnWorldAxis(VEC_Z, degToRad(isNaN(v) ? 0 : v) - _planet.rotation.z)
        break;
      }
        
      case '_planetRotation': {
        const v = LG_PARAMETERS.planetRotation
        _planet.rotateOnAxis(VEC_UP, degToRad(isNaN(v) ? 0 : v) - _planet.rotation.y)
        break;
      }
    }
  }
}
</script>