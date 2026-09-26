<template>
  <div id="editor-header">
    <div id="editor-header-nav">
      <LgvLink
        id="editor-header-link-codex"
        variant="icon"
        link-type="internal"
        icon="material-symbols:home-outline"
        iconWidth="1.5rem"
        :aria-label="$t('main.nav.codex')"
        :title="$t('main.nav.codex')"
      />
    </div>
    <div id="editor-header-positioning">
      <LgvButton
        variant="icon"
        :icon="
          inspectorSide === 'left' ? 'material-symbols:dock-to-right-outline' : 'material-symbols:dock-to-left-outline'
        "
        icon-width="1.375rem"
        :aria-label="$t('a11y.editor_inspector_side')"
        :title="$t('a11y.editor_inspector_side')"
        @click="toggleInspectorSide"
      />
      <LgvButton
        variant="icon"
        :icon="inspectorOrdering === 'standard' ? 'akar-icons:panel-top' : 'akar-icons:panel-bottom'"
        icon-width="1.25rem"
        :aria-label="$t('a11y.editor_inspector_ordering')"
        :title="$t('a11y.editor_inspector_ordering')"
        @click="toggleInspectorOrdering"
      />
    </div>
    <div id="editor-header-naming">
      <input
        v-if="editMode"
        ref="planetNameInput"
        v-model="EDITOR_STATE.planetData.planetName"
        class="lg"
        type="text"
        minlength="0"
        maxlength="32"
        @keyup.enter="toggleEditMode"
        @focusout="toggleEditMode"
      />
      <p v-else @click="toggleEditMode">{{ EDITOR_STATE.planetData.planetName }}</p>

      <LgvButton
        variant="icon"
        :icon="editMode ? 'mingcute:check-line' : 'mingcute:edit-2-line'"
        :a11y-label="$t(editMode ? 'main.header.rename_confirm' : 'main.header.rename')"
        icon-width="1.25rem"
        @click="toggleEditMode"
      />
    </div>
    <div id="editor-header-actions">
      <LgvButton
        variant="icon"
        icon="tabler:reload"
        :a11y-label="$t('main.header.reset')"
        @click="resetDialog!.open()"
      />
      <LgvButton
        id="planet-info__randomize-menu-trigger"
        ref="randomMenuTrigger"
        variant="icon"
        icon="mingcute:shuffle-2-fill"
        :class="{ active: isRandomMenuOpen }"
        :a11y-label="$t('main.header.menu_random')"
      />
      <LgvButton
        id="planet-info__save-menu-trigger"
        ref="saveMenuTrigger"
        variant="icon"
        :icon="isSaveMenuOpen ? 'mdi:content-save-minus-outline' : 'mdi:content-save-plus-outline'"
        :class="{ active: isSaveMenuOpen }"
        :a11y-label="$t('main.header.menu_save')"
      />
    </div>
  </div>

  <!------ BEGIN floating menus ------>
  <Teleport to="body">
    <div id="randomizer-menu" ref="randomMenu" class="floating" :style="randomFloating.floatingStyles.value">
      <div class="floating-content">
        <label for="random-seed">Seed</label>
        <input id="random-seed" v-model="MathUtils.PRNG_SEED.value" type="text" />
      </div>
      <div class="floating-actions">
        <LgvButton class="sm" icon="tabler:seeding" @click="MathUtils.regenerateSeed()">
          {{ $t('editor.$action_reseed') }}
        </LgvButton>
        <LgvButton class="sm success" icon="mingcute:shuffle-2-fill" @click="$emit('random')">
          {{ $t('editor.$action_random') }}
        </LgvButton>
      </div>
    </div>
  </Teleport>

  <Teleport to="body">
    <div id="save-menu" ref="saveMenu" class="floating" :style="saveFloating.floatingStyles.value">
      <LgvButton
        variant="dark"
        class="save-menu-button"
        icon="mingcute:save-2-line"
        @click="closeSaveMenuAndEmit('save')"
      >
        {{ $t('main.header.save') }}
      </LgvButton>
      <LgvButton
        v-if="!$route.path.endsWith('/new')"
        variant="dark"
        class="save-menu-button"
        icon="mingcute:copy-2-line"
        @click="closeSaveMenuAndEmit('copy')"
      >
        {{ $t('main.header.copy') }} </LgvButton
      ><LgvButton
        variant="dark"
        class="save-menu-button"
        icon="material-symbols:texture"
        @click="closeSaveMenuAndEmit('extract-textures')"
      >
        {{ $t('main.header.extract_textures') }}
      </LgvButton>
      <LgvButton variant="dark" class="save-menu-button" icon="simple-icons:gltf" @click="closeSaveMenuAndEmit('gltf')">
        {{ $t('main.header.gltf') }}
      </LgvButton>
    </div>
  </Teleport>

  <!------ END floating menus ------>
  <AppResetConfirmDialog ref="resetDialog" @confirm="$emit('reset')" />
</template>

<script setup lang="ts">
import { EDITOR_STATE } from '@core/editor/state/editor.state';
import * as MathUtils from '@core/utils/math-utils';
import { autoUpdate, offset, useFloating } from '@floating-ui/vue';
import LgvButton from '@lib/components/base/LgvButton.vue';
import LgvLink from '@lib/components/base/LgvLink.vue';
import { useEventListener } from '@vueuse/core';
import { onMounted, ref, useTemplateRef, type Ref } from 'vue';
import { idb } from '@/dexie.config.ts';
import AppResetConfirmDialog from './dialogs/ResetConfirmDialog.vue';

