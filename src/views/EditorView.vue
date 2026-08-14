<template>
  <ViewHeader id="editor-header" class="xs-fullwidth">
    <EditorHeaderControls
      @rename="patchMetaHead"
      @save="savePlanet"
      @copy="savePlanet(true)"
      @reset="resetPlanet"
      @extract-textures="exportPlanetTextures"
      @gltf="exportPlanet"
      @random="randPlanet"
    />
    <span class="filler"></span>
  </ViewHeader>

  <div id="scene-root" ref="sceneRoot" :class="{ compact: showCompactControls }">
    <OverlaySpinner :load="showSpinner" />
  </div>
  <EditorSidebarControls :compact-mode="showCompactControls" />

  <EditorErrorDialog ref="editorErrorDialogRef" @close="handleEditorInitError" />
  <WarnSaveDialog ref="warnSaveDialogRef" @save-confirm="saveAndRedirectToCodex" @confirm="redirectToCodex" />
  <ExportProgressDialog ref="exportProgressDialogRef" />
</template>

<script setup lang="ts">
import type { EditorInitErrorDialogExposes } from '@components/editor/dialogs/EditorInitErrorDialog.types.ts';
import type { ExportProgressDialogExposes } from '@components/editor/dialogs/ExportProgressDialog.types.ts';
import type { WarnSaveDialogExposes } from '@components/editor/dialogs/WarnSaveDialog.types.ts';
import {
  bootstrapEditor,
  dollyCamera,
  exportPlanetPreview,
  exportPlanetToGLTF,
  extractPlanetTextures,
  randomizePlanet,
  resetPlanet,
  takePlanetScreenshot,
  unloadEditor,
  updateCameraRendering,
} from '@core/editor/editor.service.ts';
import { EDITOR_STATE, EditorStatusCode } from '@core/editor/state/editor.state';
import * as Globals from '@core/globals';
import { COMPACT_CONTROLS_HEIGHT } from '@core/globals';
import PlanetData from '@core/models/planet/planet-data.model.ts';
import { resetPlanetData } from '@core/models/planet/planet-data.utils.ts';
import * as DexieService from '@core/services/dexie.service';
import { UIEventBus } from '@core/ui-event-bus.ts';
import { regeneratePRNGIfNecessary } from '@core/utils/math-utils';
import { sleep } from '@core/utils/utils';
import { useHead } from '@unhead/vue';
import { nanoid } from 'nanoid';
import { defineAsyncComponent, onMounted, onUnmounted, ref, type Ref, toRaw, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import EditorHeaderControls from '@/components/editor/controls/EditorHeaderControls.vue';
import EditorSidebarControls from '@/components/editor/controls/EditorSidebarControls.vue';
import EditorErrorDialog from '@/components/editor/dialogs/EditorInitErrorDialog.vue';
import ViewHeader from '@/components/global/ViewHeader.vue';
import WebGL from '@/core/capabilities/WebGL';
import WebGPU from '@/core/capabilities/WebGPU';
import { idb, type IDBPlanet, KeyBindingAction } from '@/dexie.config';

const WarnSaveDialog = defineAsyncComponent(() => import('@components/editor/dialogs/WarnSaveDialog.vue'));
const ExportProgressDialog = defineAsyncComponent(() => import('@components/editor/dialogs/ExportProgressDialog.vue'));

const route = useRoute();
const router = useRouter();
const i18n = useI18n();
const head = useHead({
  title: i18n.t('editor.$title') + ' · ' + i18n.t('main.$title'),
  meta: [{ name: 'description', content: 'Planet editor' }],
})!;

// Dialogs
const editorErrorDialogRef = useTemplateRef<EditorInitErrorDialogExposes>('editorErrorDialogRef');
const warnSaveDialogRef = useTemplateRef<WarnSaveDialogExposes>('warnSaveDialogRef');
const exportProgressDialogRef = useTemplateRef<ExportProgressDialogExposes>('exportProgressDialogRef');

// Data
let loadedCorrectly = false;
const $planetEntityId: Ref<string> = ref('');
const $planetEntityPreviewDataURL: Ref<string | undefined> = ref('');

// Responsiveness
const showCompactControls: Ref<boolean> = ref(false);

// THREE canvas/scene root
const sceneRoot = useTemplateRef('sceneRoot');
const showSpinner: Ref<boolean> = ref(true);

onMounted(async () => {
  await sleep(50);
  await initThree();
});
onUnmounted(() => {
  if (loadedCorrectly) {
    unloadEditor();
  }
  UIEventBus.deregisterWindowEventListener('click', onWindowClick);
  UIEventBus.deregisterWindowEventListener('keydown', onWindowKeydown);
  UIEventBus.deregisterWindowEventListener('resize', computeViewRendering);
  UIEventBus.deregisterWindowEventListener('deviceorientation', computeViewRenderingDeferred);
});
onBeforeRouteLeave(() => {
  if (EDITOR_STATE.value.planetEditedFlag) {
    warnSaveDialogRef.value?.open();
    return false;
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
        editorErrorDialogRef.value!.open(webgpuErrorMessage, undefined, true);
        return;
      }
      await initData();
      await initCanvas();
      loadedCorrectly = true;
      showSpinner.value = false;
    } catch (error) {
      handleInitThreeError(error);
    }
    // Try starting with WebGL2
  } else {
    try {
      if (!WebGL.isWebGL2Available()) {
        showSpinner.value = false;
        const webglErrorMessage = WebGL.getWebGL2ErrorMessage(i18n);
        editorErrorDialogRef.value!.open(webglErrorMessage);
        return;
      }
      await initData();
      await initCanvas();
      loadedCorrectly = true;
      showSpinner.value = false;
    } catch (error) {
      handleInitThreeError(error);
    }
  }
}
function handleInitThreeError(error: unknown) {
  EDITOR_STATE.value.status = EditorStatusCode.Error;
  if (error instanceof Error || error instanceof DOMException) {
    editorErrorDialogRef.value!.open(error.message, error.stack);
  } else if (typeof error === 'string') {
    editorErrorDialogRef.value!.open(error);
  } else {
    editorErrorDialogRef.value!.open(i18n.t('common.error.default_unknown'));
  }
}

