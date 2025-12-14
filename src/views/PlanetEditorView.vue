<template>
  <ViewHeader id="editor-header" class="xs-fullwidth">
    <EditorHeaderControls
      @rename="patchMetaHead"
      @save="savePlanet"
      @copy="savePlanet(true)"
      @reset="resetPlanet"
      @gltf="exportPlanet"
      @random="randPlanet"
    />
    <span class="filler"></span>
  </ViewHeader>
  <EditorSidebarControls :compact-mode="showCompactControls" />

  <div id="scene-root" ref="sceneRoot"></div>
  <OverlaySpinner :load="showSpinner" />

  <EditorErrorDialog ref="editorErrorDialogRef" @close="redirectToCodex" />
  <WarnSaveDialog ref="warnSaveDialogRef" @save-confirm="saveAndRedirectToCodex" @confirm="redirectToCodex" />
  <ExportProgressDialog ref="exportProgressDialogRef" />
</template>

<script setup lang="ts">
import EditorSidebarControls from '@/components/editor/controls/EditorSidebarControls.vue';
import EditorHeaderControls from '@/components/editor/controls/EditorHeaderControls.vue';
import { onMounted, onUnmounted, ref, toRaw, type Ref } from 'vue';
import * as Globals from '@core/globals';
import { useHead } from '@unhead/vue';
import { idb, KeyBindingAction, type IDBPlanet } from '@/dexie.config';
import { EventBus } from '@core/event-bus';
import { useI18n } from 'vue-i18n';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import {
  LG_PLANET_DATA,
  bootstrapEditor,
  disposeScene,
  exportPlanetPreview,
  takePlanetScreenshot,
  exportPlanetToGLTF,
  isPlanetEdited,
  setPlanetEditFlag,
  updateCameraRendering,
  resetPlanet,
  randomizePlanet,
  LG_EDITOR_STATE,
} from '@/core/services/editor.service';
import { sleep } from '@core/utils/utils';
import { nanoid } from 'nanoid';
import EditorErrorDialog from '@/components/editor/dialogs/EditorInitErrorDialog.vue';
import WarnSaveDialog from '@components/editor/dialogs/WarnSaveDialog.vue';
import ExportProgressDialog from '@components/editor/dialogs/ExportProgressDialog.vue';
import { regeneratePRNGIfNecessary } from '@core/utils/math-utils';
import WebGPU from '@/core/capabilities/WebGPU';
import * as DexieService from '@core/services/dexie.service';
import WebGL from '@/core/capabilities/WebGL';
import ViewHeader from '@/components/global/ViewHeader.vue';
import { EditorState } from '@/core/types';

const route = useRoute();
const router = useRouter();
const i18n = useI18n();
const head = useHead({
  title: i18n.t('editor.$title') + ' · ' + i18n.t('main.$title'),
  meta: [{ name: 'description', content: 'Planet editor' }],
})!;

// Dialogs
const editorErrorDialogRef: Ref<{
  openWithError: (error: string, stack?: string, isWebGPUError?: boolean) => void;
} | null> = ref(null);
const warnSaveDialogRef: Ref<{ open: () => void } | null> = ref(null);
const exportProgressDialogRef: Ref<{
  open: () => void;
  setProgress: (value: number) => void;
  setError: (value: unknown) => void;
} | null> = ref(null);
let loadedCorrectly = false;

// Data
const $planetEntityId: Ref<string> = ref('');
const $planetEntityPreviewDataURL: Ref<string | undefined> = ref('');

// Responsiveness
const showCompactControls: Ref<boolean> = ref(false);

// THREE canvas/scene root
const sceneRoot: Ref<HTMLCanvasElement | null> = ref(null);
const showSpinner: Ref<boolean> = ref(true);

onMounted(async () => {
  await sleep(50);
  await initThree();
});
onUnmounted(() => {
  if (loadedCorrectly) {
    disposeScene();
  }
  EventBus.deregisterWindowEventListener('click', onWindowClick);
  EventBus.deregisterWindowEventListener('resize', onWindowResize);
  EventBus.deregisterWindowEventListener('keydown', onWindowKeydown);
});
onBeforeRouteLeave((_to, _from, next) => {
  if (isPlanetEdited()) {
    next(false);
    warnSaveDialogRef.value?.open();
  } else {
    next();
  }
});

