<template>
  <DialogElement
    id="dialog-editor-init"
    ref="dialogRef"
    :show-actions="true"
    :closeable="true"
    :prevent-click-close="true"
    :aria-label="$t('a11y.dialog_init')"
  >
    <template #content>
      <div class="init-container">
        <section class="intro">
          <div class="logo">
            <AppLogo :show-update="true" />
          </div>
          <div>
            <h2>
              <iconify-icon icon="mingcute:planet-line" width="1.5rem" aria-hidden="true" />
              {{ $t('dialog.init.$title') }}!
            </h2>
            <p class="intro-text">
              {{ $t('dialog.init.introduction') }}
            </p>
            <br />

            <CollapsibleSection icon="mingcute:news-line">
              <template #title>{{ $t('dialog.init.update_title') }}</template>
              <template #content>
                {{ $t('dialog.init.update_brief') }}
              </template>
            </CollapsibleSection>
            <NotificationElement id="tmp-notification" type="wip">
              {{ $t('dialog.init.$tmp_wip') }}
            </NotificationElement>
          </div>
        </section>

        <CollapsibleSection icon="oui:keyboard-shortcut">
          <template #title>{{ $t('dialog.init.shortcuts') }}</template>
          <template #content>
            <p>
              {{ $t('dialog.init.shortcuts_note') }}
              <span class="nowrap">
                (<iconify-icon
                  style="transform: translateY(0.125rem)"
                  icon="mingcute:settings-6-line"
                  width="1rem"
                  aria-hidden="true"
                />)
              </span>
            </p>
            <ul class="controls">
              <li class="lg">
                <span class="keybind">{{ keybinds[0]?.key }}</span>
                <span>{{ $t('dialog.init.shortcuts_lensflare') }}</span>
              </li>
              <li class="lg">
                <span class="keybind">{{ keybinds[1]?.key }}</span>
                <span>{{ $t('dialog.init.shortcuts_biomes') }}</span>
              </li>
              <li class="lg">
                <span class="keybind">{{ keybinds[2]?.key }}</span>
                <span>{{ $t('dialog.init.shortcuts_clouds') }}</span>
              </li>
              <li class="lg">
                <span class="keybind">{{ keybinds[3]?.key }}</span>
                <span>{{ $t('dialog.init.shortcuts_atmosphere') }}</span>
              </li>
              <li class="lg">
                <span class="keybind">{{ keybinds[4]?.key }}</span>
                <span>{{ $t('dialog.init.shortcuts_screenshot') }}</span>
              </li>
            </ul>
          </template>
        </CollapsibleSection>

        <CollapsibleSection icon="mingcute:settings-1-line">
          <template #title>{{ $t('dialog.init.topbar') }}</template>
          <template #content>
            <ul class="controls">
              <li class="lg">
                <iconify-icon icon="mingcute:edit-2-line" width="1.25rem" aria-hidden="true" />
                {{ $t('dialog.init.topbar_rename') }}
              </li>
              <li class="lg">
                <iconify-icon icon="tabler:reload" width="1.25rem" aria-hidden="true" />
                {{ $t('dialog.init.topbar_reset') }}
              </li>
              <li class="lg">
                <iconify-icon icon="mingcute:save-2-line" width="1.25rem" aria-hidden="true" />
                {{ $t('dialog.init.topbar_save') }}
              </li>
              <li class="lg">
                <iconify-icon icon="simple-icons:gltf" width="1.25rem" aria-hidden="true" />
                {{ $t('dialog.init.topbar_gltf') }}
              </li>
              <li class="lg">
                <iconify-icon icon="mingcute:upload-line" width="1.25rem" aria-hidden="true" />
                {{ $t('dialog.init.topbar_import') }}
              </li>
              <li class="lg">
                <iconify-icon icon="mingcute:folder-zip-line" width="1.25rem" aria-hidden="true" />
                {{ $t('dialog.init.topbar_export_all') }}
              </li>
            </ul>
          </template>
        </CollapsibleSection>

        <CollapsibleSection icon="mingcute:layout-bottom-close-line">
          <template #title>{{ $t('dialog.init.footer') }}</template>
          <template #content>
            <ul class="controls">
              <li class="lg">
                <iconify-icon icon="mingcute:information-line" width="1.25rem" aria-hidden="true" />
                {{ $t('dialog.init.footer_about') }}
              </li>
              <li class="lg">
                <iconify-icon icon="mingcute:settings-6-line" width="1.25rem" aria-hidden="true" />
                {{ $t('dialog.init.footer_settings') }}
              </li>
              <li class="lg">
                <iconify-icon icon="mingcute:github-line" width="1.25rem" aria-hidden="true" />
                {{ $t('dialog.init.footer_github') }}
              </li>
            </ul>
          </template>
        </CollapsibleSection>

        <div class="init-actions">
          <div class="init-checkbox important">
            <label for="enable-persistence">{{ $t('dialog.init.enable_persistence') }}</label>
            <input id="enable-persistence" v-model="shouldEnableStoragePersistence" class="lg" type="checkbox" />
          </div>
          <div class="init-checkbox important">
            <label for="show-on-next-visits">{{ $t('dialog.init.show_next_time') }}</label>
            <input id="show-on-next-visits" v-model="shouldShowOnNextVisits" class="lg" type="checkbox" />
          </div>
        </div>
      </div>
    </template>
    <template #actions>
      <button class="lg success" autofocus @click="doClose">
        <iconify-icon icon="mingcute:check-line" width="1.25rem" aria-hidden="true" />
        {{ $t('dialog.init.$action_confirm') }}
      </button>
    </template>
  </DialogElement>
