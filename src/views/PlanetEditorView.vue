<template>
  <div id="editor-header" :class="{ compact: !!showCompactNavigation }">
    <AppNavigation :compact-mode="showCompactNavigation" />
    <PlanetInfoControls
      :compact-mode="showCompactInfo"
      @rename="patchMetaHead"
      @save="savePlanet"
      @reset="resetPlanet"
    />
  </div>
  <PlanetEditorControls :compact-mode="showCompactControls" />

  <div ref="sceneRoot" id="scene-root"></div>
  <OverlaySpinner :load="showSpinner" />
  <AppWebGLErrorDialog ref="webglErrorDialogRef" @close="redirectToCodex" />
  <AppPlanetErrorDialog ref="planetErrorDialogRef" @close="redirectToCodex" />
</template>

<script setup lang="ts">
import PlanetEditorControls from '@components/controls/PlanetEditorControls.vue'
import PlanetInfoControls from '@components/controls/PlanetInfoControls.vue'
import { onMounted, onUnmounted, ref, toRaw, type Ref } from 'vue'
import * as THREE from 'three'
import {
  AXIS_X,
  MD_WIDTH_THRESHOLD,
  XS_WIDTH_THRESHOLD,
  SM_WIDTH_THRESHOLD,
  LG_NAME_AMBLIGHT,
  SUN_INIT_POS,
  BIOME_TEXTURE_SIZE,
  SURFACE_TEXTURE_SIZE,
} from '@core/globals'
import { degToRad } from 'three/src/math/MathUtils.js'
import type CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import { createControlsComponent } from '@core/three/component.builder'
import { useHead } from '@unhead/vue'
import type { SceneElements } from '@core/models/scene-elements.model'
import type { LensFlareEffect } from '@core/three/lens-flare.effect'
import { idb, KeyBindingAction, type IDBPlanet } from '@/dexie.config'
import { EventBus } from '@/core/event-bus'
import { useI18n } from 'vue-i18n'
import AppNavigation from '@/components/main/AppNavigation.vue'
import { setShaderMaterialUniform, setShaderMaterialUniforms } from '@/utils/three-utils'
import { useRoute, useRouter } from 'vue-router'
import PlanetData from '@/core/models/planet-data.model'
import {
  createAtmosphere,
  createClouds,
  createLensFlare,
  createPlanet,
  createScene,
  createSun,
  exportPlanetPreview,
  LG_HEIGHT_DIVIDER,
  LG_PLANET_DATA,
} from '@/core/services/planet-editor.service'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { getPlanetMetaTitle } from '@/utils/utils'
import { saveAs } from 'file-saver'
import { nanoid } from 'nanoid'
import type { BiomeParameters } from '@/core/models/biome-parameters.model'
import WebGL from 'three/addons/capabilities/WebGL.js'
import AppWebGLErrorDialog from '@/components/dialogs/AppWebGLErrorDialog.vue'
import AppPlanetErrorDialog from '@/components/dialogs/AppPlanetErrorDialog.vue'
import { DebugUtils } from '@/utils/debug-utils'
import { recalculateBiomeTexture, recalculateRampTexture } from '@/core/helpers/texture.helper'
import type { ColorRampStep } from '@/core/models/color-ramp.model'

const route = useRoute()
const router = useRouter()
const i18n = useI18n()
const head = useHead({
  title: i18n.t('editor.$title') + ' · ' + i18n.t('main.$title'),
  meta: [{ name: 'description', content: 'Planet editor' }],
})!

// Warnings
const webglErrorDialogRef: Ref<{ openWithError: Function } | null> = ref(null)
const planetErrorDialogRef: Ref<{ openWithError: Function } | null> = ref(null)
let loadedCorrectly = false

// Data
const $planetEntityId: Ref<string> = ref('')
let enableEditorRendering = true

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
let _planetGroup: THREE.Group
let _planet: THREE.Mesh
let _clouds: THREE.Mesh
let _atmosphere: THREE.Mesh
let _sunLight: THREE.DirectionalLight
let _ambLight: THREE.AmbientLight
let _lensFlare: LensFlareEffect

