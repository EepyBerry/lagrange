<template>
  <div id="editor-header" :class="{ compact: !!showCompactNavigation }">
    <AppNavigation :compact-mode="showCompactNavigation" />
    <PlanetInfoControls
      :compact-mode="showCompactInfo"
      @rename="patchMetaHead"
      @save="savePlanet"
      @copy="savePlanet(true)"
      @reset="resetPlanet"
      @gltf="exportPlanet"
      @random="randPlanet"
    />
  </div>
  <PlanetEditorControls :compact-mode="showCompactControls" />

  <div id="scene-root" ref="sceneRoot"></div>
  <OverlaySpinner :load="showSpinner" />

  <AppWebGLErrorDialog ref="webglErrorDialogRef" @close="redirectToCodex" />
  <AppPlanetErrorDialog ref="planetErrorDialogRef" @close="redirectToCodex" />
  <AppWarnSaveDialog ref="warnSaveDialogRef" @save-confirm="saveAndRedirectToCodex" @confirm="redirectToCodex" />
  <AppExportProgressDialog ref="exportProgressDialogRef" />
</template>

<script setup lang="ts">
import PlanetEditorControls from '@components/controls/PlanetEditorControls.vue'
import PlanetInfoControls from '@components/controls/PlanetInfoControls.vue'
import { onMounted, onUnmounted, ref, toRaw, type Ref } from 'vue'
import * as Globals from '@core/globals'
import { useHead } from '@unhead/vue'
import { idb, KeyBindingAction, type IDBPlanet } from '@/dexie.config'
import { EventBus } from '@/core/event-bus'
import { useI18n } from 'vue-i18n'
import AppNavigation from '@/components/main/AppNavigation.vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import {
  LG_PLANET_DATA,
  bootstrapEditor,
  disposeScene,
  exportPlanetPreview,
  exportPlanetScreenshot,
  exportPlanetToGLTF,
  isPlanetEdited,
  setPlanetEditFlag,
  updateCameraRendering,
  resetPlanet,
  randomizePlanet,
} from '@/core/services/planet-editor.service'
import { getPlanetMetaTitle, sleep } from '@/utils/utils'
import { nanoid } from 'nanoid'
import WebGL from 'three/addons/capabilities/WebGL.js'
import AppWebGLErrorDialog from '@/components/dialogs/AppWebGLErrorDialog.vue'
import AppPlanetErrorDialog from '@/components/dialogs/AppPlanetErrorDialog.vue'
import AppWarnSaveDialog from '@/components/dialogs/AppWarnSaveDialog.vue'
import AppExportProgressDialog from '@/components/dialogs/AppExportProgressDialog.vue'

const route = useRoute()
const router = useRouter()
const i18n = useI18n()
const head = useHead({
  title: i18n.t('editor.$title') + ' · ' + i18n.t('main.$title'),
  meta: [{ name: 'description', content: 'Planet editor' }],
})!

// Dialogs
const webglErrorDialogRef: Ref<{ openWithError: (error: HTMLElement) => void } | null> = ref(null)
const planetErrorDialogRef: Ref<{ openWithError: (error: string, stack?: string) => void } | null> = ref(null)
const warnSaveDialogRef: Ref<{ open: () => void } | null> = ref(null)
const exportProgressDialogRef: Ref<{
  open: () => void
  setProgress: (value: number) => void
  setError: (value: unknown) => void
} | null> = ref(null)
let loadedCorrectly = false

// Data
const $planetEntityId: Ref<string> = ref('')

// Responsiveness
const centerInfoControls: Ref<boolean> = ref(true)
const showCompactInfo: Ref<boolean> = ref(false)
const showCompactControls: Ref<boolean> = ref(false)
const showCompactNavigation: Ref<boolean> = ref(false)

// THREE canvas/scene root
const sceneRoot: Ref<HTMLCanvasElement | null> = ref(null)
const showSpinner: Ref<boolean> = ref(true)

onMounted(async () => {
  await sleep(50)
  await initThree()
})
onUnmounted(() => {
  if (loadedCorrectly) {
    disposeScene()
  }
  EventBus.deregisterWindowEventListener('click', onWindowClick)
  EventBus.deregisterWindowEventListener('resize', onWindowResize)
  EventBus.deregisterWindowEventListener('keydown', onWindowKeydown)
})
onBeforeRouteLeave((_to, _from, next) => {
  if (isPlanetEdited()) {
    next(false)
    warnSaveDialogRef.value?.open()
  } else {
    next()
  }
})

