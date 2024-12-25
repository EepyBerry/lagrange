<template>
  <DialogElement
    id="dialog-settings"
    ref="dialogRef"
    :show-title="true"
    :closeable="true"
    :aria-label="$t('a11y.dialog_settings')"
    style="height: 80%"
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
              <ParameterSelect id="language" v-model="appSettings.locale">
                {{ $t('dialog.settings.general_language') }}
                <template #options>
                  <option value="en-US">English [en-US]</option>
                  <option value="en-UwU">Uwuish [en-UwU]</option>
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
                    :id="'1'"
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
                <ParameterKeyBinding
                  icon="mingcute:sun-line"
                  :key-bind="getKeyBind('toggle-lens-flare')"
                  :selected="selectedAction === 'toggle-lens-flare'"
                  @toggle="toggleAction('toggle-lens-flare')"
                >
                  {{ $t('dialog.settings.editor_lensflare') }}
                </ParameterKeyBinding>
                <ParameterKeyBinding
                  icon="mingcute:mountain-2-line"
                  :key-bind="getKeyBind('toggle-biomes')"
                  :selected="selectedAction === 'toggle-biomes'"
                  @toggle="toggleAction('toggle-biomes')"
                >
                  {{ $t('dialog.settings.editor_biomes') }}
                </ParameterKeyBinding>
                <ParameterKeyBinding
                  icon="mingcute:clouds-line"
                  :key-bind="getKeyBind('toggle-clouds')"
                  :selected="selectedAction === 'toggle-clouds'"
                  @toggle="toggleAction('toggle-clouds')"
                >
                  {{ $t('dialog.settings.editor_clouds') }}
                </ParameterKeyBinding>
                <ParameterKeyBinding
                  icon="material-symbols:line-curve-rounded"
                  :key-bind="getKeyBind('toggle-atmosphere')"
                  :selected="selectedAction === 'toggle-atmosphere'"
                  @toggle="toggleAction('toggle-atmosphere')"
                >
                  {{ $t('dialog.settings.editor_atmosphere') }}
                </ParameterKeyBinding>
                <ParameterKeyBinding
                  icon="mingcute:screenshot-line"
                  :key-bind="getKeyBind('take-screenshot')"
                  :selected="selectedAction === 'take-screenshot'"
                  @toggle="toggleAction('take-screenshot')"
                >
                  {{ $t('dialog.settings.editor_screenshot') }}
                </ParameterKeyBinding>
                <ParameterDivider />
                <ParameterRadio>
                  <template #title> {{ $t('dialog.settings.editor_baking_resolution') }}: </template>
                  <template #options>
                    <ParameterRadioOption
                      :id="'0'"
                      v-model="appSettings.bakingResolution"
                      name="baking-256"
                      :value="256"
                      :button-aria-label="$t('a11y.editor_baking_resolution_256')"
                      >256</ParameterRadioOption
                    >
                    <ParameterRadioOption
                      :id="'0'"
                      v-model="appSettings.bakingResolution"
                      name="baking-512"
                      :value="512"
                      :button-aria-label="$t('a11y.editor_baking_resolution_512')"
                      >512</ParameterRadioOption
                    >
                    <ParameterRadioOption
                      :id="'0'"
                      v-model="appSettings.bakingResolution"
                      name="baking-1k"
                      :value="1024"
                      :button-aria-label="$t('a11y.editor_baking_resolution_1k')"
                      >1024</ParameterRadioOption
                    >
                    <ParameterRadioOption
                      :id="'1'"
                      v-model="appSettings.bakingResolution"
                      name="baking-2k"
                      :value="2048"
                      :button-aria-label="$t('a11y.editor_baking_resolution_2k')"
                      >2048</ParameterRadioOption
                    >
                    <ParameterRadioOption
                      :id="'1'"
                      v-model="appSettings.bakingResolution"
                      name="baking-4k"
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
                  id="settings-hologram-mode"
                  v-model="appSettings.extrasHologramMode"
                  :true-value="true"
                  :false-value="false"
                >
                  {{ $t('dialog.settings.extras_hologram_mode') }}:
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
                <p>{{ $t('dialog.settings.advanced_persist') }}:</p>
                <button class="lg" :disabled="!!persistStorage || failedToPersist" @click="tryPersistStorage">
                  {{
                    $t(
                      'dialog.settings.advanced_persist_' +
                        (persistStorage ? 'success' : failedToPersist ? 'failure' : 'prompt'),
                    )
                  }}
                </button>
                <NotificationElement type="info">
                  {{ $t('dialog.settings.advanced_persist_info') }}
                </NotificationElement>
                <ParameterCategory>
                  {{ $t('dialog.settings.advanced_danger_zone') }}
                </ParameterCategory>
                <ParameterDivider />
                <button class="lg warn clear-data" style="width: 100%" @click="confirmDialogRef?.open()">
                  <iconify-icon icon="mingcute:delete-2-line" width="1.25rem" aria-hidden="true" />
                  {{ $t('dialog.settings.advanced_clear_data') }}
                </button>
                <AppClearDataConfirmDialog ref="confirmDialogRef" @confirm="clearAllData" />
              </ParameterGrid>
            </div>
          </template>
        </CollapsibleSection>
      </div>
    </template>
  </DialogElement>
