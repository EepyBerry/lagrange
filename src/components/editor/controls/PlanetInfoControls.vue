<template>
  <div id="planet-info">
    <div class="name-wrapper">
      <input
        v-if="editMode"
        ref="planetNameInput"
        v-model="LG_PLANET_DATA.planetName"
        class="lg"
        type="text"
        minlength="0"
        maxlength="32"
        @keyup.enter="toggleEditMode"
      />
      <p v-else @click="toggleEditMode">{{ LG_PLANET_DATA.planetName }}</p>

      <LgvButton
        variant="icon"
        :icon="editMode ? 'mingcute:check-line' :'mingcute:edit-2-line'"
        :a11y-label="$t(editMode ? 'a11y.topbar_rename_confirm' : 'a11y.topbar_rename')"
        icon-width="1.25rem"
        @click="toggleEditMode"
      />
    </div>
    <hr />
    <LgvButton
      variant="dark"
      icon="tabler:reload"
      :a11y-label="$t('a11y.topbar_reset')"
      @click="resetDialog?.open()"
    />

    <!------ BEGIN floating menus ------>
    <!-- Randomization menu -->
    <LgvButton
      id="planet-info__randomize-menu-trigger"
      ref="randomMenuTrigger"
      variant="dark"
      icon="mingcute:shuffle-2-fill"
      :class="{ active: isRandomMenuOpen }"
      :a11y-label="$t('a11y.topbar_menu_random')"
    />
    <div id="randomizer-menu" ref="randomMenu" class="floating" :style="randomFloating.floatingStyles.value">
      <div class="floating-content">
        <label for="random-seed">Seed</label>
        <input id="random-seed" v-model="MathUtils.PRNG_SEED.value" class="lg" type="text" />
      </div>
      <div class="floating-actions">
        <LgvButton
          class="sm"
          icon="tabler:seeding"
          @click="MathUtils.regenerateSeed()"
        >
          {{ $t('editor.$action_reseed') }}
        </LgvButton>
        <LgvButton
          class="sm success"
          icon="mingcute:shuffle-2-fill"
          @click="$emit('random')"
        >
          {{ $t('editor.$action_random') }}
        </LgvButton>
      </div>
    </div>

    <!-- Save menu -->
     <LgvButton
      id="planet-info__save-menu-trigger"
      ref="saveMenuTrigger"
      variant="dark"
      :icon="isSaveMenuOpen ? 'mdi:content-save-minus-outline' : 'mdi:content-save-plus-outline'"
      :class="{ active: isSaveMenuOpen }"
      :a11y-label="$t('a11y.topbar_menu_save')"
    />
    <div ref="saveMenu" class="floating" :style="saveFloating.floatingStyles.value">
      <button class="dark" :aria-label="$t('a11y.topbar_save')" @click="closeSaveMenuAndEmit('save')">
        <iconify-icon icon="mingcute:save-2-line" width="1.5rem" aria-hidden="true" />
        <p>{{ $t('tooltip.topbar_save') }}</p>
      </button>
      <button
        v-if="!$route.path.endsWith('/new')"
        class="dark"
        :aria-label="$t('a11y.topbar_copy')"
        @click="closeSaveMenuAndEmit('copy')"
      >
        <iconify-icon icon="mingcute:copy-2-line" width="1.5rem" aria-hidden="true" />
        <p>{{ $t('tooltip.topbar_copy') }}</p>
      </button>
      <button class="dark" :aria-label="$t('a11y.topbar_gltf')" @click="closeSaveMenuAndEmit('gltf')">
        <iconify-icon icon="simple-icons:gltf" width="1.5rem" aria-hidden="true" />
        <p>{{ $t('tooltip.topbar_gltf') }}</p>
      </button>
    </div>
    <!------ END floating menus ------>
    <AppResetConfirmDialog ref="resetDialog" @confirm="$emit('reset')" />
  </div>
</template>

<script setup lang="ts">
import AppResetConfirmDialog from '../dialogs/ResetConfirmDialog.vue'
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import { ref, useTemplateRef, watch, type Ref } from 'vue'
import { EventBus } from '@core/event-bus'
import { autoUpdate, offset, useFloating } from '@floating-ui/vue'
import * as MathUtils from '@core/utils/math-utils'
import LgvButton from '@/_lib/components/LgvButton.vue'

