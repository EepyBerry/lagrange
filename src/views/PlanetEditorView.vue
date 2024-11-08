<template>
  <div id="editor-header" :class="{ compact: !!showCompactNavigation }">
    <AppNavigation :compact-mode="showCompactNavigation" />
    <PlanetInfoControls :compact-mode="showCompactInfo" @rename="patchMetaHead" @save="savePlanet"
      @reset="resetPlanet" />
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
  ATMOSPHERE_HEIGHT_DIVIDER,
  TEXTURE_SIZES,
} from '@core/globals'
import { degToRad } from 'three/src/math/MathUtils.js'
import { createControlsComponent, createRingGeometryComponent } from '@core/three/component.builder'
import { useHead } from '@unhead/vue'
import type { SceneElements } from '@core/models/scene-elements.model'
import type { LensFlareEffect } from '@core/three/lens-flare.effect'
import { idb, KeyBindingAction, type IDBPlanet } from '@/dexie.config'
import { EventBus } from '@/core/event-bus'
import { useI18n } from 'vue-i18n'
import AppNavigation from '@/components/main/AppNavigation.vue'
import { patchMeshUniform, setMatUniform, setMeshUniform, setMeshUniforms } from '@/utils/three-utils'
import { useRoute, useRouter } from 'vue-router'
import PlanetData from '@/core/models/planet-data.model'
import {
  createAtmosphere,
  createClouds,
  createLensFlare,
  createPlanet,
  createRing,
  createScene,
  createSun,
  exportPlanetPreview,
  LG_BUFFER_BIOME,
  LG_BUFFER_CLOUDS,
  LG_BUFFER_RING,
  LG_BUFFER_SURFACE,
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
import { recalculateBiomeTexture, recalculateRampTexture } from '@/core/helpers/texture.helper'
import type { ColorRampStep } from '@/core/models/color-ramp.model'
import { GeometryType } from '@/core/types'

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
const $dataUpdateMap: Map<string, Function> = new Map<string, Function>()
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
let _ringAnchor: THREE.Group

let _planet: THREE.Mesh
let _clouds: THREE.Mesh
let _atmosphere: THREE.Mesh
let _ring: THREE.Mesh
let _sunLight: THREE.DirectionalLight
let _ambLight: THREE.AmbientLight
let _lensFlare: LensFlareEffect

// DataTextures
let _surfaceDataTex: THREE.DataTexture
let _cloudsDataTex: THREE.DataTexture
let _biomeDataTex: THREE.DataTexture
let _ringDataTex: THREE.DataTexture

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
        ; (error.lastChild as HTMLLinkElement).style.color = ''
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
    console.debug(toRaw(LG_PLANET_DATA.value))
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

  // Register data updates
  registerLightingDataUpdates()
  registerPlanetRenderingDataUpdates()
  registerSurfaceDataUpdates()
  registerBiomeDataUpdates()
  registerCloudDataUpdates()
  registerAtmosphereDataUpdates()
  registerRingDataUpdates()

  // Register event listeners
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
  const ring = createRing(LG_PLANET_DATA.value as PlanetData)
  const planetGroup = new THREE.Group()
  planetGroup.add(planet.mesh)
  planetGroup.add(clouds.mesh)
  planetGroup.add(atmosphere)

  const ringAnchor = new THREE.Group()
  ringAnchor.add(ring.mesh)
  planetGroup.add(ringAnchor)

  $se.scene.add(planetGroup)
  _planet = planet.mesh
  _clouds = clouds.mesh
  _atmosphere = atmosphere
  _ring = ring.mesh
  _planetGroup = planetGroup
  _ringAnchor = ringAnchor

  // Set datatextures + data
  _surfaceDataTex = planet.texs[0].texture
  _biomeDataTex = planet.texs[1].texture
  _cloudsDataTex = clouds.texs[0].texture
  _ringDataTex = ring.texs[0].texture

  // Set initial rotations
  _planetGroup.setRotationFromAxisAngle(AXIS_X, degToRad(LG_PLANET_DATA.value.planetAxialTilt))
  _planet.setRotationFromAxisAngle(_planet.up, degToRad(LG_PLANET_DATA.value.planetRotation))
  _clouds.setRotationFromAxisAngle(
    _clouds.up,
    degToRad(LG_PLANET_DATA.value.planetRotation + LG_PLANET_DATA.value.cloudsRotation),
  )
  _ringAnchor.setRotationFromAxisAngle(AXIS_X, degToRad(LG_PLANET_DATA.value.ringAxialTilt))
  _ring.setRotationFromAxisAngle(_ring.up, degToRad(LG_PLANET_DATA.value.ringRotation))

  // Set lighting target
  _sunLight.target = _planetGroup
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
    ; (_planet.material as THREE.Material).dispose()
  _planet.geometry.dispose()
    ; (_clouds.material as THREE.Material).dispose()
  _clouds.geometry.dispose()
    ; (_atmosphere.material as THREE.Material).dispose()
  _atmosphere.geometry.dispose()
    ; (_ring.material as THREE.Material).dispose()
  _ring.geometry.dispose()

  LG_BUFFER_SURFACE.fill(0)
  LG_BUFFER_BIOME.fill(0)
  LG_BUFFER_CLOUDS.fill(0)
  LG_BUFFER_RING.fill(0)
  _surfaceDataTex.dispose()
  _biomeDataTex.dispose()
  _cloudsDataTex.dispose()
  _ringAnchor.clear()
  _planetGroup.clear()

  $se.scene.children.forEach((c) => $se.scene.remove(c))
  $se.renderer.dispose()
  console.debug('[unmount] ...done!')
}

