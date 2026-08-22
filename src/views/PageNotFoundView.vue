<template>
  <div id="pagenotfound-container">
    <AppLogo />
    <div class="text">
      <h1 class="title" :class="{ ultra: msgVariant === 4 }">{{ loadMessage() }}</h1>
      <h2 class="subtitle">{{ $t('404.subtext') }}</h2>
      <LgvLink id="codex-link" variant="button" icon="mingcute:book-2-line" href="/">
        {{ $t('404.link') }}
      </LgvLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppLogo from '@components/global/elements/AppLogo.vue';
import LgvLink from '@lib/components/base/LgvLink.vue';
import { useHead } from '@unhead/vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const i18n = useI18n();
useHead({
  title: i18n.t('404.$title') + ' · ' + i18n.t('main.$title'),
  meta: [
    { name: 'robots', content: 'noindex' },
    { name: 'description', content: 'Page not found' },
  ],
});

const msgVariant = ref(0);
function loadMessage(): string {
  msgVariant.value = Math.floor(Math.random() * 4) + 1;
  return i18n.t(`404.text_${msgVariant.value.toString().padStart(2, '0')}`);
}
</script>

<style lang="scss">
#pagenotfound-container {
  flex: 1;
  background: var(--lg-panel);
  background-size: cover;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;

  #app-logo-wrapper {
    align-self: center;
    justify-self: center;
    transform: scale(1.15);
  }

  #codex-link {
    $height: 10px;
    padding: 0.5rem 1.5rem;
    clip-path: polygon($height 0, 100% 0, 100% calc(100% - $height), calc(100% - $height) 100%, 0 100%, 0 $height);
  }

  .text {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    text-align: center;
    padding-bottom: 2rem;
  }

  .title {
    font-size: clamp(2rem, 5vw, 2.5rem);
  }
  .subtitle {
    font-size: clamp(1rem, 2.5vw, 1.5rem);
    font-weight: 400;
  }
  .ultra {
    font-family:
      VCR OSD Mono,
      Jetbrains Mono,
      monospace;
  }
}

@media screen and (max-width: 767px) {
  #pagenotfound-container #app-logo-wrapper {
    transform: scale(1);
  }
}
</style>
