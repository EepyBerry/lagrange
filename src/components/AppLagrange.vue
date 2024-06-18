<template>
  <div ref="sceneRoot"></div>
  <OverlaySpinner :load="showSpinner" />
</template>

<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue'
import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js';
import * as ThreeUtils from '@/core/lagrange.service';
import { LG_HEIGHT_DIVIDER, LG_NAME_AMBLIGHT, LG_NAME_CLOUDS, LG_NAME_PLANET, LG_PARAMETERS } from '@core/globals';
import { degToRad } from 'three/src/math/MathUtils.js';
import { GeometryType, type SceneElements } from '@core/types';
import type CustomShaderMaterial from 'three-custom-shader-material/dist/declarations/src/vanilla';
import { createControls } from '@/core/three/component.builder';

// THREE canvas/scene root
const sceneRoot: Ref<any> = ref(null)
const showSpinner: Ref<boolean> = ref(false)

// Main THREE objects
let $se: SceneElements
let _sun: THREE.DirectionalLight
let _planet: THREE.Mesh
let _clouds: THREE.Mesh
let _atmosphere: THREE.Mesh
let _ambLight: THREE.AmbientLight

const VEC_Z = new THREE.Vector3(0, 0, 1)
const VEC_UP = new THREE.Vector3(0, 1, 0)

onMounted(() => init())
watch(LG_PARAMETERS.changedProps, () => updatePlanet())

function init() {
  const width = window.innerWidth,
        height = window.innerHeight,
        pixelRatio = window.devicePixelRatio
  $se = ThreeUtils.createScene(width, height, pixelRatio)

  initLighting()
  initPlanet()
  initRendering(width, height)
  createControls($se.camera, $se.renderer.domElement)
  window.addEventListener('resize', onWindowResize);
}

function initRendering(width: number, height: number) {
  const stats = new Stats();
  stats.dom.style.right = '0'
  stats.dom.style.left = 'auto'
  stats.dom.ariaHidden = 'true'
	document.body.appendChild(stats.dom)

  $se.renderer.setSize( width, height )
  $se.renderer.setAnimationLoop(() => renderFrame(stats))
  $se.renderer.domElement.ariaLabel = '3D planet viewer'
  sceneRoot.value.appendChild($se.renderer.domElement)
}

function initPlanet(): void {
  const planet = ThreeUtils.createPlanet(GeometryType.SPHERE)
  const clouds = ThreeUtils.createClouds(GeometryType.SPHERE)
  const atmosphere = ThreeUtils.createAtmosphere(GeometryType.SPHERE, _sun.position)
  /* const grp = new THREE.Group()
  grp.add(planet)
  grp.add(clouds)
  grp.add(atmosphere)
  $se.scene.add(grp) */
  $se.scene.add(planet)
  $se.scene.add(clouds)
  $se.scene.add(atmosphere)
  _planet = planet
  _clouds = clouds
  _atmosphere = atmosphere
  //_renderGroup = grp
  
  //const helper = new VertexNormalsHelper( planet, 0.1, 0xff0000 );
  //$se.scene.add( helper );
}

