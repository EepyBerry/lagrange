<template>
  <DialogElement ref="dialogRef" id="dialog-settings">
    <template v-slot:content>
      <div class="settings-grid">
        <div class="settings-theme">
          <h3>Theme</h3>
          
        </div>
        <div class="settings-keybinds">
          <h3>Key bindings</h3>
          <table>
            <tr v-for="kb of keyBinds" :key="kb.action">
              <td>
                <div class="keybinds-label">
                  <iconify-icon :icon="getIcon(kb.action)" width="1.5rem" />
                  {{ getLabel(kb.action) }}
                </div>
              </td>
              <td>
                <span class="keybinds-key">{{ kb.key }}</span>
              </td>
              <td>
                <button class="lg">
                  <iconify-icon icon="mingcute:edit-2-line" width="1.25rem" />
                </button>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </template>
  </DialogElement>
</template>

<script setup lang="ts">
import { KeyBindingAction, idb, type IDBKeyBinding } from '@/dexie';
import DialogElement from './elements/DialogElement.vue';
import { onMounted, onUnmounted, ref, toRaw, type Ref } from 'vue';
import { LG_EDITOR_INPUTS } from '@/core/globals';

const dialogRef: Ref<{ open: Function, close: Function }|null> = ref(null)
defineExpose({ open: () => dialogRef.value?.open() })

const keyBinds: Ref<IDBKeyBinding[]> = ref([])

onMounted(async () => {
  await idb.open()
  const kb = await idb.keyBindings.toArray()
  if (kb.length === 0) {
    console.warn('No keybinds found in IndexedDB, adding defaults')
    await addDefaults()
    const inserted = await idb.keyBindings.toArray()
    keyBinds.value.push(...inserted)
  } else {
    keyBinds.value.push(...kb)
  }
})
onUnmounted(async () => idb.close())

async function addDefaults(): Promise<any> {
  return idb.keyBindings.bulkAdd([
    { action: KeyBindingAction.ToggleLensFlare,   key: 'L' },
    { action: KeyBindingAction.ToggleBiomes,      key: 'B' },
    { action: KeyBindingAction.ToggleClouds,      key: 'C' },
    { action: KeyBindingAction.ToggleAtmosphere,  key: 'A' },
  ]).then(
    async () => {
      console.debug('(LG:Dexie) Keybinds defaults inserted')
      const binds = await idb.keyBindings.toArray()
      LG_EDITOR_INPUTS.splice(0)
      LG_EDITOR_INPUTS.push(...binds)
    },
    () => console.debug('(LG:Dexie) Keybinds defaults failed to insert')
  ).catch((e) => console.error('(LG:Dexie) Keybinds defaults failed to insert', e));
}

function saveInput(kb: IDBKeyBinding) {
  idb.keyBindings
    .put(kb)
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
    grid-template-columns: auto 1fr;
    grid-template-rows: 1fr;
    grid-template-areas:
      "theme binds";
    gap: 1.5rem;

    .settings-theme, .settings-keybinds {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }
    .settings-keybinds {
      table {
        width: 100%;
        border-spacing: 0.5rem 0.125rem;
        padding: 0.375rem 0;
        border-radius: 4px;
        border: 1px solid var(--lg-input);
      }
      .keybinds-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding-right: 0.5rem;
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
  }
}

@media screen and (max-width: 767px) {
  #dialog-settings {

  }
}
</style>