// DataTextures
let _surfaceData: Uint8Array
let _surfaceDataTex: THREE.DataTexture
let _cloudsData: Uint8Array
let _cloudsDataTex: THREE.DataTexture
let _biomeData: Uint8Array
let _biomeDataTex: THREE.DataTexture

onMounted(async () => {
  await bootstrapEditor()
})
onUnmounted(() => {
  if (loadedCorrectly) {
    disposeScene()
  }
  EventBus.deregisterWindowEventListener('resize', onWindowResize)
  EventBus.deregisterWindowEventListener('keydown', handleKeyboardEvent)
})

async function bootstrapEditor() {
  try {
    if (WebGL.isWebGL2Available()) {
      await initData()
      await initCanvas()
      loadedCorrectly = true
    } else {
      showSpinner.value = false
      const error = WebGL.getWebGL2ErrorMessage()
      error.style.margin = ''
      error.style.background = ''
      error.style.color = ''
      error.style.fontFamily = ''
      error.style.fontSize = ''
      error.style.width = ''
      ;(error.lastChild as HTMLLinkElement).style.color = ''
      webglErrorDialogRef.value!.openWithError(error)
    }
  } catch (error: any) {
    console.error(error)
    showSpinner.value = false
    planetErrorDialogRef.value!.openWithError(error, error.stack)
  }
}

function redirectToCodex() {
  showSpinner.value = true
  router.push('/codex')
}

async function initData() {
  // https://stackoverflow.com/questions/3891641/regex-test-only-works-every-other-time
  if ((route.params.id as string).length > 3) {
    const idbPlanetData = await idb.planets.filter((p) => p.id === route.params.id).first()
    if (!idbPlanetData) {
      console.warn(`Cannot find planet with ID: ${route.params.id}`)
      LG_PLANET_DATA.value.reset()
      throw new Error(`Planet with ID [${route.params.id}] doesn't exist.`)
    }
    $planetEntityId.value = idbPlanetData.id
    LG_PLANET_DATA.value.loadData(idbPlanetData.data)
    console.info(`Loaded planet [${LG_PLANET_DATA.value.planetName}] with ID: ${$planetEntityId.value}`)
  } else {
    console.warn('No planet ID found in the URL, assuming new planet')
    LG_PLANET_DATA.value.reset()
  }
  patchMetaHead()
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
  createControlsComponent($se.camera, $se.renderer.domElement)
  //$se.camera.setRotationFromAxisAngle(AXIS_Y, degToRad(-60))
  EventBus.registerWindowEventListener('resize', onWindowResize)
  EventBus.registerWindowEventListener('keydown', handleKeyboardEvent)
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
  const planet = createPlanet(LG_PLANET_DATA.value as PlanetData)
  const clouds = createClouds(LG_PLANET_DATA.value as PlanetData)
  const atmosphere = createAtmosphere(LG_PLANET_DATA.value as PlanetData, _sunLight.position)
  const pivot = new THREE.Group()
  pivot.add(planet.mesh)
  pivot.add(clouds.mesh)
  pivot.add(atmosphere)
  $se.scene.add(pivot)
  _planet = planet.mesh
  _clouds = clouds.mesh
  _atmosphere = atmosphere
  _planetGroup = pivot

  // Set datatextures + data
  _surfaceData = planet.texs[0].data
  _surfaceDataTex = planet.texs[0].texture
  _cloudsData = clouds.texs[0].data
  _cloudsDataTex = clouds.texs[0].texture
  _biomeData = planet.texs[1].data
  _biomeDataTex = planet.texs[1].texture

  // Set initial rotations
  _planetGroup.setRotationFromAxisAngle(AXIS_X, degToRad(LG_PLANET_DATA.value.planetAxialTilt))
  _planet.setRotationFromAxisAngle(_planet.up, degToRad(LG_PLANET_DATA.value.planetRotation))
  _clouds.setRotationFromAxisAngle(
    _clouds.up,
    degToRad(LG_PLANET_DATA.value.planetRotation + LG_PLANET_DATA.value.cloudsRotation),
  )
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
  $se.scene.remove(_ambLight)

  _lensFlare.material.dispose()
  _lensFlare.mesh.geometry.dispose()
  ;(_planet.material as THREE.Material).dispose()
  _planet.geometry.dispose()
  ;(_clouds.material as THREE.Material).dispose()
  _clouds.geometry.dispose()
  ;(_atmosphere.material as THREE.Material).dispose()
  _atmosphere.geometry.dispose()

  _biomeData.fill(0)
  _biomeDataTex.dispose()
  _planetGroup.clear()

  $se.scene.children.forEach((c) => $se.scene.remove(c))
  $se.renderer.dispose()
  console.debug('[unmount] ...done!')
}