// ------------------------------------------------------------------------------------------------

// prettier-ignore
function registerLightingDataUpdates(): void {
  $dataUpdateMap.set('_lensFlareEnabled',         () => _lensFlare.mesh.visible = LG_PLANET_DATA.value.lensFlareEnabled)
  $dataUpdateMap.set('_lensFlarePointsIntensity', () => setMeshUniform(_lensFlare, 'starPointsIntensity', LG_PLANET_DATA.value.lensFlarePointsIntensity))
  $dataUpdateMap.set('_lensFlareGlareIntensity',  () => setMeshUniform(_lensFlare, 'glareIntensity', LG_PLANET_DATA.value.lensFlareGlareIntensity))
  $dataUpdateMap.set('_sunLightAngle', () => {
    const v = degToRad(isNaN(LG_PLANET_DATA.value.sunLightAngle) ? 0 : LG_PLANET_DATA.value.sunLightAngle)
    const newPos = SUN_INIT_POS.clone().applyAxisAngle(AXIS_X, v)
    _sunLight.position.set(newPos.x, newPos.y, newPos.z)
  })
  $dataUpdateMap.set('_sunLightColor', () => {
    _sunLight.color.set(LG_PLANET_DATA.value.sunLightColor)
    setMeshUniform(_lensFlare, 'colorGain', LG_PLANET_DATA.value.sunLightColor)
  })
  $dataUpdateMap.set('_sunLightIntensity', () => _sunLight.intensity = LG_PLANET_DATA.value.sunLightIntensity)
  $dataUpdateMap.set('_ambLightColor',     () => _ambLight.color.set(LG_PLANET_DATA.value.ambLightColor))
  $dataUpdateMap.set('_ambLightIntensity', () => _ambLight.intensity = LG_PLANET_DATA.value.ambLightIntensity)
}

