<template>
  <div id="editor-header" :class="{ compact: !!showCompactNavigation }">
    <AppNavigation :compact-mode="showCompactNavigation" />
    <PlanetInfoControls :compact-mode="showCompactInfo" />
  </div>
  <CompactPlanetEditorControls v-if="showCompactControls" />
  <PlanetEditorControls v-else />

  <div ref="sceneRoot" id="scene-root"></div>
  <OverlaySpinner :load="showSpinner" />
</template>

<script setup lang="ts">
import PlanetEditorControls from '@components/controls/PlanetEditorControls.vue'
import PlanetInfoControls from '@components/controls/PlanetInfoControls.vue'
import { onMounted, onUnmounted, ref, type Ref } from 'vue'
import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js'
import * as EditorService from '@/core/planet-editor.service'
import {
  AXIS_NX,
  AXIS_X,
  MD_WIDTH_THRESHOLD,
  XS_WIDTH_THRESHOLD,
  SM_WIDTH_THRESHOLD,
  LG_HEIGHT_DIVIDER,
  LG_NAME_AMBLIGHT,
  LG_PARAMETERS,
  SUN_INIT_POS,
} from '@core/globals'
import { degToRad } from 'three/src/math/MathUtils.js'
import { GeometryType } from '@core/types'
import type CustomShaderMaterial from 'three-custom-shader-material/dist/declarations/src/vanilla'
import { createControls } from '@core/three/component.builder'
import { useHead } from '@unhead/vue'
import type { SceneElements } from '@core/models/scene-elements.model'
import type { LensFlareEffect } from '@core/three/lens-flare.effect'
import { idb, KeyBindingAction } from '@/dexie.config'
import { WindowEventBus } from '@core/window-event-bus'
import { useI18n } from 'vue-i18n'
import CompactPlanetEditorControls from '@/components/controls/CompactPlanetEditorControls.vue'
import AppNavigation from '@/components/main/AppNavigation.vue'
import { setShaderMaterialUniform, setShaderMaterialUniforms } from '@/utils/three-utils'

const i18n = useI18n()
useHead({
  title: i18n.t('editor.$title') + ' · ' + i18n.t('main.$title'),
  meta: [{ name: 'description', content: 'Planet editor' }],
})

// Responsiveness
const centerInfoControls: Ref<boolean> = ref(true)
const showCompactInfo: Ref<boolean> = ref(false)
const showCompactControls: Ref<boolean> = ref(false)
const showCompactNavigation: Ref<boolean> = ref(false)

// THREE canvas/scene root
const sceneRoot: Ref<any> = ref(null)
const showSpinner: Ref<boolean> = ref(true)
const clock = new THREE.Clock()

// Main THREE objects
let $se: SceneElements
let _planetPivot: THREE.Group
let _planet: THREE.Mesh
let _clouds: THREE.Mesh
let _atmosphere: THREE.Mesh
let _sunLight: THREE.DirectionalLight
let _ambLight: THREE.AmbientLight
let _lensFlare: LensFlareEffect

onMounted(() => init())
onUnmounted(() => {
  disposeScene()
  WindowEventBus.deregisterWindowEventListener('resize', onWindowResize)
  WindowEventBus.deregisterWindowEventListener('keydown', handleKeyboardEvent)
})

function init() {
  // Determine UI modes on start
  computeResponsiveness()

  const width = window.innerWidth,
    height = window.innerHeight,
    pixelRatio = window.devicePixelRatio
  let effectiveWidth = width,
    effectiveHeight = height
  
  if (showCompactControls.value) {
    effectiveWidth = window.outerWidth
    effectiveHeight = window.outerHeight * 0.6
  }

  // Init scene
  $se = EditorService.createScene(effectiveWidth, effectiveHeight, pixelRatio)
  initLighting()
  initPlanet()
  initRendering(effectiveWidth, effectiveHeight)
  createControls($se.camera, $se.renderer.domElement)
  WindowEventBus.registerWindowEventListener('resize', onWindowResize)
  WindowEventBus.registerWindowEventListener('keydown', handleKeyboardEvent)
  showSpinner.value = false
}

