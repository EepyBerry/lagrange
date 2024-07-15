<template>
  <DialogElement ref="dialogRef"
    id="dialog-settings"
    :showTitle="true"
    :aria-label="$t('a11y.dialog_settings')"
  >
    <template v-slot:title>
      <iconify-icon icon="mingcute:settings-3-line" width="1.5rem" aria-hidden="true" />
      {{ $t('dialog.settings.$title') }}
    </template>
    <template v-slot:content>
      <div class="settings-grid">
        <div class="settings-theme">
          <h3>{{ $t('dialog.settings.general') }}</h3>
          <ParameterTable>
            <ParameterRadio>
              <template v-slot:title>
                {{ $t('dialog.settings.general_theme') }}
              </template>
              <template v-slot:options>
                <ParameterRadioOption v-model="appGraphicsSettings.theme"
                  name="theme-select"
                  :id="'0'"
                  value="default"
                  icon="mingcute:planet-line"
                  :ariaLabel="$t('a11y.general_theme_default')"
                >
                  {{ $t('dialog.settings.general_theme_default') }}
                </ParameterRadioOption>
                <ParameterRadioOption v-model="appGraphicsSettings.theme"
                  name="theme-select"
                  :id="'1'"
                  value="supernova"
                  icon="ph:star-four"
                  :ariaLabel="$t('a11y.general_theme_supernova')"
                >
                  {{ $t('dialog.settings.general_theme_supernova') }}
                </ParameterRadioOption>
                <ParameterRadioOption v-model="appGraphicsSettings.theme"
                  name="theme-select"
                  :id="'1'"
                  value="voyager"
                  icon="hugeicons:satellite-02"
                  :ariaLabel="$t('a11y.general_theme_voyager')"
                >
                  {{ $t('dialog.settings.general_theme_voyager') }}
                </ParameterRadioOption>
              </template>
            </ParameterRadio>
            <ParameterDivider />
            <ParameterCheckbox
              id="settings-font"
              :true-value="'monospace'"
              :false-value="'default'"
              v-model="appGraphicsSettings.font"
            >
              {{ $t('dialog.settings.general_monospace') }}:
            </ParameterCheckbox>
          </ParameterTable>
        </div>
        <hr>
        <div class="settings-keybinds">
          <h3>{{ $t('dialog.settings.keybinds') }}</h3>
          <ParameterTable>
            <tr v-for="kb of keyBinds" :key="kb.action">
              <td>
                <div class="keybind">
                  <div class="keybinds-label">
                    <iconify-icon :icon="getIcon(kb.action)" width="1.5rem" aria-hidden="true" />
                    {{ $t('dialog.settings.keybinds_' + getTranslationKey(kb.action)) }}
                  </div>
                  <div class="keybinds-key" :class="{ unset: kb.key === '[unset]' }">
                    <iconify-icon v-if="tryGetKeyRepresentation(kb.key)" :icon="tryGetKeyRepresentation(kb.key)" width="1.25rem" />
                    <span v-else>{{ selectedAction === kb.action ? '.....' : kb.key }}</span>
                  </div>
                  <button class="lg" :aria-label="$t('a11y.action_edit_keybind')" @click="toggleAction(kb.action)">
                    <iconify-icon v-if="selectedAction === kb.action" class="icon" icon="mingcute:close-line" width="1.25rem" aria-hidden="true" />
                    <iconify-icon v-else class="icon" icon="mingcute:edit-2-line" width="1.25rem" aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          </ParameterTable>
        </div>
      </div>
    </template>
  </DialogElement>
</template>

<script setup lang="ts">
import { KeyBindingAction, idb, type IDBKeyBinding, type IDBSettings } from '@/dexie';
import { ref, watch, type Ref } from 'vue';
import DialogElement from '../elements/DialogElement.vue';
import ParameterTable from '../parameters/ParameterTable.vue';
import ParameterCheckbox from '../parameters/ParameterCheckbox.vue';
import ParameterRadio from '../parameters/ParameterRadio.vue';
import ParameterDivider from '../parameters/ParameterDivider.vue';
import ParameterRadioOption from '../parameters/ParameterRadioOption.vue';

const appGraphicsSettings: Ref<IDBSettings> = ref({ id: 0, language: '', theme: '', font: '' })
const keyBinds: Ref<IDBKeyBinding[]> = ref([])
let dataLoaded = false

const dialogRef: Ref<{ open: Function, close: Function, ignoreNativeEvents: Function, isOpen: boolean }|null> = ref(null)
const selectedAction: Ref<string | null> = ref(null)
const enableMonospaceFont: Ref<boolean> = ref(false)