// prettier-ignore
function registerPlanetRenderingDataUpdates(): void {
  $dataUpdateMap.set('_planetRadius', () => {
    const v = LG_PLANET_DATA.value.planetRadius
    const atmosHeight = LG_PLANET_DATA.value.atmosphereHeight / ATMOSPHERE_HEIGHT_DIVIDER
    _planetGroup.scale.setScalar(v)
    setMeshUniform(_planet, 'u_radius', v)
    setMeshUniforms(_atmosphere, ['u_surface_radius', 'u_radius'], [v, v + atmosHeight])
  })
  $dataUpdateMap.set('_planetAxialTilt', () => {
    const v = degToRad(isNaN(LG_PLANET_DATA.value.planetAxialTilt) ? 0 : LG_PLANET_DATA.value.planetAxialTilt)
    _planetGroup.setRotationFromAxisAngle(AXIS_X, v)
  })
  $dataUpdateMap.set('_planetRotation', () => {
    const vRad = degToRad(isNaN(LG_PLANET_DATA.value.planetRotation) ? 0 : LG_PLANET_DATA.value.planetRotation)
    const cloudsRotationRad = degToRad(
      isNaN(LG_PLANET_DATA.value.cloudsRotation) ? 0 : LG_PLANET_DATA.value.cloudsRotation,
    )
    _planet.setRotationFromAxisAngle(_planet.up, vRad)
    _clouds.setRotationFromAxisAngle(_clouds.up, vRad + cloudsRotationRad)
  })
  $dataUpdateMap.set('_planetWaterRoughness',  () => patchMeshUniform(_planet, 'u_pbr_params', { wrough: LG_PLANET_DATA.value.planetWaterRoughness }))
  $dataUpdateMap.set('_planetWaterMetalness',  () => patchMeshUniform(_planet, 'u_pbr_params', { wmetal: LG_PLANET_DATA.value.planetWaterMetalness }))
  $dataUpdateMap.set('_planetGroundRoughness', () => patchMeshUniform(_planet, 'u_pbr_params', { grough: LG_PLANET_DATA.value.planetGroundRoughness }))
  $dataUpdateMap.set('_planetGroundMetalness', () => patchMeshUniform(_planet, 'u_pbr_params', { gmetal: LG_PLANET_DATA.value.planetGroundMetalness }))
  $dataUpdateMap.set('_planetWaterLevel',      () => patchMeshUniform(_planet, 'u_pbr_params', { wlevel: LG_PLANET_DATA.value.planetWaterLevel }))
}