async function saveAndRedirectToCodex() {
  await savePlanet();
  redirectToCodex();
}
function redirectToCodex() {
  EDITOR_STATE.value.planetEditedFlag = false; // set edit flag to false to force exit
  router.push('/');
}

async function handleEditorInitError(reloadWithFallback: boolean = false) {
  if (reloadWithFallback) {
    await DexieService.setRenderingBackendFallback();
    router.go(0);
  } else {
    redirectToCodex();
  }
}

async function initData() {
  // https://stackoverflow.com/questions/3891641/regex-test-only-works-every-other-time
  if ((route.params.id as string) === 'new') {
    console.info('No planet ID found in the URL, assuming new planet');
    EDITOR_STATE.value.planetData = new PlanetData();
  } else {
    const idbPlanetData = await idb.planets.filter((p) => p.id === route.params.id).first();
    if (!idbPlanetData) {
      console.warn(`<Lagrange> Cannot find planet with ID: ${route.params.id}`);
      resetPlanetData(EDITOR_STATE.value.planetData);
      throw new Error(`Planet with ID [${route.params.id}] doesn't exist.`);
    }
    $planetEntityId.value = idbPlanetData.id;
    $planetEntityPreviewDataURL.value = idbPlanetData.preview;
    EDITOR_STATE.value.planetData = PlanetData.createFrom(idbPlanetData.data);
    console.info(
      `<Lagrange> Loaded planet [${EDITOR_STATE.value.planetData.planetName}] with ID: ${$planetEntityId.value}`,
    );
    console.debug(toRaw(EDITOR_STATE.value.planetData));
  }
  regeneratePRNGIfNecessary(true);
  patchMetaHead();
}

