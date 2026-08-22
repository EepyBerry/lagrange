<template>
  <LgvDialog
    id="dialog-about"
    ref="dialogRef"
    :show-title="true"
    :closeable="true"
    :aria-label="$t('a11y.dialog_about')"
  >
    <template #title>
      <iconify-icon class="contrast" icon="ph:info" width="1.5rem" aria-hidden="true" />
      {{ $t('dialog.about.$title') }}
    </template>
    <template #content>
      <div id="about-content">
        <div id="about-banner">
          <div id="app-version">
            <p>{{ appVersion }}</p>
          </div>
          <div id="about-logo">
            <AppLogo />
          </div>
          <div id="about-brief">
            <div id="about-text">
              <p class="highlight">{{ $t('dialog.about.description') }}</p>
              <p>{{ $t('dialog.about.motivation') }}</p>
            </div>
            <hr />
            <div id="about-tech">
              <p>{{ $t('dialog.about.tech') }}:</p>
              <div class="row">
                <div class="tech-block">
                  <iconify-icon mode="svg" icon="simple-icons:vuedotjs" width="3rem" style="fill: var(--lg-text)" />
                  <div>
                    <p>{{ $t('dialog.about.prefix_framework') }} <span class="highlight nowrap">Vue + Vite</span></p>
                    <LgvBadge class="info">3.5.32</LgvBadge> <LgvBadge class="info">8.2.1</LgvBadge>
                  </div>
                </div>
                <div class="tech-block">
                  <iconify-icon mode="svg" icon="logos:threejs" width="3rem" style="fill: var(--lg-text)" />
                  <div>
                    <p>{{ $t('dialog.about.prefix_engine') }} <span class="highlight">three.js</span></p>
                    <LgvBadge class="info">r185</LgvBadge>
                  </div>
                </div>
              </div>
            </div>
            <hr />
            <p id="about-copyright">
              <span>{{ $t('dialog.about.built_with_love') }}</span>
              <span>
                © 2024-{{ new Date().getFullYear() }} EepyBerry,
                <LgvLink :href="'https://github.com/EepyBerry/lagrange/blob/main/LICENSE'" icon="" link-type="external">
                  {{ $t('dialog.about.license') }}
                </LgvLink>
              </span>
            </p>
          </div>
        </div>
        <LgvTabGroup :tabs="aboutTabs">
          <template #tab-changelog>
            <section id="tab-changelogs">
              <CollapsibleSection icon="mingcute:world-2-line">
                <template #title>{{ $t('dialog.about.changelogs.02_title') }}</template>
                <template #content>
                  <div class="update-features">
                    <ul class="update-feature-list">
                      <li starred>{{ $t('dialog.about.changelogs.02_codex') }}</li>
                      <li>{{ $t('dialog.about.changelogs.02_ui') }}</li>
                      <li>{{ $t('dialog.about.changelogs.02_a11y') }}</li>
                    </ul>
                  </div>
                </template>
              </CollapsibleSection>
              <CollapsibleSection icon="ph:mountains">
                <template #title>{{ $t('dialog.about.changelogs.03_title') }}</template>
                <template #content>
                  <div class="update-features">
                    <ul class="update-feature-list">
                      <li starred>{{ $t('dialog.about.changelogs.03_biomes') }}</li>
                      <li>{{ $t('dialog.about.changelogs.03_linux') }}</li>
                      <li>{{ $t('dialog.about.changelogs.03_fixes') }}</li>
                    </ul>
                  </div>
                </template>
              </CollapsibleSection>
              <CollapsibleSection icon="ph:planet">
                <template #title>{{ $t('dialog.about.changelogs.04_title') }}</template>
                <template #content>
                  <div class="update-features">
                    <ul class="update-feature-list">
                      <li starred>{{ $t('dialog.about.changelogs.04_params') }}</li>
                    </ul>
                    <ul class="update-feature-list">
                      <li starred>{{ $t('dialog.about.changelogs.041_export') }}</li>
                    </ul>
                    <ul class="update-feature-list">
                      <li>{{ $t('dialog.about.changelogs.042_rnd') }}</li>
                    </ul>
                    <ul class="update-feature-list">
                      <li>{{ $t('dialog.about.changelogs.043_settings') }}</li>
                    </ul>
                  </div>
                </template>
              </CollapsibleSection>
              <CollapsibleSection id="update-05" icon="ph:lightning" style="background: var(--lg-update-05-background)">
                <template #title>{{ $t('dialog.about.changelogs.05_title') }}</template>
                <template #content>
                  <div class="update-features">
                    <ul class="update-feature-list update-05">
                      <li starred>{{ $t('dialog.about.changelogs.05_webgpu') }}</li>
                      <li>{{ $t('dialog.about.changelogs.05_rewrite') }}</li>
                    </ul>
                    <ul class="update-feature-list update-05">
                      <li style="margin-top: 0.5rem" starred>{{ $t('dialog.about.changelogs.051_emissivity') }}</li>
                      <li>{{ $t('dialog.about.changelogs.051_atmosphere') }}</li>
                      <li>{{ $t('dialog.about.changelogs.051_ui') }}</li>
                    </ul>
                    <ul class="update-feature-list update-05">
                      <li style="margin-top: 0.5rem" starred>{{ $t('dialog.about.changelogs.052_postprocessing') }}</li>
                      <li>{{ $t('dialog.about.changelogs.052_skyboxes') }}</li>
                      <li>{{ $t('dialog.about.changelogs.052_controls') }}</li>
                    </ul>
                  </div>
                </template>
              </CollapsibleSection>
              <CollapsibleSection
                id="update-06"
                icon="hugeicons:moon-01"
                style="background: var(--lg-update-06-background)"
              >
                <template #title>{{ $t('dialog.about.changelogs.06_title') }}</template>
                <template #content>
                  <div class="update-features">
                    <ul class="update-feature-list update-06">
                      <li starred>{{ $t('dialog.about.changelogs.06_crackscraters') }}</li>
                      <li>{{ $t('dialog.about.changelogs.06_texture') }}</li>
                      <li>{{ $t('dialog.about.changelogs.06_ui') }}</li>
                    </ul>
                  </div>
                </template>
              </CollapsibleSection>
            </section>
          </template>
          <template #tab-credits>
            <div id="tab-credits">
              <ul>
                <li>
                  {{ $t('dialog.about.credits.libs_tcsm') }}:
                  <LgvLink href="https://www.farazzshaikh.com" link-type="external" icon="">
                    <b>Faraz Shaikh</b>
                  </LgvLink>
                </li>
                <li>
                  {{ $t('dialog.about.credits.glsl_noise') }}:
                  <LgvLink href="https://iquilezles.org" link-type="external" icon="">
                    <b>Iñigo Quilez</b>
                  </LgvLink>
                </li>
                <li>
                  {{ $t('dialog.about.credits.glsl_atmosphere') }}:
                  <LgvLink href="https://www.shadertoy.com/user/gltracy" link-type="external" icon="">
                    <b>GLTracy</b>
                  </LgvLink>
                </li>
                <li>
                  {{ $t('dialog.about.credits.glsl_lensflare') }}:
                  <LgvLink href="https://andersonmancini.dev" link-type="external" icon="">
                    <b>Anderson Mancini</b>
                  </LgvLink>
                </li>
                <li>
                  {{ $t('dialog.about.credits.glsl_bumpmap') }}:
                  <LgvLink href="https://www.dangreenheck.com" link-type="external" icon="">
                    <b>Daniel Greenheck</b>
                  </LgvLink>
                </li>
              </ul>
              <div id="special-thanks">
                <ul>
                  <li style="font-size: 1rem">
                    <b>❤️ {{ $t('dialog.about.credits.contributors') }} ❤️</b>
                  </li>
                </ul>
              </div>
            </div>
          </template>
        </LgvTabGroup>
      </div>
    </template>
  </LgvDialog>