function initRendering(width: number, height: number) {
  const stats = new Stats()
  stats.dom.style.right = '0'
  stats.dom.style.left = 'auto'
  stats.dom.ariaHidden = 'true'
  // document.body.appendChild(stats.dom)

  $se.renderer.setSize(width, height)
  $se.renderer.setAnimationLoop(() => renderFrame(stats))
  $se.renderer.domElement.ariaLabel = '3D planet viewer'
  sceneRoot.value.appendChild($se.renderer.domElement)
}

function initPlanet(): void {
  const b = new THREE.BoxGeometry(1, 1, 1)
  $se.scene.add(new THREE.Mesh(b))
  const planet = EditorService.createPlanet(GeometryType.SPHERE)
  const clouds = EditorService.createClouds(GeometryType.SPHERE)
  const atmosphere = EditorService.createAtmosphere(GeometryType.SPHERE, _sunLight.position)
  const pivot = new THREE.Group()
  pivot.add(planet)
  pivot.add(clouds)
  pivot.add(atmosphere)
  $se.scene.add(pivot)
  _planet = planet
  _clouds = clouds
  _atmosphere = atmosphere
  _planetPivot = pivot

  // Set initial rotations
  _planetPivot.setRotationFromAxisAngle(AXIS_NX, degToRad(LG_PARAMETERS.planetAxialTilt))
  _planet.setRotationFromAxisAngle(_planet.up, degToRad(LG_PARAMETERS.planetRotation))
  _clouds.setRotationFromAxisAngle(_clouds.up, degToRad(LG_PARAMETERS.planetRotation + LG_PARAMETERS.cloudsRotation))

  //const helper = new VertexNormalsHelper( planet, 0.1, 0xff0000 );
  //$se.scene.add( helper );

  // Set initial name
  LG_PARAMETERS.planetName = i18n.t('editor.default_planet_name')
}

function initLighting(): void {
  const sun = EditorService.createSun()
  const lensFlare = EditorService.createLensFlare(sun.position, sun.color)
  sun.add(lensFlare.mesh)
  $se.scene.add(sun)
  _sunLight = sun
  _ambLight = $se.scene.getObjectByName(LG_NAME_AMBLIGHT) as THREE.AmbientLight
  _lensFlare = lensFlare

  // Set initial rotations
  const pos = SUN_INIT_POS.clone()
  pos.applyAxisAngle(AXIS_X, degToRad(-15))
  _sunLight.position.set(pos.x, pos.y, pos.z)
  _lensFlare.updatePosition(_sunLight.position)
}

/**
 * Removes every object from the scene, then removes the scene itself
 */
function disposeScene() {

  console.debug('[unmount] Clearing scene...')
  _sunLight.dispose()
  _ambLight.dispose()
  $se.scene.remove(_sunLight)
  $se.scene.remove(_ambLight);

  _lensFlare.material.dispose()
  _lensFlare.mesh.geometry.dispose()
  $se.scene.remove(_lensFlare.mesh);

  (_planet.material as THREE.Material).dispose()
  _planet.geometry.dispose()
  $se.scene.remove(_planet);

  (_clouds.material as THREE.Material).dispose()
  _clouds.geometry.dispose()
  $se.scene.remove(_clouds);

  (_atmosphere.material as THREE.Material).dispose()
  _atmosphere.geometry.dispose()
  $se.scene.remove(_atmosphere);

  _planetPivot.clear()
  $se.scene.remove(_planetPivot)

  $se.scene.remove($se.camera)
  $se.renderer.dispose()
  console.debug('[unmount] ...done!')
}

// ------------------------------------------------------------------------------------------------

