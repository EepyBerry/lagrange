<template>
  <footer>
    <div id="footer-nav">
      <a href="https://github.com/EepyBerry/lagrange" target="_blank" rel="noopener" class="lg dark" aria-label="GitHub page">
        <iconify-icon icon="mingcute:github-line" width="1.5rem" aria-hidden="true" />
        <iconify-icon class="link-icon" icon="mingcute:right-line" width="1.5rem" aria-hidden="true" />
      </a>
      <hr width="50%">
      <button class="lg dark" aria-label="Settings">
        <iconify-icon icon="mingcute:settings-6-line" width="1.5rem" aria-hidden="true" />
      </button>
      <button class="lg dark" aria-label="About Lagrange" @click="aboutDialog!.open()">
        <iconify-icon icon="mingcute:information-line" width="1.5rem" aria-hidden="true" />
      </button>
    </div>
  </footer>
  <DialogElement ref="aboutDialog" id="dialog-about">
    <template v-slot:content>
      <div class="about-grid">
        <AppLogo />
        <div class="about-text">
          <p class="highlight">A procedural planet-building application.</p>
          <p>Made as a pet project to materialize my fascination with space & planets!</p>
        </div>
        <div class="about-tech">
          <div class="tech-block">
            <iconify-icon mode="svg" icon="logos:threejs" width="3rem" style="fill: var(--lg-text)" />
            <div>
              <p>3D using <span class="highlight">three.js</span></p>
              <ChipElement>r165</ChipElement>
            </div>
          </div>
          <div class="tech-block">
            <iconify-icon mode="svg" icon="simple-icons:vuedotjs" width="3rem" style="fill: var(--lg-text)" />
            <div>
              <p>Powered by <span class="highlight nowrap">Vue + Vite</span></p>
              <ChipElement>3.4.21</ChipElement> <ChipElement>5.2.8</ChipElement>
            </div>
          </div>
        </div>
        <div class="about-copyright">
          <p>Built with <iconify-icon icon="noto:rainbow-flag" width="0.875rem" /> & ❤️</p>
          <p>© 2024 EepyBerry, <a href="https://opensource.org/license/bsd-3-clause" target="_blank" rel="noopener noreferrer">BSD 3-Clause Licence</a></p>
        </div>
      </div>
    </template>
  </DialogElement>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import AppLogo from './elements/AppLogo.vue';
import DialogElement from './elements/DialogElement.vue';
import ChipElement from './elements/ChipElement.vue';
const aboutDialog: Ref<{ open: Function }|null> = ref(null)
</script>

<style lang="scss">
footer {
  position: absolute;
  inset: auto 0 0 auto;
  padding: 1rem;
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  z-index: 5;

  #footer-nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;

    hr { border-color: var(--lg-accent); }
  }
}

#dialog-about {
  .about-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
      "logo text"
      "logo tech"
      "logo crgt";
    gap: 1.5rem;

    #app-logo, #app-logo-uwu {
      width: 220px;
      grid-area: logo;
      max-width: 16rem;
      align-self: center;
    }
    .about-text {
      grid-area: text;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-end;
      margin-top: 1rem;
    }
    .about-tech {
      grid-area: tech;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
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

@media screen and (max-width: 767px) {
  footer {
    padding: 0.5rem;
  }
  
  #dialog-about {
    .about-grid {
      gap: 1.5rem 0;

      #app-logo, #app-logo-uwu {
        display: none;
      }
      .about-text > p {
        width: 100%;
        text-align: center;
      }
      .about-tech {
        justify-content: center;
      }
      .about-copyright {
        align-items: center;
      }
    }
  }
}
</style>