async function initThree() {
  try {
    if (WebGL.isWebGL2Available()) {
      await initData()
      await initCanvas()
      loadedCorrectly = true
    } else {
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
  } catch (error: unknown) {
    console.error(error)
    if (error instanceof Error) {
      planetErrorDialogRef.value!.openWithError(error.message, error.stack)
    } else if (typeof error === 'string') {
      planetErrorDialogRef.value!.openWithError(error, undefined)
    }
  } finally {
    showSpinner.value = false
  }
}

async function saveAndRedirectToCodex() {
  await savePlanet()
  redirectToCodex()
}

function redirectToCodex() {
  setPlanetEditFlag(false) // set edit flag to false to force exit
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

  // Bootstrap editor service
  await bootstrapEditor(sceneRoot.value!, effectiveWidth, effectiveHeight, pixelRatio)

  // Register event listeners
  EventBus.registerWindowEventListener('click', onWindowClick)
  EventBus.registerWindowEventListener('resize', onWindowResize)
  EventBus.registerWindowEventListener('keydown', onWindowKeydown)
}

// ------------------------------------------------------------------------------------------------

async function onWindowClick(event: MouseEvent) {
  EventBus.sendClickEvent(event)
}

async function onWindowKeydown(event: KeyboardEvent) {
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
      exportPlanetScreenshot()
      break
    }
  }
}

function patchMetaHead() {
  head!.patch({ title: getPlanetMetaTitle(LG_PLANET_DATA.value.planetName, i18n) })
}

// ------------------------------------------------------------------------------------------------

function onWindowResize() {
  computeResponsiveness()
  let effectiveWidth = window.innerWidth,
    effectiveHeight = window.innerHeight
  if (showCompactControls.value) {
    effectiveWidth = window.outerWidth
    effectiveHeight = window.outerHeight * 0.5
  }
  updateCameraRendering(effectiveWidth, effectiveHeight)
}

function computeResponsiveness() {
  showCompactInfo.value = window.innerWidth <= Globals.XS_WIDTH_THRESHOLD
  showCompactControls.value = window.innerWidth <= Globals.SM_WIDTH_THRESHOLD && window.innerHeight > window.innerWidth
  showCompactNavigation.value = window.innerWidth < Globals.MD_WIDTH_THRESHOLD
  centerInfoControls.value = window.innerWidth > Globals.MD_WIDTH_THRESHOLD
}

// ------------------------------------------------------------------------------------------------

async function randPlanet() {
  showSpinner.value = true
  await randomizePlanet()
  showSpinner.value = false
}

async function savePlanet(asCopy: boolean = false) {
  showSpinner.value = true
  setPlanetEditFlag(false)

  // -------- Generate planet preview -------- //
  let previewDataString = await exportPlanetPreview()

  // ----------- Save planet data ------------ //
  console.debug(toRaw(LG_PLANET_DATA.value))
  const localData = toRaw(JSON.stringify(LG_PLANET_DATA.value))
  const planetId = asCopy
    ? nanoid()
    : $planetEntityId.value.length > 0 ? $planetEntityId.value : nanoid()
  const idbData: IDBPlanet = {
    id: planetId,
    version: '2',
    data: JSON.parse(localData),
    preview: previewDataString,
  }
  await idb.planets.put(idbData, idbData.id)
  $planetEntityId.value = idbData.id

  showSpinner.value = false
  previewDataString = ''
  router.replace(`/planet-editor/${idbData.id}`)
  EventBus.sendToastEvent('success', 'toast.save_success', 3000)
}

function exportPlanet() {
  exportProgressDialogRef.value!.open()
  exportProgressDialogRef.value!.setProgress(1)
  setTimeout(() => exportPlanetToGLTF(exportProgressDialogRef.value!), 0)
}
</script>

<style scoped lang="scss">
#editor-header {
  z-index: 15;
  position: absolute;
  inset: 0 0 auto 0;
  margin: 1rem 0;

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
