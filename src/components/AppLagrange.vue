<template>
  <div ref="sceneRoot"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';
import * as THREE from 'three';

const sceneRoot: Ref<any> = ref(null)
const width = window.innerWidth, height = window.innerHeight;

onMounted(() => init())

function init() {
  const camera = new THREE.PerspectiveCamera( 70, width / height, 0.01, 10 );
  camera.position.z = 1;

  const scene = new THREE.Scene();
  const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
  const material = new THREE.MeshNormalMaterial();

  const mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  const renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( width, height );
  renderer.setAnimationLoop((time: number) => {
    mesh.rotation.x = time / 2000;
    mesh.rotation.y = time / 1000;
    renderer.render(scene, camera );
  });
  document.body.appendChild( renderer.domElement );
}
</script>