async function initCanvas() {
  computeResponsiveness();
  const canvasSize = computeCanvasSize();

  // Bootstrap editor service
  await bootstrapEditor(sceneRoot.value!, canvasSize.width, canvasSize.height, globalThis.devicePixelRatio);
  UIEventBus.registerWindowEventListener('click', onWindowClick);
  UIEventBus.registerWindowEventListener('keydown', onWindowKeydown);
  UIEventBus.registerWindowEventListener('resize', computeViewRendering);
  UIEventBus.registerWindowEventListener('deviceorientation', computeViewRenderingDeferred);
}

// ------------------------------------------------------------------------------------------------

async function onWindowClick(event: MouseEvent) {
  UIEventBus.sendClickEvent(event);
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
      EDITOR_STATE.value.planetData.lensFlareEnabled = !EDITOR_STATE.value.planetData.lensFlareEnabled;
      break;
    case KeyBindingAction.ToggleClouds:
      EDITOR_STATE.value.planetData.cloudsEnabled = !EDITOR_STATE.value.planetData.cloudsEnabled;
      break;
    case KeyBindingAction.ToggleAtmosphere:
      EDITOR_STATE.value.planetData.atmosphereEnabled = !EDITOR_STATE.value.planetData.atmosphereEnabled;
      break;
    case KeyBindingAction.ToggleBiomes:
      EDITOR_STATE.value.planetData.biomesEnabled = !EDITOR_STATE.value.planetData.biomesEnabled;
      break;
    case KeyBindingAction.TakeScreenshot: {
      await takePlanetScreenshot();
      break;
    }
    case KeyBindingAction.StepDollyIn: {
      dollyCamera('in');
      break;
    }
    case KeyBindingAction.StepDollyOut: {
      dollyCamera('out');
      break;
    }
  }
}

function patchMetaHead() {
  head!.patch({ title: `[${EDITOR_STATE.value.planetData.planetName}]` + ' · ' + i18n.t('main.$title') });
}

// ------------------------------------------------------------------------------------------------

function computeViewRendering() {
  computeResponsiveness();
  const canvasSize = computeCanvasSize();
  updateCameraRendering(canvasSize.width, canvasSize.height);
}
function computeViewRenderingDeferred() {
  setTimeout(() => computeViewRendering(), 50);
}
function computeResponsiveness() {
  showCompactControls.value = window.innerWidth <= Globals.SM_WIDTH_THRESHOLD && window.innerHeight > window.innerWidth;
}
function computeCanvasSize() {
  if (showCompactControls.value) {
    return { width: globalThis.innerWidth, height: globalThis.innerHeight - COMPACT_CONTROLS_HEIGHT };
  } else {
    return { width: globalThis.innerWidth, height: globalThis.innerHeight };
  }
}

// ------------------------------------------------------------------------------------------------

async function randPlanet() {
  showSpinner.value = true;
  await randomizePlanet();
  showSpinner.value = false;
}

async function savePlanet(asCopy: boolean = false) {
  showSpinner.value = true;
  EDITOR_STATE.value.planetEditedFlag = false;

  // -------- Generate planet preview -------- //
  const previewDataString = await exportPlanetPreview();

  // ----------- Save planet data ------------ //
  console.debug(toRaw(EDITOR_STATE.value.planetData));
  const localData = toRaw(JSON.stringify(EDITOR_STATE.value.planetData));
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
    UIEventBus.sendToastEvent('success', 'toast.save_success', 3000);
  } else {
    UIEventBus.sendToastEvent('warn', 'toast.save_partial_no_preview', 3000);
  }
}

function exportPlanetTextures() {
  exportProgressDialogRef.value!.open('textures');
  exportProgressDialogRef.value!.setProgress(1);
  extractPlanetTextures(exportProgressDialogRef.value!);
}

function exportPlanet() {
  exportProgressDialogRef.value!.open('gltf');
  exportProgressDialogRef.value!.setProgress(1);
  exportPlanetToGLTF(exportProgressDialogRef.value!);
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
  flex: 1;
  position: relative;
  box-shadow: black 5px 10px 10px;
  & > canvas {
    background: transparent;
    width: 100dvw;
  }
}
#scene-root.compact {
  height: calc(100dvh - 320px);
  & > canvas {
    height: calc(100dvh - 320px);
  }
}
</style>