</template>

<script setup lang="ts">
import type { AboutDialogExposes } from '@components/global/dialogs/AboutDialog.types.ts';
import type { LgvDialogExposes } from '@lib/components/base/LgvDialog.types.ts';
import type { LvgTabGroupTab } from '@lib/components/layout/LgvTabGroup.types.ts';
import AppLogo from '@components/global/elements/AppLogo.vue';
import CollapsibleSection from '@components/global/elements/CollapsibleSection.vue';
import LgvDialog from '@lib/components/base/LgvDialog.vue';
import LgvLink from '@lib/components/base/LgvLink.vue';
import LgvBadge from '@lib/components/custom/LgvBadge.vue';
import LgvTabGroup from '@lib/components/layout/LgvTabGroup.vue';
import { computed, useTemplateRef, type ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';

const i18n = useI18n();
const dialogRef = useTemplateRef<LgvDialogExposes>('dialogRef');
defineExpose<AboutDialogExposes>({ open: () => dialogRef.value?.open!(), close: () => dialogRef.value?.close!() });

const aboutTabs: ComputedRef<LvgTabGroupTab[]> = computed(() => [
  {
    name: 'changelog',
    icon: 'ph:newspaper',
    iconWidth: '1.5rem',
    title: i18n.t('dialog.about.tabs.changelog'),
  },
  {
    name: 'credits',
    icon: 'ph:sparkle',
    iconWidth: '2rem',
    title: i18n.t('dialog.about.tabs.credits'),
  },
]);

const appVersion = import.meta.env.APP_VERSION;
</script>

<style scoped lang="scss">
#dialog-about {
  max-width: 1024px;
  #about-content {
    position: relative;
  }
  #about-banner {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;

    #app-version {
      z-index: 1;
      position: absolute;
      bottom: 0;
      left: 0;
      user-select: none;

      padding: var(--lg-var-border-width) var(--lg-var-border-width) 0 0;
      background: var(--lg-accent);
      clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 100%, 0 100%);

      p {
        padding: 2px 16px 2px 6px;
        background: var(--lg-primary);
        clip-path: inherit;
      }
    }

    #about-logo {
      position: relative;
      padding: 1rem;
      background: var(--lg-panel);
      border-right: var(--lg-var-border-width) solid var(--lg-accent);

      display: flex;
      justify-content: center;
    }

    #about-brief {
      flex: 1;
      padding: 1rem;
      height: 100%;
      background: var(--lg-panel);

      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;

      hr {
        margin: 1rem 0;
        width: 100%;
      }

      #about-tech {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 0.25rem;

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

      #about-copyright {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        column-gap: 1rem;
        flex-wrap: wrap;
      }
    }
  }

  #tab-changelogs {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    .collapsible-section {
      &#update-05,
      &#update-06 {
        border: none;
      }
      &:last-child {
        $clip-length: 0.75rem;
        clip-path: polygon(0 0, 100% 0, 100% calc(100% - $clip-length), calc(100% - $clip-length) 100%, 0 100%);
      }
    }
    .update-features {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      .update-feature-list {
        border: var(--lg-var-border-width) solid var(--lg-accent);
        background: var(--lg-panel);
        list-style-type: disc;
        padding: 0.25rem 0.25rem 0.25rem 1.5rem;
        border-radius: 2px;
        li {
          text-wrap: wrap;
          word-wrap: anywhere;
        }
        &.update-05 {
          background: var(--lg-update-05-panel);
          border-color: var(--lg-update-05-border);
        }
        &.update-06 {
          background: var(--lg-update-06-panel);
          border-color: var(--lg-update-06-border);
        }
      }
    }
  }

  #tab-credits {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    ul {
      padding: 0.75rem 0.5rem;
      background: var(--lg-panel);
      border: 1px solid var(--lg-accent);
      text-align: center;

      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;

      li {
        list-style-type: none;
        margin-left: 0;
      }
    }
    #special-thanks {
      padding: 1px;
      background: var(--lg-accent);
      $clip-length: 0.75rem;
      clip-path: polygon(0 0, 100% 0, 100% calc(100% - $clip-length), calc(100% - $clip-length) 100%, 0 100%);

      ul {
        padding: 0.75rem 0.5rem;
        background: var(--lg-panel);
        border: none;
        clip-path: inherit;
      }
    }
  }
}

@media screen and (max-width: 1023px) {
  #dialog-about #about-banner #about-logo {
    #app-logo-wrapper {
      height: 200px;
    }
  }
}
@media screen and (max-width: 767px) {
  #dialog-about {
    #about-banner {
      grid-template-columns: 1fr;
      #about-logo {
        display: none;
      }
      #about-brief {
        margin-bottom: 1.25rem;
        #about-text {
          text-align: center;
        }
        #about-tech {
          align-items: center;
          margin: 0 auto;
        }
        #about-copyright {
          flex-direction: column;
          align-items: center;
          #about-copyright__dash {
            display: none;
          }
        }
      }
    }
  }
}
@media screen and (max-width: 567px) {
  #dialog-about #about-banner #about-brief {
    #about-tech {
      margin: 0 auto;
      flex-direction: column;
      .row {
        justify-content: center;
        gap: 1rem;
      }
    }
  }
}
</style>
