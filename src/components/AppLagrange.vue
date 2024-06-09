<template>
  <AppSidebar />
  <div ref="sceneRoot"></div>
  <OverlaySpinner :load="showSpinner" />
</template>

<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue'
import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js';
import * as ThreeUtils from '@/core/lagrange.service';
import AppSidebar from './AppSidebar.vue';
import { LG_CLOUDS_DIVIDER, LG_PARAMETERS } from '@core/globals';
import { degToRad } from 'three/src/math/MathUtils.js';
import { GeometryType, type SceneElements } from '@core/types';
import type CustomShaderMaterial from 'three-custom-shader-material/dist/declarations/src/vanilla';
import { createControls } from '@/core/three/component.builder';

// THREE canvas/scene root
const sceneRoot: Ref<any> = ref(null)
const showSpinner: Ref<boolean> = ref(false)

// Main THREE objects
let $se: SceneElements
let _sun: THREE.Object3D
let _planet: THREE.Mesh
let _clouds: THREE.Mesh

const VEC_Z = new THREE.Vector3(0, 0, 1)
const VEC_UP = new THREE.Vector3(0, 1, 0)

onMounted(() => init())
watch(LG_PARAMETERS.changedProps, () => updatePlanet())

function init() {
  const width = window.innerWidth,
        height = window.innerHeight,
        pixelRatio = window.devicePixelRatio
  $se = ThreeUtils.createScene(width, height, pixelRatio)

  initSun()
  initPlanet()
  initRendering(width, height)
  createControls($se.camera, $se.renderer.domElement)
  window.addEventListener('resize', onWindowResize);
}

function initRendering(width: number, height: number) {
  const stats = new Stats();
  stats.dom.style.right = '0'
  stats.dom.style.left = 'auto'
	document.body.appendChild(stats.dom)

  $se.renderer.setSize( width, height )
  $se.renderer.setAnimationLoop(() => renderFrame(stats))
  sceneRoot.value.appendChild($se.renderer.domElement)
}

function initPlanet(): void {
  const planet = ThreeUtils.createPlanet(GeometryType.ICOSPHERE)
  //const clouds = ThreeUtils.createClouds(GeometryType.ICOSPHERE)
  $se.scene.add(planet)
  //$se.scene.add(clouds)
  _planet = planet
  //_clouds = clouds

  //const helper = new VertexNormalsHelper( planet, 0.1, 0xff0000 );
  //$se.scene.add( helper );
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

function updatePlanet() {
  if (LG_PARAMETERS.changedProps.length === 0) { return }
  for (const key of LG_PARAMETERS.changedProps) {
    switch (key) {
      case '_planetGeometryType': {
        const v = LG_PARAMETERS.planetGeometryType
        const newPlanet = ThreeUtils.switchPlanetMesh($se.scene, v)
        _planet = newPlanet
        break
      }
      case '_planetMeshQuality': {
        const newPlanet = ThreeUtils.forceUpdatePlanet($se.scene)
        const newClouds = ThreeUtils.forceUpdateClouds($se.scene)
        _planet = newPlanet
        _clouds = newClouds
        break
      }
      case '_planetRadius': {
        const v = LG_PARAMETERS.initPlanetRadius
        _planet.scale.setScalar(isNaN(v) ? 1 : v)
        break
      }
      case '_planetAxialTilt': {
        const v = LG_PARAMETERS.planetAxialTilt
        _planet.rotateOnWorldAxis(VEC_Z, degToRad(isNaN(v) ? 0 : v) - _planet.rotation.z)
        break
      }
      case '_planetRotation': {
        const v = LG_PARAMETERS.planetRotation
        _planet.rotateOnAxis(VEC_UP, degToRad(isNaN(v) ? 0 : v) - _planet.rotation.y)
        break
      }
      case '_planetSurfaceNoise._frequency': {
        const v = LG_PARAMETERS.planetSurfaceNoise;
        const mat = _planet.material as CustomShaderMaterial
        mat.uniforms.u_frequency = { value: v.frequency }
        mat.needsUpdate = true
        break
      }
      case '_planetSurfaceNoise._amplitude': {
        const v = LG_PARAMETERS.planetSurfaceNoise;
        const mat = _planet.material as CustomShaderMaterial
        mat.uniforms.u_amplitude = { value: v.amplitude }
        mat.needsUpdate = true
        break
      }
      case '_planetSurfaceNoise._lacunarity': {
        const v = LG_PARAMETERS.planetSurfaceNoise;
        const mat = _planet.material as CustomShaderMaterial
        mat.uniforms.u_lacunarity = { value: v.lacunarity }
        mat.needsUpdate = true
        break
      }
      case '_cloudsAxialTilt': {
        const v = LG_PARAMETERS.cloudsAxialTilt
        _clouds.rotateOnWorldAxis(VEC_Z, degToRad(isNaN(v) ? 0 : v) - _clouds.rotation.z)
        break
      }
      case '_cloudsRotation': {
        const v = LG_PARAMETERS.cloudsRotation
        _clouds.rotateOnAxis(VEC_UP, degToRad(isNaN(v) ? 0 : v) - _clouds.rotation.y)
        break
      }
      case '_cloudsHeight': {
        const v = LG_PARAMETERS.cloudsHeight
        _clouds.scale.setScalar(1 + ((isNaN(v) ? 1 : v) / LG_CLOUDS_DIVIDER))
        break
      }
    }
  }
  LG_PARAMETERS.clearChangedProps()
}
</script>