// ------------------------------------------------------------------------------------------------

async function handleKeyboardEvent(event: KeyboardEvent) {
  const keyBinds = await idb.keyBindings.toArray()
  const kb = keyBinds.find((k) => k.key === event.key.toUpperCase())
  if (!kb) return
  if (event.shiftKey && kb.key !== 'SHIFT') { return }
  if (event.ctrlKey && kb.key !== 'CONTROL') { return }
  if (event.altKey && kb.key !== 'ALT') { return }

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
    case KeyBindingAction.TakeScreenshot: {
      $se.renderer.domElement.toBlob((blob) => {
        saveAs(blob!, `${LG_PLANET_DATA.value.planetName}-${new Date().toISOString()}.png`)
      }, 'image/png')
      break
    }
  }
}

function patchMetaHead() {
  head!.patch({ title: getPlanetMetaTitle(LG_PLANET_DATA.value.planetName, i18n) })
}

// ------------------------------------------------------------------------------------------------

function renderFrame(stats: Stats) {
  if (!enableEditorRendering) {
    return
  }
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

  // -------- Generate planet preview -------- //
  enableEditorRendering = false
  _lensFlare.mesh.visible = false
  const previewDataString = exportPlanetPreview($se, {
    sun: _sunLight.clone(),
    ambientLight: _ambLight.clone(),
    planet: _planet.clone(),
    clouds: _clouds.clone(),
    atmosphere: _atmosphere.clone(),
  })
  _lensFlare.mesh.visible = true

  // ----------- Save planet data ------------ //
  const localData = toRaw(JSON.stringify(LG_PLANET_DATA.value))
  const idbData: IDBPlanet = {
    id: $planetEntityId.value.length > 0 ? $planetEntityId.value : nanoid(),
    version: '2',
    data: JSON.parse(localData),
    preview: previewDataString,
  }
  await idb.planets.put(idbData, idbData.id)
  $planetEntityId.value = idbData.id

  enableEditorRendering = true
  showSpinner.value = false
  EventBus.sendToastEvent('success', 'toast.save_success', 3000)
}