// prettier-ignore
function registerSurfaceDataUpdates(): void {
  $dataUpdateMap.set('_planetSurfaceShowBumps',                () => setMeshUniform(_planet,   'u_bump', LG_PLANET_DATA.value.planetSurfaceShowBumps))
  $dataUpdateMap.set('_planetSurfaceBumpStrength',             () => setMeshUniform(_planet,   'u_bump_strength', LG_PLANET_DATA.value.planetSurfaceBumpStrength))
  // Displacement
  $dataUpdateMap.set('_planetSurfaceShowDisplacement',         () => setMeshUniform(_planet,   'u_displace', LG_PLANET_DATA.value.planetSurfaceShowDisplacement))
  $dataUpdateMap.set('_planetSurfaceDisplacement._factor',     () => patchMeshUniform(_planet, 'u_surface_displacement', { fac: LG_PLANET_DATA.value.planetSurfaceDisplacement.factor }))
  $dataUpdateMap.set('_planetSurfaceDisplacement._epsilon',    () => patchMeshUniform(_planet, 'u_surface_displacement', { eps: LG_PLANET_DATA.value.planetSurfaceDisplacement.epsilon }))
  $dataUpdateMap.set('_planetSurfaceDisplacement._multiplier', () => patchMeshUniform(_planet, 'u_surface_displacement', { mul: LG_PLANET_DATA.value.planetSurfaceDisplacement.multiplier }))
  $dataUpdateMap.set('_planetSurfaceDisplacement._frequency',  () => patchMeshUniform(_planet, 'u_surface_displacement', { freq: LG_PLANET_DATA.value.planetSurfaceDisplacement.frequency }))
  $dataUpdateMap.set('_planetSurfaceDisplacement._amplitude',  () => patchMeshUniform(_planet, 'u_surface_displacement', { amp: LG_PLANET_DATA.value.planetSurfaceDisplacement.amplitude }))
  $dataUpdateMap.set('_planetSurfaceDisplacement._lacunarity', () => patchMeshUniform(_planet, 'u_surface_displacement', { lac: LG_PLANET_DATA.value.planetSurfaceDisplacement.lacunarity }))
  $dataUpdateMap.set('_planetSurfaceDisplacement._octaves',    () => patchMeshUniform(_planet, 'u_surface_displacement', { oct: LG_PLANET_DATA.value.planetSurfaceDisplacement.octaves }))
  // Noise
  $dataUpdateMap.set('_planetSurfaceNoise._frequency',         () => patchMeshUniform(_planet, 'u_surface_noise', { freq: LG_PLANET_DATA.value.planetSurfaceNoise.frequency }))
  $dataUpdateMap.set('_planetSurfaceNoise._amplitude',         () => patchMeshUniform(_planet, 'u_surface_noise', { amp: LG_PLANET_DATA.value.planetSurfaceNoise.amplitude }))
  $dataUpdateMap.set('_planetSurfaceNoise._lacunarity',        () => patchMeshUniform(_planet, 'u_surface_noise', { lac: LG_PLANET_DATA.value.planetSurfaceNoise.lacunarity }))
  $dataUpdateMap.set('_planetSurfaceNoise._octaves',           () => patchMeshUniform(_planet, 'u_surface_noise', { oct: LG_PLANET_DATA.value.planetSurfaceNoise.octaves }))
  $dataUpdateMap.set('_planetSurfaceNoise._layers',            () => patchMeshUniform(_planet, 'u_surface_noise', { layers: LG_PLANET_DATA.value.planetSurfaceNoise.layers }))
  // Warping
  $dataUpdateMap.set('_planetSurfaceShowWarping',              () => setMeshUniform(_planet,   'u_warp', LG_PLANET_DATA.value.planetSurfaceShowWarping))
  $dataUpdateMap.set('_planetSurfaceNoise._warpFactor',        () => patchMeshUniform(_planet, 'u_surface_noise', {
    xwarp: LG_PLANET_DATA.value.planetSurfaceNoise.xWarpFactor,
    ywarp: LG_PLANET_DATA.value.planetSurfaceNoise.yWarpFactor,
    zwarp: LG_PLANET_DATA.value.planetSurfaceNoise.zWarpFactor
  }))
  $dataUpdateMap.set('_planetSurfaceColorRamp',         () => {
    const v = LG_PLANET_DATA.value.planetSurfaceColorRamp
    recalculateRampTexture(LG_BUFFER_SURFACE, TEXTURE_SIZES.SURFACE, v.steps as ColorRampStep[])
    _surfaceDataTex.needsUpdate = true
  })
}

// prettier-ignore
function registerBiomeDataUpdates(): void {
  $dataUpdateMap.set('_biomesEnabled',                      () => setMeshUniform(_planet, 'u_biomes', LG_PLANET_DATA.value.biomesEnabled))
  // Temperature
  $dataUpdateMap.set('_biomesTemperatureMode',              () => patchMeshUniform(_planet, 'u_temp_noise', { mode: LG_PLANET_DATA.value.biomesTemperatureMode }))
  $dataUpdateMap.set('_biomesTemperatureNoise._frequency',  () => patchMeshUniform(_planet, 'u_temp_noise', { lac: LG_PLANET_DATA.value.biomesTemperatureNoise.frequency }))
  $dataUpdateMap.set('_biomesTemperatureNoise._amplitude',  () => patchMeshUniform(_planet, 'u_temp_noise', { amp: LG_PLANET_DATA.value.biomesTemperatureNoise.amplitude }))
  $dataUpdateMap.set('_biomesTemperatureNoise._lacunarity', () => patchMeshUniform(_planet, 'u_temp_noise', { lac: LG_PLANET_DATA.value.biomesTemperatureNoise.lacunarity }))
  $dataUpdateMap.set('_biomesTemperatureNoise._octaves',    () => patchMeshUniform(_planet, 'u_temp_noise', { oct: LG_PLANET_DATA.value.biomesTemperatureNoise.octaves }))
  // Humidity
  $dataUpdateMap.set('_biomesHumidityMode',                 () => patchMeshUniform(_planet, 'u_humi_noise', { mode: LG_PLANET_DATA.value.biomesHumidityMode }))
  $dataUpdateMap.set('_biomesHumidityNoise._frequency',     () => patchMeshUniform(_planet, 'u_humi_noise', { lac: LG_PLANET_DATA.value.biomesHumidityNoise.frequency }))
  $dataUpdateMap.set('_biomesHumidityNoise._amplitude',     () => patchMeshUniform(_planet, 'u_humi_noise', { amp: LG_PLANET_DATA.value.biomesHumidityNoise.amplitude }))
  $dataUpdateMap.set('_biomesHumidityNoise._lacunarity',    () => patchMeshUniform(_planet, 'u_humi_noise', { lac: LG_PLANET_DATA.value.biomesHumidityNoise.lacunarity }))
  $dataUpdateMap.set('_biomesHumidityNoise._octaves',       () => patchMeshUniform(_planet, 'u_humi_noise', { oct: LG_PLANET_DATA.value.biomesHumidityNoise.octaves }))
  $dataUpdateMap.set('_biomesParameters', () => {
    recalculateBiomeTexture(LG_BUFFER_BIOME, TEXTURE_SIZES.BIOME, LG_PLANET_DATA.value.biomesParams as BiomeParameters[])
    _biomeDataTex.needsUpdate = true
  })
}