async function initThree() {
  const settings = await idb.settings.limit(1).first();

  // Try starting with WebGPU (fallback to WebGL2 in case of failure)
  if (settings!.renderingBackend === 'webgpu') {
    try {
      if (!(await WebGPU.isAvailable())) {
        showSpinner.value = false;
        const webgpuErrorMessage = WebGPU.getErrorMessage(i18n);
        editorErrorDialogRef.value!.openWithError(webgpuErrorMessage, undefined, true);
        return;
      }
      await initData();
      await initCanvas();
      loadedCorrectly = true;
      showSpinner.value = false;
    } catch (error) {
      LG_EDITOR_STATE.value = EditorState.ERROR;
      if (error instanceof Error) {
        editorErrorDialogRef.value!.openWithError(error.message, error.stack);
      } else if (typeof error === 'string') {
        editorErrorDialogRef.value!.openWithError(error);
      } else {
        editorErrorDialogRef.value!.openWithError(i18n.t('main.error.default_unknown'));
      }
    }
    // Try starting with WebGL2
  } else {
    try {
      if (!WebGL.isWebGL2Available()) {
        showSpinner.value = false;
        const webglErrorMessage = WebGL.getWebGL2ErrorMessage(i18n);
        editorErrorDialogRef.value!.openWithError(webglErrorMessage);
        return;
      }
      await initData();
      await initCanvas();
      loadedCorrectly = true;
      showSpinner.value = false;
    } catch (error) {
      LG_EDITOR_STATE.value = EditorState.ERROR;
      if (error instanceof Error || error instanceof DOMException) {
        editorErrorDialogRef.value!.openWithError(error.message, error.stack);
      } else if (typeof error === 'string') {
        editorErrorDialogRef.value!.openWithError(error);
      } else {
        editorErrorDialogRef.value!.openWithError(i18n.t('main.error.default_unknown'));
      }
    }
  }
}

async function saveAndRedirectToCodex() {
  await savePlanet();
  redirectToCodex();
}

async function redirectToCodex(allowRendererFallback: boolean = false) {
  setPlanetEditFlag(false); // set edit flag to false to force exit
  if (allowRendererFallback) {
    await DexieService.setRenderingBackendFallback();
    router.go(0);
  } else {
    router.push('/codex');
  }
}

async function initData() {
  // https://stackoverflow.com/questions/3891641/regex-test-only-works-every-other-time
  if ((route.params.id as string).length > 3) {
    const idbPlanetData = await idb.planets.filter((p) => p.id === route.params.id).first();
    if (!idbPlanetData) {
      console.warn(`<Lagrange> Cannot find planet with ID: ${route.params.id}`);
      LG_PLANET_DATA.value.reset();
      throw new Error(`Planet with ID [${route.params.id}] doesn't exist.`);
    }
    $planetEntityId.value = idbPlanetData.id;
    $planetEntityPreviewDataURL.value = idbPlanetData.preview;
    LG_PLANET_DATA.value.loadData(idbPlanetData.data);
    console.info(`<Lagrange> Loaded planet [${LG_PLANET_DATA.value.planetName}] with ID: ${$planetEntityId.value}`);
    console.debug(toRaw(LG_PLANET_DATA.value));
  } else {
    console.warn('No planet ID found in the URL, assuming new planet');
    LG_PLANET_DATA.value.reset();
  }
  regeneratePRNGIfNecessary(true);
  patchMetaHead();
}

async function initCanvas() {
  computeResponsiveness();

  const width = window.innerWidth,
    height = window.innerHeight,
    pixelRatio = window.devicePixelRatio;
  let effectiveWidth = width,
    effectiveHeight = height;

  if (showCompactControls.value) {
    effectiveWidth = window.outerWidth;
    effectiveHeight = window.outerHeight * 0.5;
  }

  // Bootstrap editor service
  await bootstrapEditor(sceneRoot.value!, effectiveWidth, effectiveHeight, pixelRatio);

  // Register event listeners
  EventBus.registerWindowEventListener('click', onWindowClick);
  EventBus.registerWindowEventListener('resize', onWindowResize);
  EventBus.registerWindowEventListener('keydown', onWindowKeydown);
}