function initLighting(): void {
  const sun = ThreeUtils.createSun()
  sun.position.set(0, 5e3, 1e4)
  $se.scene.add(sun)
  _sun = sun
  _ambLight = $se.scene.getObjectByName(LG_NAME_AMBLIGHT) as THREE.AmbientLight
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
      case '_sunLightColor': {
        _sun.color = LG_PARAMETERS.sunLightColor
        break
      }
      case '_sunLightIntensity': {
        _sun.intensity = LG_PARAMETERS.sunLightIntensity
        break
      }
      case '_ambLightColor': {
        _ambLight.color = LG_PARAMETERS.ambLightColor
        break
      }
      case '_ambLightIntensity': {
        _ambLight.intensity = LG_PARAMETERS.ambLightIntensity
        break
      }
      case '_planetGeometryType': {
        const v = LG_PARAMETERS.planetGeometryType
        const newPlanet = ThreeUtils.switchMeshFor($se.scene, LG_NAME_PLANET, v)
        const newClouds = ThreeUtils.switchMeshFor($se.scene, LG_NAME_CLOUDS, v)
        _planet = newPlanet
        _clouds = newClouds
        _atmosphere.visible = (v === GeometryType.SPHERE)
        break
      }
      case '_planetMeshQuality': {
        const geoType = LG_PARAMETERS.planetGeometryType
        const newPlanet = ThreeUtils.switchMeshFor($se.scene, LG_NAME_PLANET, geoType, true)
        const newClouds = ThreeUtils.switchMeshFor($se.scene, LG_NAME_CLOUDS, geoType, true)
        _planet = newPlanet
        _clouds = newClouds
        _atmosphere.visible = (geoType === GeometryType.SPHERE)
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
      case '_planetSurfaceShowBumps': {
        const v = LG_PARAMETERS.planetSurfaceShowBumps
        const mat = _planet.material as CustomShaderMaterial
        mat.uniforms.u_bump = { value: v }
        mat.needsUpdate = true
        break
      }
      case '_planetSurfaceNoise._frequency': {
        const v = LG_PARAMETERS.planetSurfaceNoise
        const mat = _planet.material as CustomShaderMaterial
        mat.uniforms.u_frequency = { value: v.frequency }
        mat.needsUpdate = true
        break
      }
      case '_planetSurfaceNoise._amplitude': {
        const v = LG_PARAMETERS.planetSurfaceNoise
        const mat = _planet.material as CustomShaderMaterial
        mat.uniforms.u_amplitude = { value: v.amplitude }
        mat.needsUpdate = true
        break
      }
      case '_planetSurfaceNoise._lacunarity': {
        const v = LG_PARAMETERS.planetSurfaceNoise
        const mat = _planet.material as CustomShaderMaterial
        mat.uniforms.u_lacunarity = { value: v.lacunarity }
        mat.needsUpdate = true
        break
      }
      case '_planetSurfaceColorRamp': {
        const v = LG_PARAMETERS.planetSurfaceColorRamp
        const mat = _planet.material as CustomShaderMaterial
        mat.uniforms.u_cr_colors = { value: v.colors },
        mat.uniforms.u_cr_positions = { value: v.factors },
        mat.needsUpdate = true
        break
      }
      case '_cloudsEnabled': {
        const v = LG_PARAMETERS.cloudsEnabled
        _clouds.visible = v
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
        _clouds.scale.setScalar(1 + ((isNaN(v) ? 1 : v) / LG_HEIGHT_DIVIDER))
        break
      }
      case '_cloudsNoise._frequency': {
        const v = LG_PARAMETERS.cloudsNoise;
        const mat = _clouds.material as CustomShaderMaterial
        mat.uniforms.u_frequency = { value: v.frequency }
        mat.needsUpdate = true
        break
      }
      case '_cloudsNoise._amplitude': {
        const v = LG_PARAMETERS.cloudsNoise;
        const mat = _clouds.material as CustomShaderMaterial
        mat.uniforms.u_amplitude = { value: v.amplitude }
        mat.needsUpdate = true
        break
      }
      case '_cloudsNoise._lacunarity': {
        const v = LG_PARAMETERS.cloudsNoise;
        const mat = _clouds.material as CustomShaderMaterial
        mat.uniforms.u_lacunarity = { value: v.lacunarity }
        mat.needsUpdate = true
        break
      }
      case '_cloudsColorRamp': {
        const v = LG_PARAMETERS.cloudsColorRamp
        const mat = _clouds.material as CustomShaderMaterial
        mat.uniforms.u_cr_colors = { value: v.colors },
        mat.uniforms.u_cr_positions = { value: v.factors },
        mat.needsUpdate = true
        break
      }
      case '_atmosphereEnabled': {
        const v = LG_PARAMETERS.atmosphereEnabled
        _atmosphere.visible = v
        break
      }
      case '_atmosphereDaylightHue': {
        const v = LG_PARAMETERS.atmosphereDaylightHue
        const mat = _atmosphere.material as CustomShaderMaterial
        mat.uniforms.u_daylight_color = { value: v }
        break
      }
    }
  }
  LG_PARAMETERS.clearChangedProps()
}
</script>