// prettier-ignore
function registerCloudDataUpdates(): void {
  $dataUpdateMap.set('_cloudsEnabled',  () => _clouds.visible = LG_PLANET_DATA.value.cloudsEnabled)
  $dataUpdateMap.set('_cloudsRotation', () => {
    const planetRotation = degToRad(isNaN(LG_PLANET_DATA.value.planetRotation) ? 0 : LG_PLANET_DATA.value.planetRotation)
    const v = degToRad(isNaN(LG_PLANET_DATA.value.cloudsRotation) ? 0 : LG_PLANET_DATA.value.cloudsRotation)
    _clouds.setRotationFromAxisAngle(_clouds.up, planetRotation + v)
  })
  $dataUpdateMap.set('_cloudsShowWarping',       () => setMeshUniform(_clouds,   'u_warp', LG_PLANET_DATA.value.cloudsShowWarping))
  $dataUpdateMap.set('_cloudsNoise._frequency',  () => patchMeshUniform(_clouds, 'u_noise', { freq: LG_PLANET_DATA.value.cloudsNoise.frequency }))
  $dataUpdateMap.set('_cloudsNoise._amplitude',  () => patchMeshUniform(_clouds, 'u_noise', { amp: LG_PLANET_DATA.value.cloudsNoise.amplitude }))
  $dataUpdateMap.set('_cloudsNoise._lacunarity', () => patchMeshUniform(_clouds, 'u_noise', { lac: LG_PLANET_DATA.value.cloudsNoise.lacunarity }))
  $dataUpdateMap.set('_cloudsNoise._octaves',    () => patchMeshUniform(_clouds, 'u_noise', { oct: LG_PLANET_DATA.value.cloudsNoise.octaves }))
  $dataUpdateMap.set('_cloudsNoise._warpFactor', () => patchMeshUniform(_clouds, 'u_noise', {
    xwarp: LG_PLANET_DATA.value.cloudsNoise.xWarpFactor,
    ywarp: LG_PLANET_DATA.value.cloudsNoise.yWarpFactor,
    zwarp: LG_PLANET_DATA.value.cloudsNoise.zWarpFactor,
  }))
  $dataUpdateMap.set('_cloudsColor',             () =>  setMeshUniform(_clouds, 'u_color', LG_PLANET_DATA.value.cloudsColor))
  $dataUpdateMap.set('_cloudsColorRamp',         () =>  {
    const v = LG_PLANET_DATA.value.cloudsColorRamp
    recalculateRampTexture(LG_BUFFER_CLOUDS, TEXTURE_SIZES.CLOUDS, v.steps as ColorRampStep[])
    _cloudsDataTex.needsUpdate = true
  })
}

