<template>
  <DialogElement ref="dialogRef" id="dialog-editor-init" :showActions="true" :aria-label="$t('a11y.dialog_init')">
    <template v-slot:content>
      <div class="init-container">
        <section class="intro">
          <AppLogo />
          <div>
            <h2>
              <iconify-icon icon="mingcute:planet-line" width="1.5rem" aria-hidden="true" />
              {{ $t('dialog.init.$title') }}!
            </h2>
            <p>
              {{ $t('dialog.init.introduction') }}
            </p>
            <br />
            <NotificationElement type="wip">
              {{ $t('dialog.init.$tmp_wip') }}
            </NotificationElement>
          </div>
        </section>

        <CollapsibleSection icon="oui:keyboard-shortcut">
          <template v-slot:title>{{ $t('dialog.init.shortcuts') }}</template>
          <template v-slot:content>
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
            </ul>
          </template>
        </CollapsibleSection>

        <CollapsibleSection icon="mingcute:settings-1-line">
          <template v-slot:title>{{ $t('dialog.init.topbar') }}</template>
          <template v-slot:content>
            <ul class="controls">
              <li class="lg">
                <iconify-icon icon="mingcute:edit-2-line" width="1.5rem" aria-hidden="true" /> :
                {{ $t('dialog.init.topbar_rename') }}
              </li>
              <li class="lg">
                <iconify-icon icon="tabler:reload" width="1.5rem" aria-hidden="true" /> :
                {{ $t('dialog.init.topbar_reset') }}
              </li>
              <li class="lg">
                <iconify-icon icon="mingcute:upload-line" width="1.5rem" aria-hidden="true" /> :
                {{ $t('dialog.init.topbar_import') }}
              </li>
              <li class="lg">
                <iconify-icon icon="mingcute:download-line" width="1.5rem" aria-hidden="true" /> :
                {{ $t('dialog.init.topbar_export') }}
              </li>
            </ul>
          </template>
        </CollapsibleSection>

        <CollapsibleSection icon="mingcute:layout-bottom-close-line">
          <template v-slot:title>{{ $t('dialog.init.footer') }}</template>
          <template v-slot:content>
            <ul class="controls">
              <li class="lg">
                <iconify-icon icon="mingcute:github-line" width="1.5rem" aria-hidden="true" /> :
                {{ $t('dialog.init.footer_github') }}
              </li>
              <li class="lg">
                <iconify-icon icon="mingcute:settings-6-line" width="1.5rem" aria-hidden="true" /> :
                {{ $t('dialog.init.footer_settings') }}
              </li>
              <li class="lg">
                <iconify-icon icon="mingcute:information-line" width="1.5rem" aria-hidden="true" /> :
                {{ $t('dialog.init.footer_about') }}
              </li>
            </ul>
          </template>
        </CollapsibleSection>

        <div class="init-checkbox">
          <label for="show-on-next-visits">{{ $t('dialog.init.show_next_time') }}</label>
          <input id="show-on-next-visits" class="lg" type="checkbox" v-model="shouldShowOnNextVisits" />
        </div>
      </div>
    </template>
    <template v-slot:actions>
      <button class="lg" @click="doClose" autofocus>
        <iconify-icon icon="mingcute:check-line" width="1.25rem" aria-hidden="true" />
        {{ $t('dialog.init.$action_confirm') }}
      </button>
    </template>
  </DialogElement>
</template>

<script setup lang="ts">
import type { IDBKeyBinding } from '@/dexie'
import AppLogo from '../elements/AppLogo.vue'
import DialogElement from '../elements/DialogElement.vue'
import NotificationElement from '../elements/NotificationElement.vue'
import { ref, type Ref } from 'vue'
import CollapsibleSection from '../elements/CollapsibleSection.vue'

const dialogRef: Ref<{ open: Function; close: Function } | null> = ref(null)
const shouldShowOnNextVisits = ref(true)

const $emit = defineEmits(['disableInitDialog'])
defineProps<{ keybinds: IDBKeyBinding[] }>()
defineExpose({ open: () => dialogRef.value?.open() })

function doClose() {
  if (!shouldShowOnNextVisits.value) {
    $emit('disableInitDialog')
  }
  dialogRef.value?.close()
}
</script>

<style scoped lang="scss">
#dialog-editor-init {
  .init-container {
    max-width: 56rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    #app-logo,
    #app-logo-uwu {
      width: clamp(160px, 1rem + 10vw, 200px);
      align-self: center;
      justify-self: center;
    }
    .init-checkbox {
      display: flex;
      gap: 2rem;
      align-items: center;
      justify-content: flex-end;
    }
  }
  .intro {
    padding: 1rem 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 1rem;
    font-size: 1rem;
    h2 {
      font-size: 1.75rem;
      margin-bottom: 1rem;
    }
  }
  .controls {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    justify-content: flex-start;
    gap: 1rem;
    margin-top: 0.5rem;
    flex-wrap: wrap;

    li {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      flex-wrap: nowrap;
      text-overflow: ellipsis;

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
    }
  }
}
@media screen and (max-width: 1023px) {
  #dialog-editor-init {
    .controls {
      grid-template-columns: 1fr 1fr;
    }
  }
}
@media screen and (max-width: 767px) {
  #dialog-editor-init {
    min-width: 0;

    .init-container {
      align-items: center;
      justify-content: center;
      grid-template-rows: auto auto;
      grid-template-columns: 1fr;

      #app-logo,
      #app-logo-uwu {
        display: none;
      }

      section.intro {
        font-size: 0.875rem;
        h2 {
          justify-content: center;
          font-size: 1.375rem;
        }
      }

      .init-checkbox {
        text-align: start;
        justify-content: space-between;
        gap: 0;
      }
    }
    .controls {
      align-items: center;
    }
  }
}
@media screen and (max-width: 567px) {
  #dialog-editor-init {
    .controls {
      grid-template-columns: 1fr;
    }
  }
}
</style>
