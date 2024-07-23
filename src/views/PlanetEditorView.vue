<template>
  <div id="editor-header" :class="{ compact: !!showCompactNavigation }">
    <AppNavigation :compact-mode="showCompactNavigation" />
    <PlanetInfoControls :compact-mode="showCompactInfo" @data-save="savePlanet" @data-reset="resetPlanet" />
  </div>
  <CompactPlanetEditorControls v-if="showCompactControls" />
  <PlanetEditorControls v-else />

  <div ref="sceneRoot" id="scene-root"></div>
  <OverlaySpinner :load="showSpinner" />
</template>

<script setup lang="ts">
import PlanetEditorControls from '@components/controls/PlanetEditorControls.vue'
import PlanetInfoControls from '@components/controls/PlanetInfoControls.vue'
import { onMounted, onUnmounted, ref, toRaw, type Ref } from 'vue'
import * as THREE from 'three'
import {
  AXIS_NX,
  AXIS_X,
  MD_WIDTH_THRESHOLD,
  XS_WIDTH_THRESHOLD,
  SM_WIDTH_THRESHOLD,
  LG_NAME_AMBLIGHT,
  SUN_INIT_POS,
  UUID_REGEXP,
} from '@core/globals'
import { degToRad, generateUUID } from 'three/src/math/MathUtils.js'
import type CustomShaderMaterial from 'three-custom-shader-material/dist/declarations/src/vanilla'
import { createControlsComponent } from '@core/three/component.builder'
import { useHead } from '@unhead/vue'
import type { SceneElements } from '@core/models/scene-elements.model'
import type { LensFlareEffect } from '@core/three/lens-flare.effect'
import { idb, KeyBindingAction, type IDBPlanet } from '@/dexie.config'
import { WindowEventBus } from '@core/window-event-bus'
import { useI18n } from 'vue-i18n'
import CompactPlanetEditorControls from '@/components/controls/CompactPlanetEditorControls.vue'
import AppNavigation from '@/components/main/AppNavigation.vue'
import { setShaderMaterialUniform, setShaderMaterialUniforms } from '@/utils/three-utils'
import { useRoute } from 'vue-router'
import PlanetData from '@/core/models/planet-data.model'
import { 
  createAtmosphere,
  createClouds,
  createLensFlare,
  createPlanet,
  createScene,
  createSun,
  LG_HEIGHT_DIVIDER,
  LG_PLANET_DATA
} from '@/core/planet-editor.service'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import type { OrbitControls } from 'three/examples/jsm/Addons.js'
import { saveAs } from 'file-saver'

const route = useRoute()
const i18n = useI18n()
useHead({
  title: i18n.t('editor.$title') + ' · ' + i18n.t('main.$title'),
  meta: [{ name: 'description', content: 'Planet editor' }],
})

// Data
const $planetEntityId: Ref<string> = ref('')

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
let _controls: OrbitControls
let _planetPivot: THREE.Group
let _planet: THREE.Mesh
let _clouds: THREE.Mesh
let _atmosphere: THREE.Mesh
let _sunLight: THREE.DirectionalLight
let _ambLight: THREE.AmbientLight
let _lensFlare: LensFlareEffect

onMounted(async () => {
  await initData()
  await initCanvas()
})
onUnmounted(() => {
  disposeScene()
  WindowEventBus.deregisterWindowEventListener('resize', onWindowResize)
  WindowEventBus.deregisterWindowEventListener('keydown', handleKeyboardEvent)
})

async function initData() {
  // https://stackoverflow.com/questions/3891641/regex-test-only-works-every-other-time
  if (new RegExp(UUID_REGEXP).test(route.params.id as string)) {
    const idbPlanetData = await idb.planets.filter(p => p.id === route.params.id).first()
    if (!idbPlanetData) {
      console.warn(`Cannot find planet with ID: ${route.params.id}`)
      LG_PLANET_DATA.value.reset()
      return
    }
    $planetEntityId.value = idbPlanetData.id
    LG_PLANET_DATA.value.loadData(idbPlanetData.data)
    console.info(`Loaded planet [${LG_PLANET_DATA.value.planetName}] with ID: ${$planetEntityId.value}`)
  } else {
    console.warn('No planet ID found in the URL, assuming new planet')
    LG_PLANET_DATA.value.reset()
  }
}