// prettier-ignore
function registerAtmosphereDataUpdates(): void {
  $dataUpdateMap.set('_atmosphereEnabled', () => _atmosphere.visible = LG_PLANET_DATA.value.atmosphereEnabled)
  $dataUpdateMap.set('_atmosphereHeight',  () => {
    const atmosHeight = LG_PLANET_DATA.value.atmosphereHeight / ATMOSPHERE_HEIGHT_DIVIDER
    setMeshUniform(_atmosphere, 'u_radius', LG_PLANET_DATA.value.planetRadius + atmosHeight)
  })
  $dataUpdateMap.set('_atmosphereDensityScale', () => setMeshUniform(_atmosphere, 'u_density', LG_PLANET_DATA.value.atmosphereDensityScale / ATMOSPHERE_HEIGHT_DIVIDER))
  $dataUpdateMap.set('_atmosphereIntensity',    () => setMeshUniform(_atmosphere, 'u_intensity', LG_PLANET_DATA.value.atmosphereIntensity))
  $dataUpdateMap.set('_atmosphereColorMode',    () => setMeshUniform(_atmosphere, 'u_color_mode', LG_PLANET_DATA.value.atmosphereColorMode))
  $dataUpdateMap.set('_atmosphereHue',          () => setMeshUniform(_atmosphere, 'u_hue', LG_PLANET_DATA.value.atmosphereHue))
  $dataUpdateMap.set('_atmosphereTint',         () => setMeshUniform(_atmosphere, 'u_tint', LG_PLANET_DATA.value.atmosphereTint))
}


// prettier-ignore
function registerRingDataUpdates(): void {
  $dataUpdateMap.set('_ringEnabled', () => _ring.visible = LG_PLANET_DATA.value.ringEnabled)
  $dataUpdateMap.set('_ringInnerRadius', () => {
    _ring.geometry.dispose()
    _ring.geometry = createRingGeometryComponent(LG_PLANET_DATA.value.ringInnerRadius, LG_PLANET_DATA.value.ringOuterRadius)
    setMeshUniform(_ring, 'u_inner_radius', LG_PLANET_DATA.value.ringInnerRadius)
  })
  
  $dataUpdateMap.set('_ringOuterRadius', () => setMeshUniform(_ring, 'u_outer_radius', LG_PLANET_DATA.value.ringOuterRadius))
  $dataUpdateMap.set('_ringColorRamp', () => {
    const v = LG_PLANET_DATA.value.ringColorRamp
    recalculateRampTexture(LG_BUFFER_RING, TEXTURE_SIZES.RING, v.steps as ColorRampStep[])
    _ringDataTex.needsUpdate = true
  })
}

// ------------------------------------------------------------------------------------------------

async function handleKeyboardEvent(event: KeyboardEvent) {
  const keyBinds = await idb.keyBindings.toArray()
  const kb = keyBinds.find((k) => k.key === event.key.toUpperCase())
  if (!kb) return
  if (event.shiftKey && kb.key !== 'SHIFT') {
    return
  }
  if (event.ctrlKey && kb.key !== 'CONTROL') {
    return
  }
  if (event.altKey && kb.key !== 'ALT') {
    return
  }

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
        saveAs(blob!, `${LG_PLANET_DATA.value.planetName.replaceAll(' ', '_')}-${new Date().toISOString()}.png`)
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
    ring: _ring.clone()
  })
  _lensFlare.mesh.visible = true

  // ----------- Save planet data ------------ //
  console.debug(toRaw(LG_PLANET_DATA.value))
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
  for (let changedProp of LG_PLANET_DATA.value.changedProps.filter(ch => !!ch.prop)) {
    let key = changedProp.prop
    // Check for additional info, separated by |
    key = changedProp.prop.split('|')[0]
    $dataUpdateMap.get(key)?.()
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

  &>canvas {
    background: transparent;
  }
}

@media screen and (max-width: 1199px) {
  #editor-header {
    margin: 0.5rem;
  }
}
</style>
