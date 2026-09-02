<template>
  <LgvHeader>
    <div class="name-wrapper">
      <input
        v-if="editMode"
        ref="planetNameInput"
        v-model="EDITOR_STATE.planetData.planetName"
        class="lg"
        type="text"
        minlength="0"
        maxlength="32"
        @keyup.enter="toggleEditMode"
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
    <hr />
    <LgvButton variant="icon" icon="tabler:reload" :a11y-label="$t('main.header.reset')" @click="resetDialog!.open()" />
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
  </LgvHeader>

  <!------ BEGIN floating menus ------>
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

  <!------ END floating menus ------>
  <AppResetConfirmDialog ref="resetDialog" @confirm="$emit('reset')" />
</template>

<script setup lang="ts">
import { EDITOR_STATE } from '@core/editor/state/editor.state';
import { UIEventBus } from '@core/ui-event-bus.ts';
import * as MathUtils from '@core/utils/math-utils';
import { autoUpdate, offset, useFloating } from '@floating-ui/vue';
import LgvButton from '@lib/components/base/LgvButton.vue';
import LgvHeader from '@lib/components/main/LgvHeader.vue';
import { ref, useTemplateRef, watch, type Ref } from 'vue';
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

const editMode: Ref<boolean> = ref(false);
const planetNameInput: Ref<HTMLInputElement | null> = ref(null);
const resetDialog: Ref<{ open: () => void } | null> = ref(null);

watch(
  () => UIEventBus.clickEvent.value,
  (evt) => onWindowClick(evt!),
);
const $emit = defineEmits(['rename', 'reset', 'save', 'copy', 'extract-textures', 'gltf', 'random']);

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

function toggleEditMode() {
  editMode.value = !editMode.value;
  if (editMode.value) {
    UIEventBus.disableWindowEventListener('keydown');
    setTimeout(() => planetNameInput.value?.focus());
  } else {
    UIEventBus.enableWindowEventListener('keydown');
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
.name-wrapper {
  background: var(--lg-primary);
  border-radius: 2px;
  height: 2.5rem;
  margin-left: 1rem;

  display: flex;
  align-items: center;
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
  .name-wrapper {
    flex: 1;
    height: 2.75rem;
    font-size: 1em;
    justify-content: space-between;
    width: 0;

    input {
      width: 100%;
    }
    p {
      max-width: 100%;
    }
  }
  button {
    width: 2.75rem;
    height: 2.75rem;
  }
}
</style>
