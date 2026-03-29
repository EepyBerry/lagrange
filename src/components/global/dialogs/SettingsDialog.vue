<template>
  <DialogElement
    id="dialog-settings"
    ref="dialogRef"
    :show-title="true"
    :closeable="true"
    :aria-label="$t('a11y.dialog_settings')"
    @close="handleClose()"
  >
    <template #title>
      <iconify-icon icon="mingcute:settings-3-line" width="1.5rem" aria-hidden="true" />
      {{ $t('dialog.settings.$title') }}
    </template>
    <template #content>
      <div class="settings-grid">
        <CollapsibleSection icon="mingcute:tool-line" class="section-general" expand>
          <template #title>{{ $t('dialog.settings.general') }}</template>
          <template #content>
            <ParameterGrid>
              <ParameterDivider />
              <!-- cat mode toggle -->
              <ParameterSelect v-if="EXTRAS_CAT_MODE" id="language-cat" v-model="catModeOverride" disabled>
                {{ $t('dialog.settings.general_language') }}
                <template #options>
                  <option value="en-UwU" selected>Uwuish [en-UwU]</option>
                </template>
              </ParameterSelect>
              <ParameterSelect v-else id="language" v-model="appSettings.locale">
                {{ $t('dialog.settings.general_language') }}:
                <template #options>
                  <option value="en-US">English [en-US]</option>
                  <option value="fr-FR">Français [fr-FR]</option>
                  <option value="de-DE">Deutsch [de-DE]</option>
                  <option value="_" disabled>{{ $t('main.more_coming_soon') }}</option>
                </template>
              </ParameterSelect>
              <ParameterSelect id="settings-font" v-model="appSettings.font">
                {{ $t('dialog.settings.general_font') }}:
                <template #options>
                  <option value="default">{{ $t('dialog.settings.general_font_default') }}</option>
                  <option value="monospace">{{ $t('dialog.settings.general_font_monospace') }}</option>
                  <option value="lowvision">{{ $t('dialog.settings.general_font_lowvision') }}</option>
                  <option value="dyslexia">{{ $t('dialog.settings.general_font_dyslexia') }}</option>
                </template>
              </ParameterSelect>
              <ParameterRadio>
                <template #title> {{ $t('dialog.settings.general_theme') }}: </template>
                <template #options>
                  <ParameterRadioOption
                    :id="'0'"
                    v-model="appSettings.theme"
                    name="theme-select"
                    value="default"
                    icon="majesticons:comet"
                    :button-aria-label="$t('a11y.general_theme_default')"
                  >
                    {{ $t('dialog.settings.general_theme_default') }}
                  </ParameterRadioOption>
                  <ParameterRadioOption
                    :id="'1'"
                    v-model="appSettings.theme"
                    name="theme-select"
                    value="supernova"
                    icon="ph:star-four"
                    :button-aria-label="$t('a11y.general_theme_supernova')"
                  >
                    {{ $t('dialog.settings.general_theme_supernova') }}
                  </ParameterRadioOption>
                  <ParameterRadioOption
                    :id="'2'"
                    v-model="appSettings.theme"
                    name="theme-select"
                    value="voyager"
                    icon="hugeicons:satellite-02"
                    :button-aria-label="$t('a11y.general_theme_voyager')"
                  >
                    {{ $t('dialog.settings.general_theme_voyager') }}
                  </ParameterRadioOption>
                </template>
              </ParameterRadio>
              <ParameterDivider />
              <ParameterCheckbox
                id="settings-init"
                v-model="appSettings.showInitDialog"
                :true-value="true"
                :false-value="false"
              >
                {{ $t('dialog.settings.general_init_dialog') }}:
              </ParameterCheckbox>
            </ParameterGrid>
          </template>
        </CollapsibleSection>

        <CollapsibleSection icon="mingcute:planet-line" class="section-editor">
          <template #title>
            {{ $t('dialog.settings.editor') }}
          </template>
          <template #content>
            <div class="settings-editor">
              <ParameterGrid>
                <ParameterSlider
                  id="settings-fov"
                  :modelValue="appSettings.cameraFOV"
                  @update:modelValue="appSettings.cameraFOV = $event as number; setCameraFOV($event as number)"
                  :min="30"
                  :max="90"
                >
                  {{ $t('dialog.settings.editor_fov') }}
                </ParameterSlider>
                <ParameterSelect
                  :id="'skybox'"
                  :modelValue="appSettings.skybox"
                  @update:modelValue="appSettings.skybox = $event as SkyboxName; swapEditorSkybox()"
                >
                  {{ $t('dialog.settings.editor_skybox') }}:
                  <template #options>
                    <option value="deepspace">{{ $t('dialog.settings.editor_skybox_deepspace') }}</option>
                    <option value="crimsonquadrant">{{ $t('dialog.settings.editor_skybox_crimsonquadrant') }}</option>
                    <option value="embergreenexpanse">
                      {{ $t('dialog.settings.editor_skybox_embergreenexpanse') }}
                    </option>
                    <option value="shiningstars">{{ $t('dialog.settings.editor_skybox_shiningstars') }}</option>
                    <option value="jadenebula">
                      {{ $t('dialog.settings.editor_skybox_jadenebula') }}
                    </option>
                    <option value="edgeoftheuniverse">
                      {{ $t('dialog.settings.editor_skybox_edgeoftheuniverse') }}
                    </option>
                    <option value="chromakey">
                      {{ $t('dialog.settings.editor_skybox_chromakey') }}
                    </option>
                  </template>
                </ParameterSelect>
                <ParameterDivider bordered />
                <ParameterRadio>
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <template #title><span v-html="$t('dialog.settings.editor_rendering_backend')"></span>:</template>
                  <template #options>
                    <ParameterRadioOption
                      :id="'webgl'"
                      v-model="appSettings.renderingBackend"
                      name="rendering-backend-select"
                      :value="'webgl'"
                      :button-aria-label="$t('a11y.editor_rendering_backend_webgl')"
                    >
                      <iconify-icon class="icon" icon="simple-icons:webgl" width="2rem" aria-hidden="true" />
                      {{ $t('dialog.settings.editor_rendering_backend_webgl') }}
                    </ParameterRadioOption>
                    <ParameterRadioOption
                      :id="'webgpu'"
                      v-model="appSettings.renderingBackend"
                      name="rendering-backend-select"
                      :value="'webgpu'"
                      :button-aria-label="$t('a11y.editor_rendering_backend_webgpu')"
                      :disabled="!WebGPU.isAvailable()"
                    >
                      <iconify-icon class="icon" icon="simple-icons:webgpu" width="1.5rem" aria-hidden="true" />
                      {{ $t('dialog.settings.editor_rendering_backend_webgpu') }}
                    </ParameterRadioOption>
                  </template>
                </ParameterRadio>
                <LgvNotification :type="appSettings.renderingBackend === 'webgl' ? 'info' : 'wip'">
                  {{
                    appSettings.renderingBackend === 'webgl'
                      ? $t('dialog.settings.editor_rendering_backend_webgl_notification')
                      : $t('dialog.settings.editor_rendering_backend_webgpu_notification')
                  }}
                </LgvNotification>
                <LgvNotification v-if="!WebGPU.isAvailable()" type="warn">
                  {{ $t('dialog.settings.editor_rendering_backend_webgpu_unavailable') }}
                </LgvNotification>
                <ParameterDivider bordered />
                <ParameterRadio>
                  <template #title> {{ $t('dialog.settings.editor_baking_resolution') }}: </template>
                  <template #options>
                    <ParameterRadioOption
                      :id="'256'"
                      v-model="appSettings.bakingResolution"
                      name="baking-res-select"
                      :value="256"
                      :button-aria-label="$t('a11y.editor_baking_resolution_256')"
                      >256</ParameterRadioOption
                    >
                    <ParameterRadioOption
                      :id="'512'"
                      v-model="appSettings.bakingResolution"
                      name="baking-res-select"
                      :value="512"
                      :button-aria-label="$t('a11y.editor_baking_resolution_512')"
                      >512</ParameterRadioOption
                    >
                    <ParameterRadioOption
                      :id="'1024'"
                      v-model="appSettings.bakingResolution"
                      name="baking-res-select"
                      :value="1024"
                      :button-aria-label="$t('a11y.editor_baking_resolution_1k')"
                      >1024</ParameterRadioOption
                    >
                    <ParameterRadioOption
                      :id="'2048'"
                      v-model="appSettings.bakingResolution"
                      name="baking-res-select"
                      :value="2048"
                      :button-aria-label="$t('a11y.editor_baking_resolution_2k')"
                      >2048</ParameterRadioOption
                    >
                    <ParameterRadioOption
                      :id="'4096'"
                      v-model="appSettings.bakingResolution"
                      name="baking-res-select"
                      :value="4096"
                      :button-aria-label="$t('a11y.editor_baking_resolution_4k')"
                      >4096</ParameterRadioOption
                    >
                  </template>
                </ParameterRadio>
                <ParameterCheckbox
                  id="settings-baking-pixelize"
                  v-model="appSettings.bakingPixelize"
                  :true-value="true"
                  :false-value="false"
                >
                  {{ $t('dialog.settings.editor_baking_pixelize') }}:
                </ParameterCheckbox>
              </ParameterGrid>
            </div>
          </template>
        </CollapsibleSection>

        <CollapsibleSection icon="mingcute:hotkey-line" class="section-keybinds">
          <template #title>
            {{ $t('dialog.settings.keybinds') }}
          </template>
          <template #content>
            <ParameterGrid>
              <ParameterCheckbox
                id="settings-camera-mouse-controls"
                true-value="inverted"
                false-value="standard"
                :modelValue="appSettings.cameraMouseControlsScheme"
                @update:modelValue="appSettings.cameraMouseControlsScheme = $event as CameraMouseControlsScheme; updateCameraMouseControlsScheme()"
              >
                {{ $t('dialog.settings.keybinds_cameramousecontrols') }}:
              </ParameterCheckbox>
              <ParameterDivider bordered />
              <ParameterKeyBinding
                icon="mingcute:zoom-in-line"
                :key-bind="getKeyBind(KeyBindingAction.StepDollyIn)"
                :selected="selectedAction === KeyBindingAction.StepDollyIn"
                @toggle="toggleAction(KeyBindingAction.StepDollyIn)"
              >
                {{ $t('dialog.settings.keybinds_stepdollyin') }}
              </ParameterKeyBinding>
              <ParameterKeyBinding
                icon="mingcute:zoom-out-line"
                :key-bind="getKeyBind(KeyBindingAction.StepDollyOut)"
                :selected="selectedAction === KeyBindingAction.StepDollyOut"
                @toggle="toggleAction(KeyBindingAction.StepDollyOut)"
              >
                {{ $t('dialog.settings.keybinds_stepdollyout') }}
              </ParameterKeyBinding>
              <ParameterDivider bordered />
              <ParameterKeyBinding
                icon="mingcute:sun-line"
                :key-bind="getKeyBind(KeyBindingAction.ToggleLensFlare)"
                :selected="selectedAction === KeyBindingAction.ToggleLensFlare"
                @toggle="toggleAction(KeyBindingAction.ToggleLensFlare)"
              >
                {{ $t('dialog.settings.keybinds_lensflare') }}
              </ParameterKeyBinding>
              <ParameterKeyBinding
                icon="mingcute:mountain-2-line"
                :key-bind="getKeyBind(KeyBindingAction.ToggleBiomes)"
                :selected="selectedAction === KeyBindingAction.ToggleBiomes"
                @toggle="toggleAction(KeyBindingAction.ToggleBiomes)"
              >
                {{ $t('dialog.settings.keybinds_biomes') }}
              </ParameterKeyBinding>
              <ParameterKeyBinding
                icon="mingcute:clouds-line"
                :key-bind="getKeyBind(KeyBindingAction.ToggleClouds)"
                :selected="selectedAction === KeyBindingAction.ToggleClouds"
                @toggle="toggleAction(KeyBindingAction.ToggleClouds)"
              >
                {{ $t('dialog.settings.keybinds_clouds') }}
              </ParameterKeyBinding>
              <ParameterKeyBinding
                icon="material-symbols:line-curve-rounded"
                :key-bind="getKeyBind(KeyBindingAction.ToggleAtmosphere)"
                :selected="selectedAction === KeyBindingAction.ToggleAtmosphere"
                @toggle="toggleAction(KeyBindingAction.ToggleAtmosphere)"
              >
                {{ $t('dialog.settings.keybinds_atmosphere') }}
              </ParameterKeyBinding>
              <ParameterKeyBinding
                icon="mingcute:screenshot-line"
                :key-bind="getKeyBind(KeyBindingAction.TakeScreenshot)"
                :selected="selectedAction === KeyBindingAction.TakeScreenshot"
                @toggle="toggleAction(KeyBindingAction.TakeScreenshot)"
              >
                {{ $t('dialog.settings.keybinds_screenshot') }}
              </ParameterKeyBinding>
            </ParameterGrid>
          </template>
        </CollapsibleSection>

        <CollapsibleSection icon="material-symbols:accessibility-new-rounded" class="section-a11y">
          <template #title>
            {{ $t('dialog.settings.a11y') }}
          </template>
          <template #content>
            <div class="settings-a11y">
              <ParameterGrid>
                <ParameterCheckbox
                  id="settings-effects"
                  v-model="appSettings.enableEffects"
                  :true-value="true"
                  :false-value="false"
                >
                  {{ $t('dialog.settings.a11y_effects') }}:
                </ParameterCheckbox>
                <ParameterCheckbox
                  id="settings-anim"
                  v-model="appSettings.enableAnimations"
                  :true-value="true"
                  :false-value="false"
                >
                  {{ $t('dialog.settings.a11y_animations') }}:
                </ParameterCheckbox>
              </ParameterGrid>
            </div>
          </template>
        </CollapsibleSection>

        <CollapsibleSection icon="mingcute:star-2-line" class="section-a11y">
          <template #title>
            {{ $t('dialog.settings.extras') }}
          </template>
          <template #content>
            <div class="settings-extras">
              <ParameterGrid>
                <ParameterCheckbox
                  id="settings-crt-effect"
                  v-model="appSettings.extrasCRTEffect"
                  :true-value="true"
                  :false-value="false"
                >
                  {{ $t('dialog.settings.extras_crt_effect') }}:
                </ParameterCheckbox>
                <ParameterCheckbox
                  id="settings-hologram-effect"
                  v-model="appSettings.extrasHologramEffect"
                  :true-value="true"
                  :false-value="false"
                >
                  {{ $t('dialog.settings.extras_hologram_effect') }}:
                </ParameterCheckbox>
                <ParameterCheckbox
                  id="settings-metal-slug-mode"
                  v-model="appSettings.extrasMetalSlugMode"
                  :true-value="true"
                  :false-value="false"
                >
                  {{ $t('dialog.settings.extras_metal_slug_mode') }}:
                </ParameterCheckbox>
                <LgvNotification type="warn">
                  {{ $t('dialog.settings.extras_metal_slug_mode_warning') }}
                </LgvNotification>
                <ParameterCheckbox
                  id="settings-special-days"
                  v-model="appSettings.extrasShowSpecialDays"
                  :true-value="true"
                  :false-value="false"
                >
                  {{ $t('dialog.settings.extras_special_days') }}:
                </ParameterCheckbox>
              </ParameterGrid>
            </div>
          </template>
        </CollapsibleSection>

        <CollapsibleSection icon="mingcute:alert-diamond-line" class="section-advanced">
          <template #title>
            {{ $t('dialog.settings.advanced') }}
          </template>
          <template #content>
            <div class="settings-advanced">
              <ParameterGrid>
                <p>{{ $t('dialog.settings.advanced_io') }}:</p>
                <div id="actions-io">
                  <LgvButton class="sm" icon="mingcute:upload-line" @click="fileInput?.click()">
                    {{ $t('dialog.settings.advanced_import') }}
                  </LgvButton>
                  <input
                    ref="fileInput"
                    type="file"
                    accept=".json"
                    hidden
                    @cancel="(evt: Event) => evt.stopImmediatePropagation()"
                    @change="importData"
                  />
                  <LgvButton class="sm" icon="mingcute:download-line" @click="exportData">
                    {{ $t('dialog.settings.advanced_export') }}
                  </LgvButton>
                </div>
                <p>{{ $t('dialog.settings.advanced_persist') }}:</p>
                <LgvButton
                  class="sm"
                  icon="mingcute:download-line"
                  :disabled="persistStorage || failedToPersist"
                  @click="tryPersistStorage"
                >
                  {{
                    $t(
                      'dialog.settings.advanced_persist_' +
                        (persistStorage ? 'success' : failedToPersist ? 'failure' : 'prompt'),
                    )
                  }}
                </LgvButton>
                <LgvNotification type="info">
                  {{ $t('dialog.settings.advanced_persist_info') }}
                </LgvNotification>
                <ParameterCategory>
                  {{ $t('dialog.settings.advanced_danger_zone') }}
                </ParameterCategory>
                <ParameterDivider />
                <LgvButton
                  class="sm warn clear-data"
                  icon="mingcute:delete-2-line"
                  icon-width="1.25rem"
                  @click="confirmDialogRef?.open()"
                >
                  {{ $t('dialog.settings.advanced_clear_data') }}
                </LgvButton>
              </ParameterGrid>
            </div>
          </template>
        </CollapsibleSection>
      </div>
    </template>
  </DialogElement>
  <AppClearDataConfirmDialog ref="confirmDialogRef" @confirm="clearAllData" />
