<template>
  <PlanetInfoControls @data-load="reloadMaterials" />
  <PlanetEditorControls />
  <div ref="sceneRoot"></div>
  <OverlaySpinner :load="showSpinner" />
</template>

<script setup lang="ts">
import PlanetEditorControls from '@/components/controls/PlanetEditorControls.vue';
import PlanetInfoControls from '@/components/controls/PlanetInfoControls.vue'
import { onMounted, ref, watch, type Ref } from 'vue'
import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js';
import * as ThreeUtils from '@/core/lagrange.service';
import { LG_NAME_AMBLIGHT, LG_PARAMETERS } from '@core/globals';
import { degToRad } from 'three/src/math/MathUtils.js';
import { GeometryType, type SceneElements } from '@core/types';
import type CustomShaderMaterial from 'three-custom-shader-material/dist/declarations/src/vanilla';
import { createControls } from '@/core/three/component.builder';
import { useHead } from '@unhead/vue';

useHead({ meta: [
  { name: 'description', content: 'A procedural planet building app' }
]})

// THREE canvas/scene root
const sceneRoot: Ref<any> = ref(null)
const showSpinner: Ref<boolean> = ref(true)

// Main THREE objects
let $se: SceneElements
let _sun: THREE.DirectionalLight
let _planetPivot: THREE.Group
let _planet: THREE.Mesh
let _clouds: THREE.Mesh
let _atmosphere: THREE.Mesh
let _ambLight: THREE.AmbientLight

const VEC_Z = new THREE.Vector3(0, 0, 1)

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
  showSpinner.value = false
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
  const pivot = new THREE.Group()
  pivot.add(planet)
  pivot.add(clouds)
  pivot.add(atmosphere)
  $se.scene.add(pivot)
  _planet = planet
  _clouds = clouds
  _atmosphere = atmosphere
  _planetPivot = pivot
  
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

// ------------------------------------------------------------------------------------------------

function renderFrame(stats: Stats) {
  stats.update()
  $se.renderer.render($se.scene, $se.camera)
}

function onWindowResize() {
  $se.camera.aspect = window.innerWidth / window.innerHeight
  $se.camera.updateProjectionMatrix()
  $se.renderer.setSize(window.innerWidth, window.innerHeight)
}

function reloadMaterials() {
  LG_PARAMETERS.markAllForChange()
}

function updatePlanet() {
  if (LG_PARAMETERS.changedProps.length === 0) { return }
  for (const key of LG_PARAMETERS.changedProps) {
    switch (key) {
      // --------------------------------------------------
      // |               Lighting settings                |
      // --------------------------------------------------
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

      // --------------------------------------------------
      // |                Planet settings                 |
      // --------------------------------------------------
      case '_planetAxialTilt': {
        const v = degToRad(isNaN(LG_PARAMETERS.planetAxialTilt) ? 0 : LG_PARAMETERS.planetAxialTilt)
        _planetPivot.setRotationFromAxisAngle(VEC_Z, v)
        break
      }
      case '_planetRotation': {
        const vRad = degToRad(isNaN(LG_PARAMETERS.planetRotation) ? 0 : LG_PARAMETERS.planetRotation)
        const cloudsRotationRad = degToRad(isNaN(LG_PARAMETERS.cloudsRotation) ? 0 : LG_PARAMETERS.cloudsRotation)
        _planet.setRotationFromAxisAngle(_planet.up, vRad)
        _clouds.setRotationFromAxisAngle(_clouds.up, vRad + cloudsRotationRad)
        break
      }

      // --------------------------------------------------
      // |                Surface settings                |
      // --------------------------------------------------
      case '_planetSurfaceShowBumps': {
        const v = LG_PARAMETERS.planetSurfaceShowBumps
        const mat = _planet.material as CustomShaderMaterial
        mat.uniforms.u_bump = { value: v }
        mat.needsUpdate = true
        break
      }
      case '_planetSurfaceBumpStrength': {
        const v = LG_PARAMETERS.planetSurfaceBumpStrength
        const mat = _planet.material as CustomShaderMaterial
        mat.uniforms.u_bump_strength = { value: v }
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
        mat.uniforms.u_cr_size = { value: v.definedSteps.length }
        mat.uniforms.u_cr_colors = { value: v.colors },
        mat.uniforms.u_cr_positions = { value: v.factors },
        mat.needsUpdate = true
        break
      }
     
      // --------------------------------------------------
      // |                 Biome settings                 |
      // --------------------------------------------------
      case '_biomesEnabled': {
        const v = LG_PARAMETERS.biomesEnabled
        const mat = _planet.material as CustomShaderMaterial
        mat.uniforms.u_show_poles = { value: LG_PARAMETERS.biomePolesEnabled && v }
        mat.needsUpdate = true
        break
      }
      case '_biomePolesEnabled': {
        const v = LG_PARAMETERS.biomePolesEnabled
        const mat = _planet.material as CustomShaderMaterial
        mat.uniforms.u_show_poles = { value: v }
        mat.needsUpdate = true
        break
      }
      
      // --------------------------------------------------
      // |                Clouds settings                 |
      // --------------------------------------------------
      case '_cloudsEnabled': {
        const v = LG_PARAMETERS.cloudsEnabled
        _clouds.visible = v
        break
      }
      case '_cloudsRotation': {
        const planetRotationRad = degToRad(isNaN(LG_PARAMETERS.planetRotation) ? 0 : LG_PARAMETERS.planetRotation)
        const vRad = degToRad(isNaN(LG_PARAMETERS.cloudsRotation) ? 0 : LG_PARAMETERS.cloudsRotation) 
        _clouds.setRotationFromAxisAngle(_clouds.up, planetRotationRad + vRad)
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
      case '_cloudsColor': {
        const v = LG_PARAMETERS.cloudsColor
        const mat = _clouds.material as CustomShaderMaterial
        mat.uniforms.u_color = { value: v }
        mat.needsUpdate = true
        break
      }
      case '_cloudsColorRamp': {
        const v = LG_PARAMETERS.cloudsColorRamp
        const mat = _clouds.material as CustomShaderMaterial
        mat.uniforms.u_cr_size = { value: v.definedSteps.length }
        mat.uniforms.u_cr_colors = { value: v.colors },
        mat.uniforms.u_cr_positions = { value: v.factors },
        mat.needsUpdate = true
        break
      }

      // --------------------------------------------------
      // |               Atmosphere settings              |
      // --------------------------------------------------
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