</template>

<script setup lang="ts">
import type { IDBKeyBinding } from '@/dexie.config'
import AppLogo from '../elements/AppLogo.vue'
import DialogElement from '../elements/DialogElement.vue'
import NotificationElement from '../elements/NotificationElement.vue'
import { ref, type Ref } from 'vue'
import CollapsibleSection from '../elements/CollapsibleSection.vue'

const dialogRef: Ref<{ open: () => void; close: () => void } | null> = ref(null)
const shouldShowOnNextVisits = ref(true)
const shouldEnableStoragePersistence = ref(true)

const $emit = defineEmits(['disableInitDialog', 'enablePersistence'])
defineProps<{ keybinds: IDBKeyBinding[] }>()
defineExpose({ open: () => dialogRef.value?.open() })

function doClose() {
  if (!shouldShowOnNextVisits.value) {
    $emit('disableInitDialog')
  }
  if (shouldEnableStoragePersistence.value) {
    $emit('enablePersistence')
  }
  dialogRef.value?.close()
}
</script>

<style scoped lang="scss">
#dialog-editor-init {
  .logo {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #tmp-notification {
    margin-top: 0.5rem;
  }

  .init-container {
    max-width: 60rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;

    .init-actions {
      width: 100%;
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: center;
      gap: 0.25rem;

      .init-checkbox {
        background: var(--lg-panel);
        border: 1px solid var(--lg-input);
        border-radius: 4px;
        padding: 0.25rem 0.5rem;
        display: flex;
        gap: 2rem;
        align-items: center;
        justify-content: flex-end;
        text-align: end;
      }
    }
    .collapsible-section {
      width: 100%;
    }
  }
  .intro {
    padding: 1rem 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 1rem;
    font-size: 0.925rem;

    h2 {
      font-size: 1.75rem;
      margin-bottom: 1rem;
    }
    h3 {
      margin-top: 0.5rem;
      margin-bottom: 0.75rem;
    }
  }
  .controls {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
    justify-content: flex-start;
    gap: 1rem;
    margin-top: 0.5rem;
    flex-wrap: wrap;

    li {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: nowrap;
      text-overflow: ellipsis;
      height: 2.5rem;

      .keybind {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 2rem;
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
      iconify-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 2rem;
        min-height: 2rem;
        background: var(--lg-panel);
        border: 1px solid var(--lg-accent);
        border-radius: 0.25rem;
      }
    }
  }
}
@media screen and (max-width: 767px) {
  #dialog-editor-init {
    min-width: 0;

    .logo {
      display: none;
    }

    .init-container {
      align-items: center;
      justify-content: center;
      grid-template-rows: auto auto;

      section.intro {
        font-size: 0.875rem;
        h2 {
          justify-content: center;
          font-size: 1.375rem;
        }
        h3.update-title {
          justify-content: center;
          font-size: 1.25rem;
        }
        .intro-text {
          text-align: center;
        }
      }

      .init-checkbox {
        text-align: start;
        justify-content: space-between;
        gap: 1rem;
      }

      .init-actions {
        align-items: unset;
      }
    }
    .controls {
      align-items: center;
    }
  }
}
</style>