async function handleKeyboardEvent(event: KeyboardEvent) {
  const keyBinds = await idb.keyBindings.toArray()
  const kb = keyBinds.find((k) => k.key === event.key.toUpperCase())
  if (!kb) return

  switch (kb.action) {
    case KeyBindingAction.ToggleLensFlare:
      LG_PARAMETERS.lensFlareEnabled = !LG_PARAMETERS.lensFlareEnabled
      break
    case KeyBindingAction.ToggleClouds:
      LG_PARAMETERS.cloudsEnabled = !LG_PARAMETERS.cloudsEnabled
      break
    case KeyBindingAction.ToggleAtmosphere:
      LG_PARAMETERS.atmosphereEnabled = !LG_PARAMETERS.atmosphereEnabled
      break
    case KeyBindingAction.ToggleBiomes:
      LG_PARAMETERS.biomesEnabled = !LG_PARAMETERS.biomesEnabled
      break
  }
}

// ------------------------------------------------------------------------------------------------

function renderFrame(stats: Stats) {
  stats.update()
  updatePlanet()
  _lensFlare.update($se.renderer, $se.scene, $se.camera, clock)
  $se.renderer.render($se.scene, $se.camera)
}

function onWindowResize() {
  computeResponsiveness()

  let effectiveWidth = window.innerWidth,
    effectiveHeight = window.innerHeight

  if (showCompactControls.value) {
    effectiveWidth = window.outerWidth
    effectiveHeight = window.outerHeight * 0.6
  }

  $se.camera.aspect = effectiveWidth / effectiveHeight
  $se.camera.updateProjectionMatrix()
  $se.renderer.setSize(effectiveWidth, effectiveHeight)
}

function computeResponsiveness() {
  showCompactInfo.value = window.innerWidth <= XS_WIDTH_THRESHOLD
  showCompactControls.value = window.innerWidth <= SM_WIDTH_THRESHOLD && window.innerHeight > window.innerWidth
  showCompactNavigation.value = window.innerWidth < MD_WIDTH_THRESHOLD
  centerInfoControls.value = window.innerWidth > MD_WIDTH_THRESHOLD
}

// ------------------------------------------------------------------------------------------------

