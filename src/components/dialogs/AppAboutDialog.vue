<template>
  <DialogElement
    id="dialog-about"
    ref="dialogRef"
    :show-title="false"
    :closeable="true"
    :aria-label="$t('a11y.dialog_about')"
  >
    <template #content >
      <div class="about-grid">
        <div class="about-logo">
          <AppLogo />
        </div>
        <div class="about-text">
          <p class="highlight">{{ $t('dialog.about.description') }}</p>
          <p>{{ $t('dialog.about.motivation') }}</p>
          <hr width="100%" />
          <p>{{ $t('dialog.about.tech') }}:</p>
        </div>
        <div class="about-tech">
          <div class="tech-block">
            <iconify-icon mode="svg" icon="simple-icons:vuedotjs" width="3rem" style="fill: var(--lg-text)" />
            <div>
              <p>{{ $t('dialog.about.prefix_framework') }} <span class="highlight nowrap">Vue + Vite</span></p>
              <ChipElement>3.5.12</ChipElement> <ChipElement>5.4.10</ChipElement>
            </div>
          </div>
          <div class="tech-block">
            <iconify-icon mode="svg" icon="logos:threejs" width="3rem" style="fill: var(--lg-text)" />
            <div>
              <p>{{ $t('dialog.about.prefix_engine') }} <span class="highlight">three.js</span></p>
              <ChipElement>r169</ChipElement>
            </div>
          </div>
        </div>
        <div class="about-copyright">
          <p>{{ $t('dialog.about.built_with_love') }}</p>
          <p>
            © {{ new Date().getFullYear() }} EepyBerry,
            <a href="https://github.com/EepyBerry/lagrange/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
              {{ $t('dialog.about.license') }}
            </a>
          </p>
        </div>
        <CollapsibleSection class="about-updates" icon="mingcute:news-line">
          <template #title>{{ $t('dialog.about.changelogs.$title') }}</template>
          <template #content>
            <CollapsibleSection class="about-update-inner" icon="mingcute:world-2-line">
              <template #title>{{ $t('dialog.about.changelogs.02_title') }}</template>
              <template #content>
                <ul style="list-style-type: disc; margin-left: 1rem">
                  <li starred>{{ $t('dialog.about.changelogs.02_codex') }}</li>
                  <li>{{ $t('dialog.about.changelogs.02_ui') }}</li>
                  <li>{{ $t('dialog.about.changelogs.02_a11y') }}</li>
                </ul>
              </template>
            </CollapsibleSection>
            <CollapsibleSection class="about-update-inner" icon="mingcute:mountain-2-line">
              <template #title>{{ $t('dialog.about.changelogs.03_title') }}</template>
              <template #content>
                <ul style="list-style-type: disc; margin-left: 1rem">
                  <li starred>{{ $t('dialog.about.changelogs.03_biomes') }}</li>
                  <li>{{ $t('dialog.about.changelogs.03_linux') }}</li>
                  <li>{{ $t('dialog.about.changelogs.03_fixes') }}</li>
                </ul>
              </template>
            </CollapsibleSection>
            <CollapsibleSection class="about-update-inner" icon="mingcute:planet-line">
              <template #title>{{ $t('dialog.about.changelogs.04_title') }}</template>
              <template #content>
                <ul style="list-style-type: disc; margin-left: 1rem">
                  <li starred>{{ $t('dialog.about.changelogs.04_params') }}</li>
                  <li>{{ $t('dialog.about.changelogs.04_ui') }}</li>
                  <li>{{ $t('dialog.about.changelogs.04_misc') }}</li>
                </ul>
              </template>
            </CollapsibleSection>
          </template>
        </CollapsibleSection>
        <CollapsibleSection class="about-credits" icon="mingcute:bling-line">
          <template #title>{{ $t('dialog.about.credits.$title') }}</template>
          <template #content>
            <ul style="list-style-type: disc; margin-left: 1rem">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <li v-html="$t('dialog.about.credits.libs')"></li>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <li v-html="$t('dialog.about.credits.glsl_main')"></li>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <li v-html="$t('dialog.about.credits.glsl_misc')"></li>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <li v-html="$t('dialog.about.credits.contributors')"></li>
            </ul>
          </template>
        </CollapsibleSection>
      </div>
      <span id="app-version">{{ version }}</span>
    </template>
  </DialogElement>
</template>

<script setup lang="ts">
import AppLogo from '../elements/AppLogo.vue'
import DialogElement from '../elements/DialogElement.vue'
import ChipElement from '../elements/ChipElement.vue'
import { onMounted, ref, type Ref } from 'vue'
import CollapsibleSection from '../elements/CollapsibleSection.vue'

const version = ref('UNKNOWN_VERSION')
const dialogRef: Ref<{ open: () => void; close: () => void } | null> = ref(null)
defineExpose({ open: () => dialogRef.value?.open(), close: () => dialogRef.value?.close() })

onMounted(() => (version.value = import.meta.env.APP_VERSION))
</script>

<style scoped lang="scss">
#dialog-about {
  .about-grid {
    display: grid;
    grid-template-areas:
      'logo text'
      'logo tech'
      'updt updt'
      'cdts cdts'
      'crgt crgt';
    gap: 1rem;

    .about-logo {
      position: relative;
      grid-area: logo;
      display: flex;
      justify-content: center;
    }
    .about-text {
      grid-area: text;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-end;
      font-size: 1rem;
      hr {
        margin: 1rem 0;
      }
    }
    .about-tech {
      grid-area: tech;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 2.5rem;

      .row {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
      }

      .tech-block {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
      }
    }
    .about-updates {
      min-width: 0;
      grid-area: updt;
      margin-top: 1rem;
      .about-update-inner {
        margin-top: 0.75rem;
        min-width: 0;
      }
    }
    .about-credits {
      min-width: 0;
      grid-area: cdts;
      .about-update-inner {
        min-width: 0;
      }
    }
    .about-copyright {
      grid-area: crgt;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: flex-end;

      p {
        display: flex;
        align-items: center;
        gap: 1ch;
      }
    }
  }
}
#app-version {
  position: absolute;
  opacity: 0.5;
  transform: translateY(-1rem);
  user-select: none;
}

@media screen and (max-width: 767px) {
  #dialog-about {
    .about-grid {
      grid-template-areas:
        'logo'
        'text'
        'tech'
        'updt'
        'cdts'
        'crgt';
      gap: 1.5rem 0;
      .about-text {
        hr {
          align-self: center;
        }
        p {
          width: 100%;
          text-align: center;
        }
      }
      .about-tech {
        margin: 0 auto;
        justify-content: center;
      }
      .about-copyright {
        align-items: center;
      }
    }
  }
  #app-version {
    top: 0;
    transform: translateY(0.75rem);
  }
}
@media screen and (max-width: 567px) {
  #dialog-about {
    .about-grid {
      .about-tech {
        margin: 0 auto;
        justify-content: center;
        flex-direction: column;
      }
    }
  }
}
</style>