async function initCanvas() {
  // Determine UI modes on start
  computeResponsiveness()

  const width = window.innerWidth,
    height = window.innerHeight,
    pixelRatio = window.devicePixelRatio
  let effectiveWidth = width,
    effectiveHeight = height
  
  if (showCompactControls.value) {
    effectiveWidth = window.outerWidth
    effectiveHeight = window.outerHeight * 0.5
  }

  // Init scene & objects
  $se = createScene(LG_PLANET_DATA.value as PlanetData, effectiveWidth, effectiveHeight, pixelRatio)
  initLighting()
  initPlanet()
  initRendering(effectiveWidth, effectiveHeight)
  _controls = createControlsComponent($se.camera, $se.renderer.domElement)
  WindowEventBus.registerWindowEventListener('resize', onWindowResize)
  WindowEventBus.registerWindowEventListener('keydown', handleKeyboardEvent)
  showSpinner.value = false
}

// ------------------------------------------------------------------------------------------------

function initLighting(): void {
  const sun = createSun(LG_PLANET_DATA.value as PlanetData)
  const lensFlare = createLensFlare(LG_PLANET_DATA.value as PlanetData, sun.position, sun.color)
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

function initPlanet(): void {
  const b = new THREE.BoxGeometry(1, 1, 1)
  $se.scene.add(new THREE.Mesh(b))
  const planet = createPlanet(LG_PLANET_DATA.value as PlanetData)
  const clouds = createClouds(LG_PLANET_DATA.value as PlanetData)
  const atmosphere = createAtmosphere(LG_PLANET_DATA.value as PlanetData, _sunLight.position)
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
  _planetPivot.setRotationFromAxisAngle(AXIS_NX, degToRad(LG_PLANET_DATA.value.planetAxialTilt))
  _planet.setRotationFromAxisAngle(_planet.up, degToRad(LG_PLANET_DATA.value.planetRotation))
  _clouds.setRotationFromAxisAngle(_clouds.up, degToRad(LG_PLANET_DATA.value.planetRotation + LG_PLANET_DATA.value.cloudsRotation))
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
      LG_PLANET_DATA.value.lensFlareEnabled = !LG_PLANET_DATA.value.lensFlareEnabled
      break
    case KeyBindingAction.ToggleClouds:
      LG_PLANET_DATA.value.cloudsEnabled = !LG_PLANET_DATA.value.cloudsEnabled
      break
    case KeyBindingAction.ToggleAtmosphere:
      LG_PLANET_DATA.value.atmosphereEnabled = !LG_PLANET_DATA.value.atmosphereEnabled
      break
    case KeyBindingAction.ToggleBiomes:
      LG_PLANET_DATA.value.biomesEnabled = !LG_PLANET_DATA.value.biomesEnabled
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
    effectiveHeight = window.outerHeight * 0.5
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

async function resetPlanet() {
  LG_PLANET_DATA.value.reset()
}

async function savePlanet() {
  showSpinner.value = true

  // ----------- Save planet data ------------ //
  const localData = toRaw(JSON.stringify(LG_PLANET_DATA.value))
  const idbData: IDBPlanet = {
    id: $planetEntityId.value.length > 0 ? $planetEntityId.value : generateUUID(),
    data: JSON.parse(localData)
  }
  const plid = await idb.planets.put(idbData, idbData.id)
  $planetEntityId.value = plid

  // -------- Generate planet preview -------- //
  const initialBackground = $se.scene.background!.clone()
  const initialCamPosition = $se.camera.position.clone()

  const spherical = new THREE.Spherical(LG_PLANET_DATA.value.initCamDistance, Math.PI / 2.0, degToRad(LG_PLANET_DATA.value.initCamAngle))
  spherical.makeSafe()
  $se.camera.position.setFromSpherical(spherical)
  _controls.update()
  _lensFlare.mesh.visible = false

  $se.scene.background = null
  document.body.style.background = 'transparent'
  $se.renderer.render($se.scene, $se.camera)

  const preview = $se.renderer.domElement.toDataURL('image/png')
  saveAs(preview, 'preview.png')

  setTimeout(() => {
    $se.camera.position.set(initialCamPosition.x, initialCamPosition.y, initialCamPosition.z)
    _controls.update()

    $se.scene.background = initialBackground
    document.body.style.background = 'var(--lg-panel)'
    _lensFlare.mesh.visible = true
    showSpinner.value = false
    console.info(`Saved planet [${LG_PLANET_DATA.value.planetName}] with ID: ${plid}`)
  }, 1000)

}

function updatePlanet() {
  if (LG_PLANET_DATA.value.changedProps.length === 0) {
    return
  }
  for (const key of LG_PLANET_DATA.value.changedProps) {
    switch (key) {
      // --------------------------------------------------
      // |               Lighting settings                |
      // --------------------------------------------------
      case '_lensFlareEnabled': {
        _lensFlare.mesh.visible = LG_PLANET_DATA.value.lensFlareEnabled
        break
      }
      case '_lensFlarePointsIntensity': {
        setShaderMaterialUniform(_lensFlare.material, 'starPointsIntensity', LG_PLANET_DATA.value.lensFlarePointsIntensity)
        break
      }
      case '_lensFlareGlareIntensity': {
        setShaderMaterialUniform(_lensFlare.material, 'glareIntensity', LG_PLANET_DATA.value.lensFlareGlareIntensity)
        break
      }
      case '_sunLightAngle': {
        const v = degToRad(isNaN(LG_PLANET_DATA.value.sunLightAngle) ? 0 : LG_PLANET_DATA.value.sunLightAngle)
        const newPos = SUN_INIT_POS.clone().applyAxisAngle(AXIS_X, v)
        _sunLight.position.set(newPos.x, newPos.y, newPos.z)
        break
      }
      case '_sunLightColor': {
        _sunLight.color = LG_PLANET_DATA.value.sunLightColor
        setShaderMaterialUniform(_lensFlare.material, 'colorGain', LG_PLANET_DATA.value.sunLightColor)
        break
      }
      case '_sunLightIntensity': {
        _sunLight.intensity = LG_PLANET_DATA.value.sunLightIntensity
        break
      }
      case '_ambLightColor': {
        _ambLight.color = LG_PLANET_DATA.value.ambLightColor
        break
      }
      case '_ambLightIntensity': {
        _ambLight.intensity = LG_PLANET_DATA.value.ambLightIntensity
        break
      }

      // --------------------------------------------------
      // |                Planet settings                 |
      // --------------------------------------------------
      case '_planetAxialTilt': {
        const v = degToRad(isNaN(LG_PLANET_DATA.value.planetAxialTilt) ? 0 : LG_PLANET_DATA.value.planetAxialTilt)
        _planetPivot.setRotationFromAxisAngle(AXIS_NX, v)
        break
      }
      case '_planetRotation': {
        const vRad = degToRad(isNaN(LG_PLANET_DATA.value.planetRotation) ? 0 : LG_PLANET_DATA.value.planetRotation)
        const cloudsRotationRad = degToRad(isNaN(LG_PLANET_DATA.value.cloudsRotation) ? 0 : LG_PLANET_DATA.value.cloudsRotation)
        _planet.setRotationFromAxisAngle(_planet.up, vRad)
        _clouds.setRotationFromAxisAngle(_clouds.up, vRad + cloudsRotationRad)
        break
      }
      case '_planetWaterRoughness': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_water_roughness',
          LG_PLANET_DATA.value.planetWaterRoughness,
        )
        break
      }
      case '_planetWaterMetalness': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_water_metalness',
          LG_PLANET_DATA.value.planetWaterMetalness,
        )
        break
      }
      case '_planetGroundRoughness': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_ground_roughness',
          LG_PLANET_DATA.value.planetGroundRoughness,
        )
        break
      }
      case '_planetGroundMetalness': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_ground_metalness',
          LG_PLANET_DATA.value.planetGroundMetalness,
        )
        break
      }
      case '_planetWaterLevel': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_water_level',
          LG_PLANET_DATA.value.planetWaterLevel,
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
          LG_PLANET_DATA.value.planetSurfaceShowBumps,
        )
        break
      }
      case '_planetSurfaceBumpStrength': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_bump_strength',
          LG_PLANET_DATA.value.planetSurfaceBumpStrength,
        )
        break
      }
      case '_planetSurfaceNoise._frequency': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_frequency',
          LG_PLANET_DATA.value.planetSurfaceNoise.frequency,
        )
        break
      }
      case '_planetSurfaceNoise._amplitude': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_amplitude',
          LG_PLANET_DATA.value.planetSurfaceNoise.amplitude,
        )
        break
      }
      case '_planetSurfaceNoise._lacunarity': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_lacunarity',
          LG_PLANET_DATA.value.planetSurfaceNoise.lacunarity,
        )
        break
      }
      case '_planetSurfaceColorRamp': {
        const v = LG_PLANET_DATA.value.planetSurfaceColorRamp
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
        setShaderMaterialUniform(_planet.material as CustomShaderMaterial, 'u_biomes', LG_PLANET_DATA.value.biomesEnabled)
        break
      }
      case '_biomePolesEnabled': {
        setShaderMaterialUniform(
          _planet.material as CustomShaderMaterial,
          'u_show_poles',
          LG_PLANET_DATA.value.biomePolesEnabled,
        )
        break
      }

      // --------------------------------------------------
      // |                Clouds settings                 |
      // --------------------------------------------------
      case '_cloudsEnabled': {
        const v = LG_PLANET_DATA.value.cloudsEnabled
        _clouds.visible = v
        break
      }
      case '_cloudsRotation': {
        const planetRotationRad = degToRad(isNaN(LG_PLANET_DATA.value.planetRotation) ? 0 : LG_PLANET_DATA.value.planetRotation)
        const vRad = degToRad(isNaN(LG_PLANET_DATA.value.cloudsRotation) ? 0 : LG_PLANET_DATA.value.cloudsRotation)
        _clouds.setRotationFromAxisAngle(_clouds.up, planetRotationRad + vRad)
        break
      }
      case '_cloudsNoise._frequency': {
        setShaderMaterialUniform(
          _clouds.material as CustomShaderMaterial,
          'u_frequency',
          LG_PLANET_DATA.value.cloudsNoise.frequency,
        )
        break
      }
      case '_cloudsNoise._amplitude': {
        setShaderMaterialUniform(
          _clouds.material as CustomShaderMaterial,
          'u_amplitude',
          LG_PLANET_DATA.value.cloudsNoise.amplitude,
        )
        break
      }
      case '_cloudsNoise._lacunarity': {
        setShaderMaterialUniform(
          _clouds.material as CustomShaderMaterial,
          'u_lacunarity',
          LG_PLANET_DATA.value.cloudsNoise.lacunarity,
        )
        break
      }
      case '_cloudsColor': {
        setShaderMaterialUniform(_clouds.material as CustomShaderMaterial, 'u_color', LG_PLANET_DATA.value.cloudsColor)
        break
      }
      case '_cloudsColorRamp': {
        const v = LG_PLANET_DATA.value.cloudsColorRamp
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
        const v = LG_PLANET_DATA.value.atmosphereEnabled
        _atmosphere.visible = v
        break
      }
      case '_atmosphereHeight': {
        const atmosHeight = LG_PLANET_DATA.value.atmosphereHeight / LG_HEIGHT_DIVIDER
        setShaderMaterialUniform(
          _atmosphere.material as CustomShaderMaterial,
          'u_radius',
          LG_PLANET_DATA.value.initPlanetRadius + atmosHeight,
        )
        break
      }
      case '_atmosphereDensityScale': {
        setShaderMaterialUniform(
          _atmosphere.material as CustomShaderMaterial,
          'u_density',
          LG_PLANET_DATA.value.atmosphereDensityScale / LG_HEIGHT_DIVIDER,
        )
        break
      }
      case '_atmosphereHue': {
        setShaderMaterialUniform(_atmosphere.material as CustomShaderMaterial, 'u_hue', LG_PLANET_DATA.value.atmosphereHue)
        break
      }
      case '_atmosphereIntensity': {
        setShaderMaterialUniform(
          _atmosphere.material as CustomShaderMaterial,
          'u_intensity',
          LG_PLANET_DATA.value.atmosphereIntensity,
        )
        break
      }
    }
  }
  LG_PLANET_DATA.value.clearChangedProps()
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