// ------------------------------------------------------------------------------------------------

async function onWindowClick(event: MouseEvent) {
  EventBus.sendClickEvent(event);
}

async function onWindowKeydown(event: KeyboardEvent) {
  const keyBinds = await idb.keyBindings.toArray();
  const kb = keyBinds.find((k) => k.key === event.key.toUpperCase());
  if (!kb) return;
  if (event.shiftKey && kb.key !== 'SHIFT') {
    return;
  }
  if (event.ctrlKey && kb.key !== 'CONTROL') {
    return;
  }
  if (event.altKey && kb.key !== 'ALT') {
    return;
  }

  switch (kb.action) {
    case KeyBindingAction.ToggleLensFlare:
      LG_PLANET_DATA.value.lensFlareEnabled = !LG_PLANET_DATA.value.lensFlareEnabled;
      break;
    case KeyBindingAction.ToggleClouds:
      LG_PLANET_DATA.value.cloudsEnabled = !LG_PLANET_DATA.value.cloudsEnabled;
      break;
    case KeyBindingAction.ToggleAtmosphere:
      LG_PLANET_DATA.value.atmosphereEnabled = !LG_PLANET_DATA.value.atmosphereEnabled;
      break;
    case KeyBindingAction.ToggleBiomes:
      LG_PLANET_DATA.value.biomesEnabled = !LG_PLANET_DATA.value.biomesEnabled;
      break;
    case KeyBindingAction.TakeScreenshot: {
      takePlanetScreenshot();
      break;
    }
  }
}

function patchMetaHead() {
  head!.patch({ title: `[${LG_PLANET_DATA.value.planetName}]` + ' · ' + i18n.t('main.$title') });
}

// ------------------------------------------------------------------------------------------------

function onWindowResize() {
  computeResponsiveness();
  let effectiveWidth = window.innerWidth,
    effectiveHeight = window.innerHeight;
  if (showCompactControls.value) {
    effectiveWidth = window.outerWidth;
    effectiveHeight = window.outerHeight * 0.5;
  }
  updateCameraRendering(effectiveWidth, effectiveHeight);
}

function computeResponsiveness() {
  showCompactControls.value = window.innerWidth <= Globals.SM_WIDTH_THRESHOLD && window.innerHeight > window.innerWidth;
}

// ------------------------------------------------------------------------------------------------

async function randPlanet() {
  showSpinner.value = true;
  await randomizePlanet();
  showSpinner.value = false;
}

async function savePlanet(asCopy: boolean = false) {
  showSpinner.value = true;
  setPlanetEditFlag(false);

  // -------- Generate planet preview -------- //
  const previewDataString = await exportPlanetPreview();

  // ----------- Save planet data ------------ //
  console.debug(toRaw(LG_PLANET_DATA.value));
  const localData = toRaw(JSON.stringify(LG_PLANET_DATA.value));
  const planetId = asCopy ? nanoid() : $planetEntityId.value.length > 0 ? $planetEntityId.value : nanoid();
  const idbData: IDBPlanet = {
    id: planetId,
    version: '2',
    data: JSON.parse(localData),
    preview: previewDataString.length > 0 ? previewDataString : $planetEntityPreviewDataURL.value,
  };
  await idb.planets.put(idbData, idbData.id);
  $planetEntityId.value = idbData.id;

  showSpinner.value = false;
  router.replace(`/planet-editor/${idbData.id}`);
  if (previewDataString.length > 0) {
    EventBus.sendToastEvent('success', 'toast.save_success', 3000);
  } else {
    EventBus.sendToastEvent('warn', 'toast.save_partial_no_preview', 3000);
  }
}

function exportPlanet() {
  exportProgressDialogRef.value!.open();
  exportProgressDialogRef.value!.setProgress(1);
  setTimeout(() => exportPlanetToGLTF(exportProgressDialogRef.value!), 0);
}
</script>

<style lang="scss">
#editor-header {
  position: absolute;
  .view-header-controls {
    gap: 0;
  }
}

#scene-root {
  box-shadow: black 5px 10px 10px;

  & > canvas {
    background: transparent;
  }
}
</style>
