<template>
  <DialogElement ref="dialogRef" id="dialog-editor-init" :showActions="true" aria-label="Introduction dialog">
    <template v-slot:content>
      <div class="init-container">
        <section class="intro">
          <AppLogo />
          <div>
            <h2>
              <iconify-icon icon="mingcute:planet-line" width="1.5rem" aria-hidden="true" /> Welcome to Lagrange!
            </h2>
            <p>
              Lagrange is a fully procedural planet builder, perfect for
              worldbuilding and tying your lore to a proper planet,
              solar system or even an entire galaxy!
            </p>
            <br>
            <NotificationElement type="wip">
              Currently work-in-progress. More features are planned for the next versions!
            </NotificationElement>
          </div>
        </section>
        <CollapsibleSection icon="oui:keyboard-shortcut">
          <template v-slot:title>Shortcuts</template>
          <template v-slot:content>
            <p>
              Key bindings can be reassigned in the app settings!
              <span class=nowrap>
                (<iconify-icon style="transform: translateY(0.125rem);" icon="mingcute:settings-6-line" width="1rem" aria-hidden="true" />)
              </span>
            </p>
            <ul class="controls">
              <li class="lg">
                <span class="keybind">{{ keybinds[0]?.key }}</span>
                <span>Toggle lens flare</span>
              </li>
              <li class="lg">
                <span class="keybind">{{ keybinds[1]?.key }}</span>
                <span>Toggle biomes</span>
              </li>
              <li class="lg">
                <span class="keybind">{{ keybinds[2]?.key }}</span>
                <span>Toggle clouds</span>
              </li>
              <li class="lg">
                <span class="keybind">{{ keybinds[3]?.key }}</span>
                <span>Toggle atmosphere</span>
              </li>
            </ul>
          </template>
        </CollapsibleSection>
        <CollapsibleSection icon="mingcute:settings-1-line">
          <template v-slot:title>Top bar - Naming & data</template>
          <template v-slot:content>
            <ul class="controls">
              <li class="lg"><iconify-icon icon="mingcute:edit-2-line"   width="1.5rem" aria-hidden="true" />: Rename planet</li>
              <li class="lg"><iconify-icon icon="tabler:reload"          width="1.5rem" aria-hidden="true" />: Reset to defaults</li>
              <li class="lg"><iconify-icon icon="mingcute:upload-line"   width="1.5rem" aria-hidden="true" />: Import planet</li>
              <li class="lg"><iconify-icon icon="mingcute:download-line" width="1.5rem" aria-hidden="true" />: Export planet</li>
            </ul>
          </template>
        </CollapsibleSection>
        <CollapsibleSection icon="mingcute:layout-bottom-close-line">
          <template v-slot:title>Footer - Miscellaneous</template>
          <template v-slot:content>
            <ul class="controls">
              <li class="lg"><iconify-icon icon="mingcute:github-line"      width="1.5rem" aria-hidden="true" />: Github page</li>
              <li class="lg"><iconify-icon icon="mingcute:settings-6-line"  width="1.5rem" aria-hidden="true" />: App settings</li>
              <li class="lg"><iconify-icon icon="mingcute:information-line" width="1.5rem" aria-hidden="true"/>: About Lagrange</li>
            </ul>
          </template>
        </CollapsibleSection>
        <div class="init-checkbox">
          <label for="show-on-next-visits">Show this introduction next time?</label>
          <input id="show-on-next-visits" class="lg" type="checkbox" v-model="shouldShowOnNextVisits">
        </div>
      </div>
    </template>
    <template v-slot:actions>
      <button class="lg" @click="doClose" autofocus>
        <iconify-icon icon="mingcute:check-line" width="1.25rem" aria-hidden="true" /> Get started!
      </button>
    </template>
  </DialogElement>
</template>
<script setup lang="ts">
import type { IDBKeyBinding } from '@/dexie';
import AppLogo from '../elements/AppLogo.vue';
import DialogElement from '../elements/DialogElement.vue';
import NotificationElement from '../elements/NotificationElement.vue'
import { ref, type Ref } from 'vue';
import CollapsibleSection from '../elements/CollapsibleSection.vue';

const dialogRef: Ref<{ open: Function, close: Function }|null> = ref(null)
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

    #app-logo, #app-logo-uwu {
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
@media screen and (max-width:1023px) {
  #dialog-editor-init {
    .controls {
      grid-template-columns: 1fr 1fr;
    }
  }
}
@media screen and (max-width:767px) {
  #dialog-editor-init {
    min-width: 0;

    .init-container {
      align-items: center;
      justify-content: center;
      grid-template-rows: auto auto;
      grid-template-columns: 1fr;

      #app-logo, #app-logo-uwu {
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
@media screen and (max-width:567px) {
  #dialog-editor-init {
    .controls {
      grid-template-columns: 1fr;
    }
  }
}
</style>