function updatePlanet() {
  if (LG_PLANET_DATA.value.changedProps.length === 0) {
    return
  }

  const planetMaterial = _planet.material as CustomShaderMaterial
  const atmosphereMaterial = _atmosphere.material as CustomShaderMaterial
  const cloudsMaterial = _clouds.material as CustomShaderMaterial
  for (let changedProp of LG_PLANET_DATA.value.changedProps) {
    if (!changedProp.prop) {
      continue
    }
    let key = changedProp.prop

    // Check for additional info, separated by |
    let biomeId = undefined
    if (key.includes('|')) {
      biomeId = (key.startsWith('_biomesParameters') ? key.split('|')[1] : undefined)
      key = key.split('|')[0]
    }

    // Loop on changed props
    switch (key) {
      // --------------------------------------------------
      // |               Lighting settings                |
      // --------------------------------------------------
      case '_lensFlareEnabled': {
        _lensFlare.mesh.visible = LG_PLANET_DATA.value.lensFlareEnabled
        break
      }
      case '_lensFlarePointsIntensity': {
        setShaderMaterialUniform(
          _lensFlare.material,
          'starPointsIntensity',
          LG_PLANET_DATA.value.lensFlarePointsIntensity,
        )
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
        _sunLight.color.set(LG_PLANET_DATA.value.sunLightColor)
        setShaderMaterialUniform(_lensFlare.material, 'colorGain', LG_PLANET_DATA.value.sunLightColor)
        break
      }
      case '_sunLightIntensity': {
        _sunLight.intensity = LG_PLANET_DATA.value.sunLightIntensity
        break
      }
      case '_ambLightColor': {
        _ambLight.color.set(LG_PLANET_DATA.value.ambLightColor)
        break
      }
      case '_ambLightIntensity': {
        _ambLight.intensity = LG_PLANET_DATA.value.ambLightIntensity
        break
      }

      // --------------------------------------------------
      // |                Planet settings                 |
      // --------------------------------------------------
      case '_planetRadius': {
        const v = LG_PLANET_DATA.value.planetRadius
        const atmosHeight = LG_PLANET_DATA.value.atmosphereHeight / LG_HEIGHT_DIVIDER
        _planetGroup.scale.set(v, v, v)
        setShaderMaterialUniform(planetMaterial, 'u_radius', v)
        setShaderMaterialUniforms(
          atmosphereMaterial,
          ['u_surface_radius', 'u_radius'],
          [v, v + atmosHeight],
        )
        break
      }
      case '_planetAxialTilt': {
        const v = degToRad(isNaN(LG_PLANET_DATA.value.planetAxialTilt) ? 0 : LG_PLANET_DATA.value.planetAxialTilt)
        _planetGroup.setRotationFromAxisAngle(AXIS_X, v)
        break
      }
      case '_planetRotation': {
        const vRad = degToRad(isNaN(LG_PLANET_DATA.value.planetRotation) ? 0 : LG_PLANET_DATA.value.planetRotation)
        const cloudsRotationRad = degToRad(
          isNaN(LG_PLANET_DATA.value.cloudsRotation) ? 0 : LG_PLANET_DATA.value.cloudsRotation,
        )
        _planet.setRotationFromAxisAngle(_planet.up, vRad)
        _clouds.setRotationFromAxisAngle(_clouds.up, vRad + cloudsRotationRad)
        break
      }
      case '_planetWaterRoughness': {
        setShaderMaterialUniform(planetMaterial, 'u_pbr_params', {
          ...planetMaterial.uniforms['u_pbr_params'].value,
          wrough: LG_PLANET_DATA.value.planetWaterRoughness,
        })
        break
      }
      case '_planetWaterMetalness': {
        setShaderMaterialUniform(planetMaterial, 'u_pbr_params', {
          ...planetMaterial.uniforms['u_pbr_params'].value,
          wmetal: LG_PLANET_DATA.value.planetWaterMetalness,
        })
        break
      }
      case '_planetGroundRoughness': {
        setShaderMaterialUniform(planetMaterial, 'u_pbr_params', {
          ...planetMaterial.uniforms['u_pbr_params'].value,
          grough: LG_PLANET_DATA.value.planetGroundRoughness,
        })
        break
      }
      case '_planetGroundMetalness': {
        setShaderMaterialUniform(planetMaterial, 'u_pbr_params', {
          ...planetMaterial.uniforms['u_pbr_params'].value,
          gmetal: LG_PLANET_DATA.value.planetGroundMetalness,
        })
        break
      }
      case '_planetWaterLevel': {
        setShaderMaterialUniform(planetMaterial, 'u_pbr_params', {
          ...planetMaterial.uniforms['u_pbr_params'].value,
          wlevel: LG_PLANET_DATA.value.planetWaterLevel,
        })
        break
      }

      // --------------------------------------------------
      // |                Surface settings                |
      // --------------------------------------------------
      case '_planetSurfaceShowBumps': {
        setShaderMaterialUniform(
          planetMaterial,
          'u_bump',
          LG_PLANET_DATA.value.planetSurfaceShowBumps,
        )
        break
      }
      case '_planetSurfaceBumpStrength': {
        setShaderMaterialUniform(
          planetMaterial,
          'u_bump_strength',
          LG_PLANET_DATA.value.planetSurfaceBumpStrength,
        )
        break
      }
      case '_planetSurfaceNoise._frequency': {
        setShaderMaterialUniform(planetMaterial, 'u_surface_noise', {
          ...planetMaterial.uniforms['u_surface_noise'].value,
          freq: LG_PLANET_DATA.value.planetSurfaceNoise.frequency,
        })
        break
      }
      case '_planetSurfaceNoise._amplitude': {
        setShaderMaterialUniform(planetMaterial, 'u_surface_noise', {
          ...planetMaterial.uniforms['u_surface_noise'].value,
          amp: LG_PLANET_DATA.value.planetSurfaceNoise.amplitude,
        })
        break
      }
      case '_planetSurfaceNoise._lacunarity': {
        setShaderMaterialUniform(planetMaterial, 'u_surface_noise', {
          ...planetMaterial.uniforms['u_surface_noise'].value,
          lac: LG_PLANET_DATA.value.planetSurfaceNoise.lacunarity,
        })
        break
      }
      case '_planetSurfaceNoise._octaves': {
        setShaderMaterialUniform(planetMaterial, 'u_surface_noise', {
          ...planetMaterial.uniforms['u_surface_noise'].value,
          oct: LG_PLANET_DATA.value.planetSurfaceNoise.octaves,
        })
        break
      }
      case '_planetSurfaceColorRamp': {
        const v = LG_PLANET_DATA.value.planetSurfaceColorRamp
        recalculateRampTexture(_surfaceData, SURFACE_TEXTURE_SIZE, v.steps as ColorRampStep[])
        _surfaceDataTex.needsUpdate = true
        DebugUtils.surfaceData.set(_surfaceData, 0)
        break
      }

      // --------------------------------------------------
      // |                 Biome settings                 |
      // --------------------------------------------------
      case '_biomesEnabled': {
        setShaderMaterialUniform(
          planetMaterial,
          'u_biomes',
          LG_PLANET_DATA.value.biomesEnabled,
        )
        break
      }
      case '_biomesTemperatureMode': {
        setShaderMaterialUniform(planetMaterial, 'u_temp_noise', {
          ...planetMaterial.uniforms['u_temp_noise'].value,
          mode: LG_PLANET_DATA.value.biomesTemperatureMode,
        })
        break
      }
      case '_biomesTemperatureNoise._frequency': {
        setShaderMaterialUniform(planetMaterial, 'u_temp_noise', {
          ...planetMaterial.uniforms['u_temp_noise'].value,
          lac: LG_PLANET_DATA.value.biomesTemperatureNoise.frequency,
        })
        break
      }
      case '_biomesTemperatureNoise._amplitude': {
        setShaderMaterialUniform(planetMaterial, 'u_temp_noise', {
          ...planetMaterial.uniforms['u_temp_noise'].value,
          amp: LG_PLANET_DATA.value.biomesTemperatureNoise.amplitude,
        })
        break
      }
      case '_biomesTemperatureNoise._lacunarity': {
        setShaderMaterialUniform(planetMaterial, 'u_temp_noise', {
          ...planetMaterial.uniforms['u_temp_noise'].value,
          lac: LG_PLANET_DATA.value.biomesTemperatureNoise.lacunarity,
        })
        break
      }
      case '_biomesTemperatureNoise._octaves': {
        setShaderMaterialUniform(planetMaterial, 'u_temp_noise', {
          ...planetMaterial.uniforms['u_temp_noise'].value,
          oct: LG_PLANET_DATA.value.biomesTemperatureNoise.octaves,
        })
        break
      }
      case '_biomesHumidityMode': {
        setShaderMaterialUniform(planetMaterial, 'u_humi_noise', {
          ...planetMaterial.uniforms['u_humi_noise'].value,
          mode: LG_PLANET_DATA.value.biomesHumidityMode,
        })
        break
      }
      case '_biomesHumidityNoise._frequency': {
        setShaderMaterialUniform(planetMaterial, 'u_humi_noise', {
          ...planetMaterial.uniforms['u_humi_noise'].value,
          lac: LG_PLANET_DATA.value.biomesHumidityNoise.frequency,
        })
        break
      }
      case '_biomesHumidityNoise._amplitude': {
        setShaderMaterialUniform(planetMaterial, 'u_humi_noise', {
          ...planetMaterial.uniforms['u_humi_noise'].value,
          amp: LG_PLANET_DATA.value.biomesHumidityNoise.amplitude,
        })
        break
      }
      case '_biomesHumidityNoise._lacunarity': {
        setShaderMaterialUniform(planetMaterial, 'u_humi_noise', {
          ...planetMaterial.uniforms['u_humi_noise'].value,
          lac: LG_PLANET_DATA.value.biomesHumidityNoise.lacunarity,
        })
        break
      }
      case '_biomesHumidityNoise._octaves': {
        setShaderMaterialUniform(planetMaterial, 'u_humi_noise', {
          ...planetMaterial.uniforms['u_humi_noise'].value,
          oct: LG_PLANET_DATA.value.biomesHumidityNoise.octaves,
        })
        break
      }
      case '_biomesParameters': {
        recalculateBiomeTexture(_biomeData, BIOME_TEXTURE_SIZE, LG_PLANET_DATA.value.biomesParams as BiomeParameters[])
        DebugUtils.biomeData.set(_biomeData, 0)
        _biomeDataTex.needsUpdate = true
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
        const planetRotationRad = degToRad(
          isNaN(LG_PLANET_DATA.value.planetRotation) ? 0 : LG_PLANET_DATA.value.planetRotation,
        )
        const vRad = degToRad(isNaN(LG_PLANET_DATA.value.cloudsRotation) ? 0 : LG_PLANET_DATA.value.cloudsRotation)
        _clouds.setRotationFromAxisAngle(_clouds.up, planetRotationRad + vRad)
        break
      }
      case '_cloudsNoise._frequency': {
        setShaderMaterialUniform(cloudsMaterial, 'u_noise', {
          ...cloudsMaterial.uniforms['u_noise'].value,
          freq: LG_PLANET_DATA.value.cloudsNoise.frequency,
        })
        break
      }
      case '_cloudsNoise._amplitude': {
        setShaderMaterialUniform(cloudsMaterial, 'u_noise', {
          ...cloudsMaterial.uniforms['u_noise'].value,
          amp: LG_PLANET_DATA.value.cloudsNoise.amplitude,
        })
        break
      }
      case '_cloudsNoise._lacunarity': {
        setShaderMaterialUniform(cloudsMaterial, 'u_noise', {
          ...cloudsMaterial.uniforms['u_noise'].value,
          lac: LG_PLANET_DATA.value.cloudsNoise.lacunarity,
        })
        break
      }
      case '_cloudsNoise._octaves': {
        setShaderMaterialUniform(cloudsMaterial, 'u_noise', {
          ...cloudsMaterial.uniforms['u_noise'].value,
          oct: LG_PLANET_DATA.value.cloudsNoise.octaves,
        })
        break
      }
      case '_cloudsColor': {
        setShaderMaterialUniform(cloudsMaterial, 'u_color', LG_PLANET_DATA.value.cloudsColor)
        break
      }
      case '_cloudsColorRamp': {
        const v = LG_PLANET_DATA.value.cloudsColorRamp
        recalculateRampTexture(_cloudsData, SURFACE_TEXTURE_SIZE, v.steps as ColorRampStep[])
        _cloudsDataTex.needsUpdate = true
        DebugUtils.cloudsData.set(_surfaceData, 0)
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
          atmosphereMaterial,
          'u_radius',
          LG_PLANET_DATA.value.planetRadius + atmosHeight,
        )
        break
      }
      case '_atmosphereDensityScale': {
        setShaderMaterialUniform(
          atmosphereMaterial,
          'u_density',
          LG_PLANET_DATA.value.atmosphereDensityScale / LG_HEIGHT_DIVIDER,
        )
        break
      }
      case '_atmosphereIntensity': {
        setShaderMaterialUniform(
          atmosphereMaterial,
          'u_intensity',
          LG_PLANET_DATA.value.atmosphereIntensity,
        )
        break
      }
      case '_atmosphereColorMode': {
        setShaderMaterialUniform(
          atmosphereMaterial,
          'u_color_mode',
          LG_PLANET_DATA.value.atmosphereColorMode,
        )
        break
      }
      case '_atmosphereHue': {
        setShaderMaterialUniform(
          atmosphereMaterial,
          'u_hue',
          LG_PLANET_DATA.value.atmosphereHue,
        )
        break
      }
      case '_atmosphereTint': {
        setShaderMaterialUniform(
          atmosphereMaterial,
          'u_tint',
          LG_PLANET_DATA.value.atmosphereTint,
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

  & > canvas {
    background: transparent;
  }
}

@media screen and (max-width: 1199px) {
  #editor-header {
    margin: 0.5rem;
  }
}
</style>