function updatePlanet() {
  if (LG_PARAMETERS.changedProps.length === 0) {
    return
  }
  for (const key of LG_PARAMETERS.changedProps) {
    switch (key) {
      // --------------------------------------------------
      // |               Lighting settings                |
      // --------------------------------------------------
      case '_lensFlareEnabled': {
        _lensFlare.mesh.visible = LG_PARAMETERS.lensFlareEnabled
        break
      }
      case '_lensFlarePointsIntensity': {
        setShaderMaterialUniform(_lensFlare.material, 'starPointsIntensity', LG_PARAMETERS.lensFlarePointsIntensity)
        break
      }
      case '_lensFlareGlareIntensity': {
        setShaderMaterialUniform(_lensFlare.material, 'glareIntensity', LG_PARAMETERS.lensFlareGlareIntensity)
        break
      }
      case '_sunLightAngle': {
        const v = degToRad(isNaN(LG_PARAMETERS.sunLightAngle) ? 0 : LG_PARAMETERS.sunLightAngle)
        const newPos = SUN_INIT_POS.clone().applyAxisAngle(AXIS_X, v)
        _sunLight.position.set(newPos.x, newPos.y, newPos.z)
        break
      }
      case '_sunLightColor': {
        _sunLight.color = LG_PARAMETERS.sunLightColor
        setShaderMaterialUniform(_lensFlare.material, 'colorGain', LG_PARAMETERS.sunLightColor)
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
        _planetPivot.setRotationFromAxisAngle(AXIS_NX, v)
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
          LG_PARAMETERS.planetWaterRoughness,
        )
        break
      }
      case '_planetWaterMetalness': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_water_metalness',
          LG_PARAMETERS.planetWaterMetalness,
        )
        break
      }
      case '_planetGroundRoughness': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_ground_roughness',
          LG_PARAMETERS.planetGroundRoughness,
        )
        break
      }
      case '_planetGroundMetalness': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_ground_metalness',
          LG_PARAMETERS.planetGroundMetalness,
        )
        break
      }
      case '_planetWaterLevel': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_water_level',
          LG_PARAMETERS.planetWaterLevel,
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
          LG_PARAMETERS.planetSurfaceShowBumps,
        )
        break
      }
      case '_planetSurfaceBumpStrength': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_bump_strength',
          LG_PARAMETERS.planetSurfaceBumpStrength,
        )
        break
      }
      case '_planetSurfaceNoise._frequency': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_frequency',
          LG_PARAMETERS.planetSurfaceNoise.frequency,
        )
        break
      }
      case '_planetSurfaceNoise._amplitude': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_amplitude',
          LG_PARAMETERS.planetSurfaceNoise.amplitude,
        )
        break
      }
      case '_planetSurfaceNoise._lacunarity': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_lacunarity',
          LG_PARAMETERS.planetSurfaceNoise.lacunarity,
        )
        break
      }
      case '_planetSurfaceColorRamp': {
        const v = LG_PARAMETERS.planetSurfaceColorRamp
        setShaderMaterialUniforms(
          _planet.material as CustomShaderMaterial,
          ['u_cr_size', 'u_cr_colors', 'u_cr_positions'],
          [v.definedSteps.length, v.colors, v.factors],
        )
        break
      }

      // --------------------------------------------------
      // |                 Biome settings                 |
      // --------------------------------------------------
      case '_biomesEnabled': {
        setShaderMaterialUniform(_planet.material as CustomShaderMaterial, 'u_biomes', LG_PARAMETERS.biomesEnabled)
        break
      }
      case '_biomePolesEnabled': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_show_poles',
          LG_PARAMETERS.biomePolesEnabled,
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
          LG_PARAMETERS.cloudsNoise.frequency,
        )
        break
      }
      case '_cloudsNoise._amplitude': {
        setShaderMaterialUniform(
          _clouds.material as CustomShaderMaterial,
          'u_amplitude',
          LG_PARAMETERS.cloudsNoise.amplitude,
        )
        break
      }
      case '_cloudsNoise._lacunarity': {
        setShaderMaterialUniform(
          _clouds.material as CustomShaderMaterial,
          'u_lacunarity',
          LG_PARAMETERS.cloudsNoise.lacunarity,
        )
        break
      }
      case '_cloudsColor': {
        setShaderMaterialUniform(_clouds.material as CustomShaderMaterial, 'u_color', LG_PARAMETERS.cloudsColor)
        break
      }
      case '_cloudsColorRamp': {
        const v = LG_PARAMETERS.cloudsColorRamp
        setShaderMaterialUniforms(
          _clouds.material as CustomShaderMaterial,
          ['u_cr_size', 'u_cr_colors', 'u_cr_positions'],
          [v.definedSteps.length, v.colors, v.factors],
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
        const atmosHeight = LG_PARAMETERS.atmosphereHeight / LG_HEIGHT_DIVIDER
        setShaderMaterialUniform(
          _atmosphere.material as CustomShaderMaterial,
          'u_radius',
          LG_PARAMETERS.initPlanetRadius + atmosHeight,
        )
        break
      }
      case '_atmosphereDensityScale': {
        setShaderMaterialUniform(
          _atmosphere.material as CustomShaderMaterial,
          'u_density',
          LG_PARAMETERS.atmosphereDensityScale / LG_HEIGHT_DIVIDER,
        )
        break
      }
      case '_atmosphereHue': {
        setShaderMaterialUniform(_atmosphere.material as CustomShaderMaterial, 'u_hue', LG_PARAMETERS.atmosphereHue)
        break
      }
      case '_atmosphereIntensity': {
        setShaderMaterialUniform(
          _atmosphere.material as CustomShaderMaterial,
          'u_intensity',
          LG_PARAMETERS.atmosphereIntensity,
        )
        break
      }
    }
  }
  LG_PARAMETERS.clearChangedProps()
}
</script>

<style scoped lang="scss">
#editor-header {
  z-index: 15;
  position: absolute;
  inset: 0 0 auto 0;
  margin: 1rem;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &.compact {
    justify-content: space-between;
  }
}

#scene-root {
  box-shadow: black 5px 10px 10px;
  z-index: 5;
}

@media screen and (max-width: 1199px) {
  #editor-header {
    margin: 0.5rem;
  }
}
</style>
