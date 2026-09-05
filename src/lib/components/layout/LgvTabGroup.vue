<template>
  <div class="lgv tabgroup">
    <nav class="tabgroup-tabs" :style="{ marginRight: `-${($props.tabs.length - 1) * 12}px` }">
      <div
        v-for="(tab, i) in $props.tabs"
        class="tab-link__wrapper"
        :style="{
          zIndex: $props.tabs.length - i,
          transform: `translateX(${i * -12}px)`,
        }"
      >
        <LgvButton
          :tabindex="getTabIndex(tab.name)"
          variant="dark"
          class="tab-link"
          :icon="tab.icon"
          :icon-width="tab.iconWidth"
          :class="{ active: selectedTab === i }"
          :title="tab.title"
          :disabled="tab.disabled ?? false"
          @click="selectedTab = i"
        >
          <span class="tab-link__text">{{ tab.title }}</span>
        </LgvButton>
      </div>
    </nav>
    <div class="tabgroup-content">
      <section
        class="tabgroup-content__tab"
        v-for="(tab, i) in $props.tabs"
        :class="`tab-${i}`"
        v-show="selectedTab === i"
      >
        <slot :name="`tab-${tab.name}`">TABGROUP_TAB_CONTENT</slot>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LgvTabGroupExposes, LgvTabGroupProps } from '@lib/components/layout/LgvTabGroup.types.ts';
import LgvButton from '@lib/components/base/LgvButton.vue';
import { computed, ref, type Ref } from 'vue';

const $props = defineProps<LgvTabGroupProps>();
defineExpose<LgvTabGroupExposes>({ reset: () => (selectedTab.value = 0) });

const selectedTab: Ref<number> = ref(0);
const tabIndexes = computed(() =>
  $props.tabs.filter((t) => !t.disabled).map((b, i) => ({ tab: b.name, tabindex: i + 1 })),
);

function getTabIndex(tabName: string): number {
  return tabIndexes.value.find((t) => t.tab === tabName)?.tabindex ?? -1;
}
</script>

<style scoped lang="scss">
.lgv.tabgroup {
  $button-width: 2.75rem;
  $button-corner-length: 12px;
  $caret-width: 5px;

  overflow: hidden;
  height: 100%;
  border-top: var(--lg-var-border-width) solid var(--lg-accent);

  display: grid;
  grid-template-rows: auto 1fr;

  & > .tabgroup-tabs {
    grid-row: 1;
    position: relative;
    overflow: hidden;

    display: flex;
    align-items: flex-start;
    justify-content: flex-start;

    & > .tab-link__wrapper {
      flex: 1;
      overflow: visible;

      padding-right: var(--lg-var-border-width);
      background: var(--lg-accent);
      clip-path: polygon(
        -$button-corner-length 0,
        calc(100% - $button-corner-length) 0,
        100% $button-corner-length,
        100% 100%,
        -$button-corner-length 100%
      );

      & > button.tab-link {
        position: relative;
        padding-left: 12px;
        width: 100%;
        overflow: visible;
        border: none;
        border-bottom: var(--lg-var-border-width) solid var(--lg-accent);
        box-shadow: inset 0 -12px 12px var(--lg-shadow-dark);
        clip-path: polygon(0 0, calc(100% - $button-corner-length) 0, 100% $button-corner-length, 100% 100%, 0 100%);
        user-select: none;

        &:hover > .tab-link__notch {
          position: absolute;
          top: 0;
          left: -$button-corner-length;
          width: $button-corner-length;
          height: $button-corner-length;
          background: red;
        }

        &.active {
          pointer-events: none;
          box-shadow: none;
          color: var(--lg-contrast);
          border-bottom-color: var(--lg-primary-static);
        }

        & > * {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 16ch;
        }
      }
    }
    & > .tab-link__wrapper:first-child > button.tab-link {
      padding-left: 0;
    }
    & > .tab-link__wrapper:last-child {
      clip-path: none;
      padding-right: 0;
      & > button.tab-link {
        clip-path: none;
      }
    }
  }
  & > .tabgroup-content {
    grid-row: 2;
    margin-top: 1px;
    overflow-y: auto;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;

    & > .tabgroup-content__tab {
      width: 100%;
      display: flex;
      flex-direction: column;
    }
  }
}

@media screen and (prefers-reduced-motion) {
  .lgv.tabgroup > .tabgroup-tabs > .tabgroup-tabs__caret {
    transition: none;
  }
}

@media screen and (max-width: 767px) {
  .tab-link__text {
    display: none;
  }
}
</style>
