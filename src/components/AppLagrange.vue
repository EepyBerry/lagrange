<template>
  <div ref="sceneRoot"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import * as THREE from 'three'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';
import * as ThreeUtils from '@/utils/three-utils';

// THREE canvas/scene root
const sceneRoot: Ref<any> = ref(null)

// Main THREE objects
let $scene: ThreeUtils.SceneElements

onMounted(() => init())

function init() {
  const width = window.innerWidth, height = window.innerHeight
  $scene = ThreeUtils.createScene(width, height)

  const mesh = ThreeUtils.createPlanet()
  $scene.scene.add(mesh)

  const sun = ThreeUtils.createSun()
  sun.position.set(0, 5e3, 1e4)
  $scene.scene.add(sun)
  //$scene.scene.add(ThreeUtils.createPlanetWireframe(mesh))

  $scene.renderer.setSize( width, height )
  $scene.renderer.setAnimationLoop((time: number) => renderFrame(mesh, time, stats))
  sceneRoot.value.appendChild($scene.renderer.domElement)

  ThreeUtils.createControls($scene.camera, $scene.renderer.domElement)

  const stats = new Stats();
	document.body.appendChild( stats.dom );

  window.addEventListener('resize', onWindowResize);
}

function renderFrame(mesh: THREE.Mesh, time: number, stats: Stats) {
  stats.update()
  $scene.renderer.render($scene.scene, $scene.camera)
}

function onWindowResize() {
  $scene.camera.aspect = window.innerWidth / window.innerHeight
  $scene.camera.updateProjectionMatrix()
  $scene.renderer.setSize(window.innerWidth, window.innerHeight)
}
</script>