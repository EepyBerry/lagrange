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
import { LG_HEIGHT_DIVIDER, LG_NAME_AMBLIGHT, LG_PARAMETERS } from '@core/globals';
import { degToRad } from 'three/src/math/MathUtils.js';
import { GeometryType } from '@core/types';
import type CustomShaderMaterial from 'three-custom-shader-material/dist/declarations/src/vanilla';
import { createControls } from '@/core/three/component.builder';
import { useHead } from '@unhead/vue';
import type { SceneElements } from '@/core/models/scene-elements.model';

useHead({ meta: [
  { name: 'description', content: 'A procedural planet building app' }
]})

// THREE canvas/scene root
const sceneRoot: Ref<any> = ref(null)
const showSpinner: Ref<boolean> = ref(true)

// Main THREE objects
let $se: SceneElements
let _planetPivot: THREE.Group
let _planet: THREE.Mesh
let _clouds: THREE.Mesh
let _atmosphere: THREE.Mesh
let _sunLight: THREE.DirectionalLight
let _ambLight: THREE.AmbientLight
let _lensFlare: THREE.Mesh

const VEC_TILT = new THREE.Vector3(-1, 0, 0)

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
  const b = new THREE.BoxGeometry(1,1,1)
  $se.scene.add(new THREE.Mesh(b))
  const planet = ThreeUtils.createPlanet(GeometryType.SPHERE)
  const clouds = ThreeUtils.createClouds(GeometryType.SPHERE)
  const atmosphere = ThreeUtils.createAtmosphere(GeometryType.SPHERE, _sunLight.position)
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
  $se.scene.add(sun.sun)
  _sunLight = sun.sun
  _ambLight = $se.scene.getObjectByName(LG_NAME_AMBLIGHT) as THREE.AmbientLight
  _lensFlare = sun.lensFlareEffect
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

function setShaderMaterialUniform(mat: CustomShaderMaterial | THREE.ShaderMaterial, uname: string, uvalue: any): void {
  mat.uniforms[uname] = { value: uvalue }
  mat.needsUpdate = true
}
function setShaderMaterialUniforms(mat: CustomShaderMaterial, unames: string[], uvalues: any[]): void {
  for (let i = 0; i < unames.length; i++) {
    mat.uniforms[unames[i]] = { value: uvalues[i] }
  }
  mat.needsUpdate = true
}

