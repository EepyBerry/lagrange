<template>
  <DialogElement ref="dialogRef" id="dialog-editor-init" :showActions="true">
    <template v-slot:content>
      <div class="init-container">
        <div class="init-text">
          <section class="intro">
            <AppLogo />
            <div>
              <h2 style="margin-bottom: 1rem;">
                <iconify-icon icon="mingcute:planet-line" width="1.5rem" /> Welcome to Lagrange!
              </h2>
              <p>
                Lagrange is a fully procedural planet builder,
                perfect for worldbuilding and tying your lore to a proper planet,
                solar system or even an entire galaxy! <i><sub>(that'd take a long time to make, however...)</sub></i>
              </p>
            </div>
          </section>
          <hr>
          <section>
            <h3>Top bar - Planet information</h3>
            <ul class="controls">
              <li class="lg"><iconify-icon icon="mingcute:edit-2-line" width="1.5rem" />:   Rename planet</li>
              <li class="lg"><iconify-icon icon="tabler:reload" width="1.5rem" />:          Reset to defaults</li>
              <li class="lg"><iconify-icon icon="mingcute:upload-line" width="1.5rem" />:   Import planet</li>
              <li class="lg"><iconify-icon icon="mingcute:download-line" width="1.5rem" />: Export planet</li>
            </ul>
          </section>
          <section>
            <h3>Sidebar - Editor controls</h3>
            <ul class="controls">
              <li class="lg"><iconify-icon icon="mingcute:sun-line" width="1.5rem" />:                   Lighting</li>
              <li class="lg"><iconify-icon icon="tabler:gizmo" width="1.5rem" />:                        Planet</li>
              <li class="lg"><iconify-icon icon="mingcute:planet-line" width="1.5rem" />:                Surface</li>
              <li class="lg"><iconify-icon icon="mingcute:mountain-2-line" width="1.5rem" />:            Biomes</li>
              <li class="lg"><iconify-icon icon="mingcute:clouds-line" width="1.5rem" />:                Clouds</li>
              <li class="lg"><iconify-icon icon="material-symbols:line-curve-rounded" width="1.5rem" />: Atmosphere</li>
            </ul>
          </section>
          <section>
            <h3>Footer - Miscellaneous</h3>
            <ul class="controls">
              <li class="lg"><iconify-icon icon="mingcute:github-line" width="1.5rem" />:      GitHub link <i>(new tab)</i></li>
              <li class="lg"><iconify-icon icon="mingcute:settings-6-line" width="1.5rem" />:  Settings</li>
              <li class="lg"><iconify-icon icon="mingcute:information-line" width="1.5rem" />: About Lagrange</li>
            </ul>
          </section>
          <hr>
          <div class="init-checkbox">
            <label for="hide-on-next-visits">Hide this introduction next time?</label>
            <input id="hide-on-next-visits" type="checkbox" v-model="shouldHideOnNextVisits">
          </div>
        </div>
      </div>
    </template>
    <template v-slot:actions>
      <button class="lg" @click="doClose" autofocus>
        <iconify-icon icon="mingcute:check-line" width="1.25rem" /> Got it!
      </button>
    </template>
  </DialogElement>
</template>
<script setup lang="ts">
import AppLogo from '../elements/AppLogo.vue';
import DialogElement from '../elements/DialogElement.vue';
import { ref, type Ref } from 'vue';

const dialogRef: Ref<{ open: Function, close: Function }|null> = ref(null)
const shouldHideOnNextVisits = ref(false)

const $emit = defineEmits(['hideOnNextVisits'])
defineExpose({ open: () => dialogRef.value?.open() })

function doClose() {
  if (shouldHideOnNextVisits.value) {
    $emit('hideOnNextVisits')
  }
  dialogRef.value?.close()
}
</script>

<style scoped lang="scss">
#dialog-editor-init {
  min-width: 24rem;

  .init-container {
    padding: 1rem 0;
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: auto 1fr;
    gap: 1rem;

    #app-logo, #app-logo-uwu {
      grid-column: 1;
      width: clamp(160px, 1rem + 10vw, 200px);
      align-self: center;
      justify-self: center;
    }
    .init-text {
      grid-column: 2;
      max-width: 48rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      .init-checkbox {
        display: flex;
        gap: 2rem;
        align-items: center;
      }
    }
  }
  .intro {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 1rem;
  }
  .controls {
    display: flex;
    justify-content: flex-start;
    gap: 0.5rem;
    margin-top: 0.5rem;
    flex-wrap: wrap;

    li {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      flex-wrap: nowrap;
      text-wrap: nowrap;
      width: min-content;
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

      .init-text {
        grid-column: 1;
        grid-row: 2;
        text-align: center;
        section > h3 {
          justify-content: center;
        }

        .init-checkbox {
          text-align: start;
          justify-content: space-between;
          gap: 0;
        }
      }
    }
    .controls {
      align-items: center;
    }
  }
}
</style>