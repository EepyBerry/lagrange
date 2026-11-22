<template>
  <section id="codex-header">
    <AppHeaderNavigation />
    <div id="codex-header-controls">
      <LgvButton
        variant="icon"
        icon="ph:upload"
        icon-width="1.75rem"
        :a11y-label="$t('main.header.import')"
        @click="$emit('open-file')"
      />

      <!-- new planet -->
      <LgvLink
        id="codex-header-controls-newplanet"
        variant="dark"
        link-type="internal"
        class="contrast"
        icon="ph:plus"
        :href="uwuifyPath('/planet-editor/new')"
      >
        {{ $t('codex.$action_add') }}
      </LgvLink>

      <!-- export planets -->
      <LgvButton
        variant="icon"
        icon="octicon:file-zip-24"
        icon-width="1.75rem"
        :aria-label="$t('main.header.export_all')"
        @click="$emit('export')"
      />
    </div>
    <div id="codex-header-filler">
      <div id="codex-header-filler__inner">
        <SVGGizmoLagrangeBarcode />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import AppHeaderNavigation from '@components/global/AppHeaderNavigation.vue';
import SVGGizmoLagrangeBarcode from '@components/global/svg/SVGGizmoLagrangeBarcode.vue';
import { uwuifyPath } from '@core/extras.ts';
import LgvButton from '@lib/components/base/LgvButton.vue';
import LgvLink from '@lib/components/base/LgvLink.vue';

defineEmits(['open-file', 'export']);
</script>

<style scoped lang="scss">
#codex-header {
  z-index: 1;
  height: 2.75rem;
  background: var(--lg-primary);
  border-bottom: var(--lg-var-border-width) solid var(--lg-accent);

  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  justify-content: space-between;

  #codex-header-controls {
    height: 100%;
    padding: 0 0.5rem;
    border-left: var(--lg-var-border-width) solid var(--lg-accent);
    border-right: var(--lg-var-border-width) solid var(--lg-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    #codex-header-controls-newplanet {
      height: 100%;
    }
  }
  #codex-header-filler {
    height: 100%;
    display: flex;
    justify-content: flex-end;

    #codex-header-filler__inner {
      height: 100%;
      padding: 0 0.5rem;
      border-left: var(--lg-var-border-width) solid var(--lg-accent);

      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  }
}

@media screen and (max-width: 767px) {
  #codex-header > #codex-header-filler > #codex-header-filler__inner {
    display: none;
  }
}
</style>