// floating-ui start
const isRandomMenuOpen: Ref<boolean> = ref(false);
const randomMenuTrigger = useTemplateRef('randomMenuTrigger');
const randomMenu = useTemplateRef('randomMenu');
const randomFloating = useFloating(randomMenuTrigger, randomMenu, {
  whileElementsMounted: autoUpdate,
  placement: 'bottom-end',
  middleware: [offset(8)],
});

const isSaveMenuOpen: Ref<boolean> = ref(false);
const saveMenuTrigger = useTemplateRef('saveMenuTrigger');
const saveMenu = useTemplateRef('saveMenu');
const saveFloating = useFloating(saveMenuTrigger, saveMenu, {
  whileElementsMounted: autoUpdate,
  placement: 'bottom-end',
  middleware: [offset(8)],
});
// floating-ui end

const inspectorSide: Ref<'left' | 'right'> = ref('left');
const inspectorOrdering: Ref<'standard' | 'flipped'> = ref('standard');
const editMode: Ref<boolean> = ref(false);
const planetNameInput: Ref<HTMLInputElement | null> = ref(null);
const resetDialog: Ref<{ open: () => void } | null> = ref(null);

useEventListener(window, 'click', onWindowClick);

const $emit = defineEmits([
  'inspector-side-change',
  'inspector-ordering-change',
  'rename',
  'reset',
  'save',
  'copy',
  'extract-textures',
  'gltf',
  'random',
]);

onMounted(async () => {
  const settings = await idb.settings.limit(1).first();
  inspectorSide.value = settings!.inspectorSide || 'left';
  inspectorOrdering.value = settings!.inspectorOrdering || 'standard';
});

function onWindowClick(evt: MouseEvent) {
  if ((evt.target as HTMLElement).id === randomMenuTrigger.value!.$el.id) {
    toggleRandomMenu();
  } else if (!randomMenu.value?.contains(evt.target as Node)) {
    toggleRandomMenu(false);
  }

  if ((evt.target as HTMLElement).id === saveMenuTrigger.value!.$el.id) {
    toggleSaveMenu();
  } else if (!saveMenu.value?.contains(evt.target as Node)) {
    toggleSaveMenu(false);
  }
}

function closeSaveMenuAndEmit(evt: 'rename' | 'reset' | 'save' | 'copy' | 'extract-textures' | 'gltf' | 'random') {
  toggleSaveMenu(false);
  $emit(evt);
}

function toggleInspectorSide() {
  inspectorSide.value = inspectorSide.value === 'left' ? 'right' : 'left';
  $emit('inspector-side-change', inspectorSide.value);
}
function toggleInspectorOrdering() {
  inspectorOrdering.value = inspectorOrdering.value === 'standard' ? 'flipped' : 'standard';
  $emit('inspector-ordering-change', inspectorOrdering.value);
}

function toggleEditMode() {
  editMode.value = !editMode.value;
  if (editMode.value) {
    setTimeout(() => planetNameInput.value?.focus());
  } else {
    $emit('rename');
  }
}

function toggleRandomMenu(override?: boolean) {
  if (override !== undefined) {
    randomMenu.value!.style.visibility = override ? 'visible' : 'hidden';
    isRandomMenuOpen.value = override;
  } else {
    randomMenu.value!.style.visibility = randomMenu.value!.style.visibility === 'visible' ? 'hidden' : 'visible';
    isRandomMenuOpen.value = randomMenu.value!.style.visibility === 'visible';
  }
}

function toggleSaveMenu(override?: boolean) {
  if (override !== undefined) {
    saveMenu.value!.style.visibility = override ? 'visible' : 'hidden';
    isSaveMenuOpen.value = override;
  } else {
    saveMenu.value!.style.visibility = saveMenu.value!.style.visibility === 'visible' ? 'hidden' : 'visible';
    isSaveMenuOpen.value = saveMenu.value!.style.visibility === 'visible';
  }
}
</script>

<style scoped lang="scss">
#editor-header {
  z-index: 1;
  position: relative;
  height: 2.75rem;
  background: var(--lg-primary);
  border-bottom: var(--lg-var-border-width) solid var(--lg-accent);

  display: grid;
  grid-template-columns: auto auto 1fr auto;
  align-items: center;
  justify-content: space-between;

  #editor-header-link-codex {
    border-right: var(--lg-var-border-width) solid var(--lg-accent);
  }
  #editor-header-positioning {
    padding: 0 0.5rem;
    border-right: var(--lg-var-border-width) solid var(--lg-accent);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #editor-header-naming {
    width: 100%;
    border-radius: 2px;
    height: 2.5rem;
    padding: 0 0.5rem;

    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;

    input {
      width: 24ch;
      height: 2rem;
      font-size: 0.875rem;
      font-family: Poppins, Inter, sans-serif;
    }
    p {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 24ch;
    }
  }
  #editor-header-actions {
    padding: 0 0.5rem;
    display: flex;
    border-left: var(--lg-var-border-width) solid var(--lg-accent);
    justify-self: flex-end;
  }
}
#randomizer-menu {
  z-index: 10;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
}
#save-menu {
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

@media screen and (max-width: 767px) {
  #editor-header {
    #editor-header-naming {
      min-width: 0;

      input {
        min-width: 0;
      }
    }
  }
}
</style>