defineExpose({ open: async () => {
  if (dataLoaded) {
    return
  }
  await loadData()
  dataLoaded = true
  dialogRef.value?.open()
}})

async function loadData() {
  let settings = await idb.settings.limit(1).first()
  let kb = await idb.keyBindings.limit(4).toArray()
  appGraphicsSettings.value = settings!
  enableMonospaceFont.value = settings!.font === 'monospace'
  keyBinds.value.push(...kb)
}

watch(() => appGraphicsSettings.value, () => updateSettings(), { deep: true })
watch(() => dialogRef.value, (v) => {
  if (!v?.isOpen && selectedAction.value) {
    const kbidx = keyBinds.value.findIndex(k => k.action === selectedAction.value)
    keyBinds.value[kbidx].key = '[unset]'
    toggleAction(selectedAction.value)
  }
}, { deep: true })

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
  document.documentElement.setAttribute('data-theme', appGraphicsSettings.value!.theme)
  document.documentElement.setAttribute('data-font', appGraphicsSettings.value!.font)
  await idb.settings.update(appGraphicsSettings.value!.id, {
    theme: appGraphicsSettings.value!.theme,
    font: appGraphicsSettings.value!.font
  })
}

async function setSelectedActionKey(event: KeyboardEvent) {
  const kbidx = keyBinds.value.findIndex(k => k.action === selectedAction.value)
  if (['Escape', 'Enter'].includes(event.key)) {
    toggleAction(keyBinds.value[kbidx].action)
    return
  }

  const alreadyAssignedActions = keyBinds.value.filter(k => k.key === event.key.toUpperCase())
  if (alreadyAssignedActions.length > 0) {
    alreadyAssignedActions.forEach(k => k.key = '[unset]')
  }

  await idb.keyBindings
    .bulkUpdate([
      { key: keyBinds.value[kbidx].id, changes: { key: event.key.toUpperCase() } },
      ...alreadyAssignedActions.map(k => ({ key: k.id, changes: { key: k.key } }))
    ])
    .then(() => keyBinds.value[kbidx].key = event.key.toUpperCase())
    .catch((e) => console.error('(Dexie) Keybinds failed to update', e))
  toggleAction(keyBinds.value[kbidx].action)
}

function getTranslationKey(action: KeyBindingAction) {
  switch (action) {
    case KeyBindingAction.ToggleLensFlare:  return 'lensflare'
    case KeyBindingAction.ToggleBiomes:     return 'biomes'
    case KeyBindingAction.ToggleClouds:     return 'clouds'
    case KeyBindingAction.ToggleAtmosphere: return 'atmosphere'
  }
}
function getIcon(action: KeyBindingAction) {
  switch (action) {
    case KeyBindingAction.ToggleLensFlare:  return 'mingcute:sun-line'
    case KeyBindingAction.ToggleBiomes:     return 'mingcute:mountain-2-line'
    case KeyBindingAction.ToggleClouds:     return 'mingcute:clouds-line'
    case KeyBindingAction.ToggleAtmosphere: return 'material-symbols:line-curve-rounded'
  }
}
function tryGetKeyRepresentation(key: string) {
  switch (key) {
    case 'ARROWUP': return 'mingcute:arrow-up-line'
    case 'ARROWRIGHT': return 'mingcute:arrow-right-line'
    case 'ARROWDOWN': return 'mingcute:arrow-down-line'
    case 'ARROWLEFT': return 'mingcute:arrow-left-line'
    default: return undefined
  }
}
</script>

<style scoped lang="scss">
#dialog-settings {
  .settings-grid {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    grid-template-rows: 1fr;
    grid-template-areas:
      "theme hr binds";
    gap: 1rem;

    .settings-theme, .settings-keybinds {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;

      table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0 0.125rem;
      }
    }
    .settings-theme {
      grid-area: theme;
    }
    .settings-keybinds {
      grid-area: binds;

      .keybind {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .keybinds-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding-right: 0.5rem;
        flex: 1;
      }
      .keybinds-key {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 6rem;
        min-height: 2rem;
        background: var(--lg-panel);
        border: 1px solid var(--lg-accent);
        border-radius: 0.25rem;
        font-weight: 600;
        padding: 0 0.5rem;
        &.unset {
          border-color: var(--lg-warn-active);
        }
      }
    }
  }
}

@media screen and (max-width: 767px) {
  #dialog-settings {
    .settings-grid {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto;
      grid-template-areas:
        "theme";
      gap: 0;

      .settings-keybinds, hr {
        display: none;
      }
    }
  }
}

@media screen and (max-width: 567px) {
  #dialog-settings {
    width: 100%;
  }
}
</style>