</template>

<script setup lang="ts">
import CollapsibleSection from '@components/global/elements/CollapsibleSection.vue';
import DialogElement from '@components/global/elements/DialogElement.vue';
import ParameterCategory from '@components/global/parameters/ParameterCategory.vue';
import ParameterCheckbox from '@components/global/parameters/ParameterCheckbox.vue';
import ParameterDivider from '@components/global/parameters/ParameterDivider.vue';
import ParameterGrid from '@components/global/parameters/ParameterGrid.vue';
import ParameterKeyBinding from '@components/global/parameters/ParameterKeyBinding.vue';
import ParameterRadio from '@components/global/parameters/ParameterRadio.vue';
import ParameterRadioOption from '@components/global/parameters/ParameterRadioOption.vue';
import ParameterSelect from '@components/global/parameters/ParameterSelect.vue';
import { EventBus } from '@core/event-bus';
import {
  EXTRAS_CAT_MODE,
  EXTRAS_CRT_EFFECT,
  EXTRAS_HOLOGRAM_EFFECT,
  EXTRAS_METAL_SLUG_MODE,
  EXTRAS_SPECIAL_DAYS,
} from '@core/extras';
import { readFileSettings } from '@core/helpers/import.helper';
import { mapLocale } from '@core/utils/utils';
import { saveAs } from 'file-saver';
import { defineAsyncComponent, onMounted, ref, useTemplateRef, watch, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import LgvButton from '@/_lib/components/LgvButton.vue';
import LgvNotification from '@/_lib/components/LgvNotification.vue';
import WebGPU from '@/core/capabilities/WebGPU';
import * as DexieService from '@/core/services/dexie.service';
import { setCameraControlScheme, setCameraFOV, swapSceneSkybox } from '@/core/services/editor.service';
import {
  type CameraMouseControlsScheme,
  idb,
  type IDBKeyBinding,
  type IDBSettings,
  KeyBindingAction,
  type SkyboxName
} from '@/dexie.config';
import ParameterSlider from "@components/global/parameters/ParameterSlider.vue";
import type { DialogElementExposes } from "@components/global/elements/DialogElement.types.ts";
import type { SettingsDialogExposes } from "@components/global/dialogs/SettingsDialog.types.ts";
import type { ClearDataConfirmDialogExposes } from "@components/global/dialogs/ClearDataConfirmDialog.types.ts";

const AppClearDataConfirmDialog = defineAsyncComponent(
  () => import('@components/global/dialogs/ClearDataConfirmDialog.vue'),
);

const i18n = useI18n();
const catModeOverride = ref('en-UwU');

const dialogRef = useTemplateRef<DialogElementExposes>('dialogRef');
const confirmDialogRef = useTemplateRef<ClearDataConfirmDialogExposes>('confirmDialogRef');
defineExpose<SettingsDialogExposes>({ open });

const fileInput = useTemplateRef('fileInput');
const appSettings: Ref<IDBSettings> = ref({
  id: 0,
  locale: 'en-US',
  theme: '',
  font: '',
  showInitDialog: true,
  renderingBackend: 'webgl',
  cameraFOV: 50,
  skybox: 'deepspace',
  cameraMouseControlsScheme: 'standard',
  bakingResolution: 2048,
  bakingPixelize: false,
  enableAnimations: true,
  enableEffects: true,
  extrasCRTEffect: false,
  extrasHologramEffect: false,
  extrasMetalSlugMode: false,
  extrasShowSpecialDays: true,
});
const persistStorage: Ref<boolean> = ref(false);
const failedToPersist: Ref<boolean> = ref(false);
const selectedAction: Ref<string | null> = ref(null);
const keyBinds: Ref<IDBKeyBinding[]> = ref([]);

let dataLoaded = false;

onMounted(async () => {
  if (navigator.storage) {
    persistStorage.value = await navigator.storage.persisted();
  }
});
watch(() => appSettings.value, updateSettings, { deep: true });

async function open() {
  dialogRef.value?.open()
  if (!dataLoaded) {
    await loadData();
    dataLoaded = true;
  }
}
function handleClose() {
  if (selectedAction.value) {
    const kbIdx = keyBinds.value.findIndex((k) => k.action === selectedAction.value);
    keyBinds.value[kbIdx].key = '[unset]';
    toggleAction(selectedAction.value);
  }
}

// ------------------------------------------------------------------------------------------------

async function loadData() {
  const settings = await idb.settings.limit(1).first();
  const kb = await idb.keyBindings.toArray();
  appSettings.value!.locale = i18n.locale.value;
  appSettings.value = settings!;
  keyBinds.value.splice(0);
  keyBinds.value.push(...kb);
}

async function importData(event: Event) {
  const files = (event.target as HTMLInputElement).files;
  if (!files || files?.length === 0) {
    console.warn('<Lagrange> At least one file should be specified!');
    return;
  }
  const data = await readFileSettings(files[0]);
  appSettings.value = data.settings!;
  keyBinds.value.splice(0);
  keyBinds.value.push(...data.keyBindings);
  await updateSettings().then(
    () => EventBus.sendToastEvent('success', 'toast.settings_import_success', 5000)
  );
}

async function exportData() {
  const settings = await idb.settings.limit(1).first();
  const keyBindings = await idb.keyBindings.toArray();
  saveAs(new Blob([JSON.stringify({ settings, keyBindings }, null, 2)]), 'lagrange_settings.json');
}

async function clearAllData() {
  await DexieService.clearData();
  await loadData();
  EventBus.sendDataClearEvent();
}

function toggleAction(action: string): void {
  if (selectedAction.value === action) {
    globalThis.removeEventListener('keydown', setSelectedActionKey);
    dialogRef.value?.ignoreNativeEvents(false);
    selectedAction.value = null;
  } else {
    selectedAction.value = action;
    dialogRef.value?.ignoreNativeEvents(true);
    globalThis.addEventListener('keydown', setSelectedActionKey);
  }
}

async function updateSettings() {
  if (!EXTRAS_CAT_MODE.value) {
    i18n.locale.value = appSettings.value!.locale;
  }
  document.documentElement.dataset.theme = appSettings.value!.theme;
  document.documentElement.dataset.font = appSettings.value!.font;
  document.documentElement.dataset.effects = appSettings.value!.enableEffects ? 'on' : 'off';
  document.documentElement.dataset.animations = appSettings.value!.enableAnimations ? 'on' : 'off';
  EXTRAS_CRT_EFFECT.value = appSettings.value!.extrasCRTEffect!;
  EXTRAS_HOLOGRAM_EFFECT.value = appSettings.value!.extrasHologramEffect!;
  EXTRAS_METAL_SLUG_MODE.value = appSettings.value!.extrasMetalSlugMode!;
  EXTRAS_SPECIAL_DAYS.value = appSettings.value!.extrasShowSpecialDays!;

  await idb.settings.update(appSettings.value!.id, {
    ...appSettings.value!,
    locale: mapLocale(appSettings.value!.locale),
  });
}

async function tryPersistStorage() {
  const persisted = await navigator.storage.persist();
  failedToPersist.value = !persisted;
  persistStorage.value = persisted;
}

// ------------------------------------------------------------------------------------------------

function swapEditorSkybox() {
  swapSceneSkybox(appSettings.value!.skybox);
}
function updateCameraMouseControlsScheme() {
  setCameraControlScheme(appSettings.value!.cameraMouseControlsScheme as CameraMouseControlsScheme);
}

async function setSelectedActionKey(event: KeyboardEvent) {
  const kbidx = keyBinds.value.findIndex((k) => k.action === selectedAction.value);
  if (['Escape', 'Enter'].includes(event.key)) {
    toggleAction(keyBinds.value[kbidx].action);
    return;
  }

  const alreadyAssignedActions = keyBinds.value.filter((k) => k.key === event.key.toUpperCase());
  if (alreadyAssignedActions.length > 0) {
    alreadyAssignedActions.forEach((k) => (k.key = '[unset]'));
  }

  await idb.keyBindings
    .bulkUpdate([
      { key: keyBinds.value[kbidx].id, changes: { key: event.key.toUpperCase() } },
      ...alreadyAssignedActions.map((k) => ({ key: k.id, changes: { key: k.key } })),
    ])
    .then(() => (keyBinds.value[kbidx].key = event.key.toUpperCase()))
    .catch((e) => console.error('<Lagrange> (Dexie) Keybinds failed to update', e));
  toggleAction(keyBinds.value[kbidx].action);
}

function getKeyBind(action: string) {
  return keyBinds.value.find((kb) => kb.action === action);
}
</script>

<style scoped lang="scss">
#dialog-settings {
  min-width: 36rem;
  max-width: 36rem;
  height: 80%;
  .settings-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .settings-general,
    .settings-editor,
    .settings-a11y,
    .settings-advanced {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }
  }
  .settings-advanced #actions-io {
    display: flex;
    gap: 0.5rem;
    & > * {
      flex: 1;
    }
  }
  .setting-persist button {
    grid-column: 2;
    padding: 0 0.5rem;
  }
  .notification,
  button.clear-data {
    grid-column: span 2;
  }
}

@media screen and (max-width: 767px) {
  #dialog-settings {
    min-width: 0;
    max-width: calc(100% - 1rem);
    width: 100%;
  }
}

@media screen and (max-width: 567px) {
  #dialog-settings {
    min-width: 6rem;
    width: 100%;
  }
}
</style>