function updatePlanet() {
  if (LG_PARAMETERS.changedProps.length === 0) { return }
  for (const key of LG_PARAMETERS.changedProps) {
    switch (key) {
      // --------------------------------------------------
      // |               Lighting settings                |
      // --------------------------------------------------
      case '_lensFlareEnabled': {
        _lensFlare.visible = LG_PARAMETERS.lensFlareEnabled
        break
      }
      case '_sunLightColor': {
        _sunLight.color = LG_PARAMETERS.sunLightColor
        setShaderMaterialUniform(
          _lensFlare.material as THREE.ShaderMaterial,
          'colorGain',
          LG_PARAMETERS.sunLightColor
        )
        break
      }
      case '_sunLightIntensity': {
        _sunLight.intensity = LG_PARAMETERS.sunLightIntensity
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
        _planetPivot.setRotationFromAxisAngle(VEC_TILT, v)
        break
      }
      case '_planetRotation': {
        const vRad = degToRad(isNaN(LG_PARAMETERS.planetRotation) ? 0 : LG_PARAMETERS.planetRotation)
        const cloudsRotationRad = degToRad(isNaN(LG_PARAMETERS.cloudsRotation) ? 0 : LG_PARAMETERS.cloudsRotation)
        _planet.setRotationFromAxisAngle(_planet.up, vRad)
        _clouds.setRotationFromAxisAngle(_clouds.up, vRad + cloudsRotationRad)
        break
      }
      case '_planetWaterRoughness': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_water_roughness',
          LG_PARAMETERS.planetWaterRoughness
        )
        break
      }
      case '_planetWaterMetalness': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_water_metalness',
          LG_PARAMETERS.planetWaterMetalness
        )
        break
      }
      case '_planetGroundRoughness': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_ground_roughness',
          LG_PARAMETERS.planetGroundRoughness
        )
        break
      }
      case '_planetGroundMetalness': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_ground_metalness',
          LG_PARAMETERS.planetGroundMetalness
        )
        break
      }
      case '_planetWaterLevel': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_water_level',
          LG_PARAMETERS.planetWaterLevel
        )
        break
      }

      // --------------------------------------------------
      // |                Surface settings                |
      // --------------------------------------------------
      case '_planetSurfaceShowBumps': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_bump',
          LG_PARAMETERS.planetSurfaceShowBumps
        )
        break
      }
      case '_planetSurfaceBumpStrength': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_bump_strength',
          LG_PARAMETERS.planetSurfaceBumpStrength
        )
        break
      }
      case '_planetSurfaceNoise._frequency': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_frequency',
          LG_PARAMETERS.planetSurfaceNoise.frequency
        )
        break
      }
      case '_planetSurfaceNoise._amplitude': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_amplitude',
          LG_PARAMETERS.planetSurfaceNoise.amplitude
        )
        break
      }
      case '_planetSurfaceNoise._lacunarity': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_lacunarity',
          LG_PARAMETERS.planetSurfaceNoise.lacunarity
        )
        break
      }
      case '_planetSurfaceColorRamp': {
        const v = LG_PARAMETERS.planetSurfaceColorRamp
        setShaderMaterialUniforms(
          _planet.material as CustomShaderMaterial,
          ['u_cr_size', 'u_cr_colors', 'u_cr_positions'],
          [v.definedSteps.length, v.colors, v.factors]
        )
        break
      }
     
      // --------------------------------------------------
      // |                 Biome settings                 |
      // --------------------------------------------------
      case '_biomesEnabled': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_show_poles',
          LG_PARAMETERS.biomesEnabled && LG_PARAMETERS.biomePolesEnabled
        )
        break
      }
      case '_biomePolesEnabled': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_show_poles',
          LG_PARAMETERS.biomePolesEnabled
        )
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
        setShaderMaterialUniform(
          _clouds.material as CustomShaderMaterial,
          'u_frequency',
          LG_PARAMETERS.cloudsNoise.frequency
        )
        break
      }
      case '_cloudsNoise._amplitude': {
        setShaderMaterialUniform(
          _clouds.material as CustomShaderMaterial,
          'u_amplitude',
          LG_PARAMETERS.cloudsNoise.amplitude
        )
        break
      }
      case '_cloudsNoise._lacunarity': {
        setShaderMaterialUniform(
          _clouds.material as CustomShaderMaterial,
          'u_lacunarity',
          LG_PARAMETERS.cloudsNoise.lacunarity
        )
        break
      }
      case '_cloudsColor': {
        setShaderMaterialUniform(
          _clouds.material as CustomShaderMaterial,
          'u_color',
          LG_PARAMETERS.cloudsColor
        )
        break
      }
      case '_cloudsColorRamp': {
        const v = LG_PARAMETERS.cloudsColorRamp
        setShaderMaterialUniforms(
          _clouds.material as CustomShaderMaterial,
          ['u_cr_size', 'u_cr_colors', 'u_cr_positions'],
          [v.definedSteps.length, v.colors, v.factors]
        )
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
      case '_atmosphereHeight': {
        const atmosHeight = (LG_PARAMETERS.atmosphereHeight / LG_HEIGHT_DIVIDER)
        setShaderMaterialUniform(
          _atmosphere.material as CustomShaderMaterial,
          'u_radius',
          LG_PARAMETERS.initPlanetRadius + atmosHeight
        )
        break
      }
      case '_atmosphereDensityScale': {
        setShaderMaterialUniform(
          _atmosphere.material as CustomShaderMaterial,
          'u_density',
          LG_PARAMETERS.atmosphereDensityScale / LG_HEIGHT_DIVIDER
        )
        break
      }
      case '_atmosphereHue': {
        setShaderMaterialUniform(
          _atmosphere.material as CustomShaderMaterial,
          'u_hue',
          LG_PARAMETERS.atmosphereHue
        )
        break
      }
      case '_atmosphereIntensity': {
        setShaderMaterialUniform(
          _atmosphere.material as CustomShaderMaterial,
          'u_intensity',
          LG_PARAMETERS.atmosphereIntensity
        )
        break
      }
    }
  }
  LG_PARAMETERS.clearChangedProps()
}
</script>