<template>
  <DialogElement ref="dialogRef" id="dialog-settings" :showTitle="true">
    <template v-slot:title>
      <iconify-icon icon="mingcute:settings-3-line" width="1.5rem" /> Settings
    </template>
    <template v-slot:content>
      <div class="settings-grid">
        <div class="settings-theme">
          <h3>Graphics</h3>
          <ParameterTable>
            <ParameterRadio>
              <template v-slot:title>
                Choose theme to use:
              </template>
              <template v-slot:options>
                <ParameterRadioOption v-model="appGraphicsSettings.theme"
                  name="theme-select"
                  :id="'0'"
                  value="default"
                  icon="mingcute:planet-line"
                  ariaLabel="Default theme"
                >
                  Default
                </ParameterRadioOption>
                <ParameterRadioOption v-model="appGraphicsSettings.theme"
                  name="theme-select"
                  :id="'1'"
                  value="supernova"
                  icon="ph:star-four"
                  ariaLabel="Supernova theme"
                >
                  Supernova
                </ParameterRadioOption>
                <ParameterRadioOption v-model="appGraphicsSettings.theme"
                  name="theme-select"
                  :id="'1'"
                  value="voyager"
                  icon="hugeicons:satellite-02"
                  ariaLabel="Voyager theme"
                >
                  Voyager
                </ParameterRadioOption>
              </template>
            </ParameterRadio>
            <ParameterDivider />
            <ParameterField
              id="settings-font"
              type="checkbox"
              v-model="appGraphicsSettings.font"
            >
              Enable monospace font:
            </ParameterField>
          </ParameterTable>
        </div>
        <hr>
        <div class="settings-keybinds">
          <h3>Key bindings</h3>
          <ParameterTable>
            <tr v-for="kb of keyBinds" :key="kb.action">
              <td>
                <div class="keybind">
                  <div class="keybinds-label">
                    <iconify-icon :icon="getIcon(kb.action)" width="1.5rem" aria-hidden="true" />
                    {{ getLabel(kb.action) }}
                  </div>
                  <span class="keybinds-key">{{ kb.key }}</span>
                <button class="lg" aria-label="Edit key binding">
                  <iconify-icon icon="mingcute:edit-2-line" width="1.25rem" aria-hidden="true" />
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
import DialogElement from './elements/DialogElement.vue';
import { onMounted, ref, watch, type Ref } from 'vue';
import { LG_EDITOR_INPUTS } from '@/core/globals';
import ParameterTable from './parameters/ParameterTable.vue';
import ParameterRadio from './parameters/ParameterRadio.vue';
import ParameterRadioOption from './parameters/ParameterRadioOption.vue';
import * as DexieUtils from '@/utils/dexie-utils';
import ParameterField from './parameters/ParameterField.vue';
import ParameterDivider from './parameters/ParameterDivider.vue';

const dialogRef: Ref<{ open: Function, close: Function }|null> = ref(null)
defineExpose({ open: () => dialogRef.value?.open() })

const appGraphicsSettings: Ref<IDBSettings> = ref({ id: 0, theme: '', font: '' })
const keyBinds: Ref<IDBKeyBinding[]> = ref([])

onMounted(async () => {
  let settings = await idb.settings.limit(1).toArray()
  if (settings?.length === 0) {
    await DexieUtils.addDefaultSettings()
    settings = await idb.settings.limit(1).toArray()
  }
  appGraphicsSettings.value = settings[0]
  console.log(appGraphicsSettings.value)

  let kb = await idb.keyBindings.limit(4).toArray()
  if (kb.length === 0) {
    console.warn('No keybinds found in IndexedDB, adding defaults')
    await DexieUtils.addDefaultKeyBindings()
    kb = await idb.keyBindings.toArray()
    keyBinds.value.push(...kb)
  }
  keyBinds.value.push(...kb)
})
watch(() => appGraphicsSettings.value, () => {
  updateSettings()
}, { deep: true })

async function updateSettings() {
  document.documentElement.setAttribute('data-theme', appGraphicsSettings.value!.theme)
  document.documentElement.setAttribute('data-font', appGraphicsSettings.value!.font ? 'monospace' : 'default')
  await idb.settings.update(appGraphicsSettings.value!.id, {
    theme: appGraphicsSettings.value!.theme,
    font: appGraphicsSettings.value!.font
  })
}

function saveInput(kb: IDBKeyBinding) {
  idb.keyBindings
    .update(kb.id, { key: kb.key })
    .then(async () => {
      const bind = await idb.keyBindings.get(kb.id)
      const index = LG_EDITOR_INPUTS.findIndex(kb => kb.id === bind!.id)
      LG_EDITOR_INPUTS[index] = bind!
  }).catch((e) => console.error('(LG:Dexie) Keybinds failed to update', e));
}

function getLabel(action: KeyBindingAction) {
  switch (action) {
    case KeyBindingAction.ToggleLensFlare:  return 'Toggle lens-flare'
    case KeyBindingAction.ToggleBiomes:     return 'Toggle biomes'
    case KeyBindingAction.ToggleClouds:     return 'Toggle clouds'
    case KeyBindingAction.ToggleAtmosphere: return 'Toggle atmosphere'
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
        min-width: 4rem;
        min-height: 2rem;
        border: 1px solid var(--lg-accent);
        border-radius: 0.25rem;
        font-weight: 600;
        padding: 0 0.5rem;
      }
    }
    hr { border: 1px solid var(--lg-input); }
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