const editMode: Ref<boolean> = ref(false)

const planetNameInput: Ref<HTMLInputElement | null> = ref(null)
const resetDialog: Ref<{ open: () => void } | null> = ref(null)

// floating-ui start
const isRandomMenuOpen: Ref<boolean> = ref(false)
const randomMenuTrigger = useTemplateRef('randomMenuTrigger')
const randomMenu = useTemplateRef('randomMenu')
const randomFloating = useFloating(randomMenuTrigger, randomMenu, {
  whileElementsMounted: autoUpdate,
  placement: 'bottom-end',
  middleware: [offset(8)],
})

const isSaveMenuOpen: Ref<boolean> = ref(false)
const saveMenuTrigger = useTemplateRef('saveMenuTrigger')
const saveMenu = useTemplateRef('saveMenu')
const saveFloating = useFloating(saveMenuTrigger, saveMenu, {
  whileElementsMounted: autoUpdate,
  placement: 'bottom-end',
  middleware: [offset(8)],
})
// floating-ui end

watch(
  () => EventBus.clickEvent.value,
  (evt) => onWindowClick(evt!),
)
const $emit = defineEmits(['rename', 'reset', 'save', 'copy', 'gltf', 'random'])

function onWindowClick(evt: MouseEvent) {
  if ((evt.target as HTMLElement).id === randomMenuTrigger.value!.$el.id) {
    toggleRandomMenu()
  } else if (!randomMenu.value?.contains(evt.target as Node)) {
    toggleRandomMenu(false)
  }

  if ((evt.target as HTMLElement).id === saveMenuTrigger.value!.$el.id) {
    toggleSaveMenu()
  } else if (!saveMenu.value?.contains(evt.target as Node)) {
    toggleSaveMenu(false)
  }
}

function closeSaveMenuAndEmit(evt: 'rename' | 'reset' | 'save' | 'copy' | 'gltf' | 'random') {
  toggleSaveMenu(false)
  $emit(evt)
}

function toggleEditMode() {
  editMode.value = !editMode.value
  if (editMode.value) {
    EventBus.disableWindowEventListener('keydown')
    setTimeout(() => planetNameInput.value?.focus())
  } else {
    EventBus.enableWindowEventListener('keydown')
    $emit('rename')
  }
}

function toggleRandomMenu(override?: boolean) {
  if (override !== undefined) {
    randomMenu.value!.style.visibility = override ? 'visible' : 'hidden'
    isRandomMenuOpen.value = override
  } else {
    randomMenu.value!.style.visibility = randomMenu.value!.style.visibility === 'visible' ? 'hidden' : 'visible'
    isRandomMenuOpen.value = randomMenu.value!.style.visibility === 'visible'
  }
}

function toggleSaveMenu(override?: boolean) {
  if (override !== undefined) {
    saveMenu.value!.style.visibility = override ? 'visible' : 'hidden'
    isSaveMenuOpen.value = override
  } else {
    saveMenu.value!.style.visibility = saveMenu.value!.style.visibility === 'visible' ? 'hidden' : 'visible'
    isSaveMenuOpen.value = saveMenu.value!.style.visibility === 'visible'
  }
}
</script>

<style scoped lang="scss">
#planet-info {
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: center;
  gap: 0.5rem;

  hr {
    height: 1.5rem;
    border-color: var(--lg-accent);
  }
  .name-wrapper {
    background: var(--lg-primary);
    border: 1px solid var(--lg-accent);
    border-radius: 2px;
    height: 2.5rem;
    padding: 0 0.25rem 0 0.75rem;

    display: flex;
    align-items: center;
    gap: 0.5rem;

    input {
      width: 24ch;
      height: 2rem;
      font-size: 0.875rem;
      font-family: Poppins, Inter;
    }
    p {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 24ch;
    }
  }
  button { text-wrap: nowrap;}
  button.active {
    background: var(--lg-button-active);
  }

  #randomizer-menu {
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
  }
}

@media screen and (max-width: 767px) {
  #planet-info {
    width: 100%;
    height: 2.5rem;
    flex: 1;

    .name-wrapper {
      flex: 1;
      font-size: 1em;
      justify-content: space-between;
      width: 0;
    }
    .name-wrapper > p {
      max-width: 100%;
    }
    .name-wrapper > input {
      width: 100%;
    }
  }
}
</style>