</template>

<script setup lang="ts">
import { idb, type IDBKeyBinding, type IDBSettings } from '@/dexie.config'
import { onMounted, ref, watch, type Ref } from 'vue'
import DialogElement from '../elements/DialogElement.vue'
import ParameterGrid from '../parameters/ParameterGrid.vue'
import ParameterCheckbox from '../parameters/ParameterCheckbox.vue'
import ParameterRadio from '../parameters/ParameterRadio.vue'
import ParameterDivider from '../parameters/ParameterDivider.vue'
import ParameterRadioOption from '../parameters/ParameterRadioOption.vue'
import ParameterSelect from '../parameters/ParameterSelect.vue'
import { useI18n } from 'vue-i18n'
import CollapsibleSection from '../elements/CollapsibleSection.vue'
import { mapLocale } from '@/utils/utils'
import ParameterKeyBinding from '../parameters/ParameterKeyBinding.vue'
import { A11Y_ANIMATE, EXTRAS_HOLOGRAM_MODE } from '@/core/globals'
import NotificationElement from '../elements/NotificationElement.vue'
import ParameterCategory from '../parameters/ParameterCategory.vue'
import AppClearDataConfirmDialog from './AppClearDataConfirmDialog.vue'
import { clearData } from '@/utils/dexie-utils'
import { EventBus } from '@/core/event-bus'

const i18n = useI18n()

const confirmDialogRef: Ref<{ open: () => void; close: () => void } | null> = ref(null)
const dialogRef: Ref<{ open: () => void; close: () => void; ignoreNativeEvents: (v: boolean) => void; isOpen: boolean } | null> =
  ref(null)
const appSettings: Ref<IDBSettings> = ref({
  id: 0,
  locale: 'en-US',
  theme: '',
  font: '',
  showInitDialog: true,
  bakingResolution: 2048,
  bakingPixelize: false,
  enableAnimations: true,
  enableEffects: true,
  extrasHologramMode: false,
})
const persistStorage: Ref<boolean> = ref(false)
const selectedAction: Ref<string | null> = ref(null)
const keyBinds: Ref<IDBKeyBinding[]> = ref([])

const failedToPersist: Ref<boolean> = ref(false)

let dataLoaded = false

defineExpose({
  open: async () => {
    if (!dataLoaded) {
      await loadData()
      dataLoaded = true
    }
    dialogRef.value?.open()
  },
})

onMounted(async () => {
  if (navigator.storage) {
    persistStorage.value = await navigator.storage.persisted()
  }
})

watch(
  [() => appSettings.value, () => dialogRef.value?.isOpen],
  ([_, isDialogOpen]) => {
    if (!dataLoaded) {
      return
    }
    updateSettings()
    if (!isDialogOpen && selectedAction.value) {
      const kbidx = keyBinds.value.findIndex((k) => k.action === selectedAction.value)
      keyBinds.value[kbidx].key = '[unset]'
      toggleAction(selectedAction.value)
    }
  },
  { deep: true },
)

async function loadData() {
  const settings = await idb.settings.limit(1).first()
  const kb = await idb.keyBindings.toArray()
  appSettings.value!.locale = i18n.locale.value
  appSettings.value = settings!
  keyBinds.value.splice(0)
  keyBinds.value.push(...kb)
}

async function clearAllData() {
  await clearData()
  await loadData()
  EventBus.sendDataClearEvent()
}

function toggleAction(action: string): void {
  if (selectedAction.value === action) {
    window.removeEventListener('keydown', setSelectedActionKey)
    dialogRef.value?.ignoreNativeEvents(false)
    selectedAction.value = null
  } else {
    selectedAction.value = action
    dialogRef.value?.ignoreNativeEvents(true)
    window.addEventListener('keydown', setSelectedActionKey)
  }
}

async function updateSettings() {
  i18n.locale.value = appSettings.value!.locale
  document.documentElement.setAttribute('data-theme', appSettings.value!.theme)
  document.documentElement.setAttribute('data-font', appSettings.value!.font)
  document.documentElement.setAttribute('data-effects', appSettings.value!.enableEffects ? 'on' : 'off')
  A11Y_ANIMATE.value = appSettings.value!.enableAnimations!
  EXTRAS_HOLOGRAM_MODE.value = appSettings.value!.extrasHologramMode!

  await idb.settings.update(appSettings.value!.id, {
    locale: mapLocale(appSettings.value!.locale),
    theme: appSettings.value!.theme,
    font: appSettings.value!.font,
    showInitDialog: appSettings.value!.showInitDialog,
    bakingResolution: appSettings.value!.bakingResolution,
    bakingPixelize: appSettings.value!.bakingPixelize,
    enableEffects: appSettings.value!.enableEffects,
    enableAnimations: appSettings.value!.enableAnimations,
    extrasHologramMode: appSettings.value!.extrasHologramMode,
  })
}

async function tryPersistStorage() {
  const persisted = await navigator.storage.persist()
  failedToPersist.value = !persisted
  persistStorage.value = persisted
}

// ------------------------------------------------------------------------------------------------

async function setSelectedActionKey(event: KeyboardEvent) {
  const kbidx = keyBinds.value.findIndex((k) => k.action === selectedAction.value)
  if (['Escape', 'Enter'].includes(event.key)) {
    toggleAction(keyBinds.value[kbidx].action)
    return
  }

  const alreadyAssignedActions = keyBinds.value.filter((k) => k.key === event.key.toUpperCase())
  if (alreadyAssignedActions.length > 0) {
    alreadyAssignedActions.forEach((k) => (k.key = '[unset]'))
  }

  await idb.keyBindings
    .bulkUpdate([
      { key: keyBinds.value[kbidx].id, changes: { key: event.key.toUpperCase() } },
      ...alreadyAssignedActions.map((k) => ({ key: k.id, changes: { key: k.key } })),
    ])
    .then(() => (keyBinds.value[kbidx].key = event.key.toUpperCase()))
    .catch((e) => console.error('(Dexie) Keybinds failed to update', e))
  toggleAction(keyBinds.value[kbidx].action)
}

function getKeyBind(action: string) {
  return keyBinds.value.find((kb) => kb.action === action)
}
</script>

<style scoped lang="scss">
#dialog-settings {
  min-width: 36rem;
  max-width: 36rem;
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
