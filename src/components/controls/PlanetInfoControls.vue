<template>
  <div id="planet-info" :class="{ compact: !!compactMode }">
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

      <button
        class="lg icon-button"
        :aria-label="$t(editMode ? 'a11y.topbar_rename_confirm' : 'a11y.topbar_rename')"
        @click="toggleEditMode"
      >
        <iconify-icon
          v-if="editMode"
          icon="mingcute:check-line"
          width="1.25rem"
          aria-hidden="true"
          :title="$t('tooltip.topbar_rename_confirm')"
        />
        <iconify-icon
          v-else
          icon="mingcute:edit-2-line"
          width="1.25rem"
          aria-hidden="true"
          :title="$t('tooltip.topbar_rename')"
        />
      </button>
    </div>
    <hr />
    <button
      class="lg dark"
      :aria-label="$t('a11y.topbar_reset')"
      :title="$t('tooltip.topbar_reset')"
      @click="resetDialog?.open()"
    >
      <iconify-icon icon="tabler:reload" width="1.5rem" aria-hidden="true" />
    </button>

    <!------ BEGIN floating menus ------>
    <!-- Randomization menu -->
    <button
      ref="randomMenuTrigger"
      class="lg dark"
      :class="{ active: isRandomMenuOpen }"
      :aria-label="$t('a11y.topbar_menu_random')"
      :title="$t('tooltip.topbar_menu_random')"
    >
      <iconify-icon icon="mingcute:shuffle-2-fill" width="1.5rem" aria-hidden="true" />
    </button>
    <div id="random-menu" ref="randomMenu" class="lg floating" :style="randomFloating.floatingStyles.value">
      <div class="floating-content">
        <label for="random-seed">Seed</label>
        <input id="random-seed" v-model="PRNG_SEED" class="lg" type="text" />
      </div>
      <div class="floating-actions">
        <button class="lg" @click="generateSeed">
          <iconify-icon icon="tabler:seeding" width="1.5rem" aria-hidden="true" />
          {{ $t('editor.$action_reseed') }}
        </button>
        <button class="lg success" @click="$emit('random')">
          <iconify-icon icon="mingcute:shuffle-2-fill" width="1.5rem" aria-hidden="true" />
          {{ $t('editor.$action_random') }}
        </button>
      </div>
    </div>

    <!-- Save menu -->
    <button
      ref="saveMenuTrigger"
      class="lg dark"
      :class="{ active: isSaveMenuOpen }"
      :aria-label="$t('a11y.topbar_menu_save')"
      :title="$t('tooltip.topbar_menu_save')"
    >
      <iconify-icon
        :icon="isSaveMenuOpen ? 'mdi:content-save-minus-outline' : 'mdi:content-save-plus-outline'"
        width="1.5rem"
        aria-hidden="true"
      />
    </button>
    <div ref="saveMenu" class="lg floating" :style="saveFloating.floatingStyles.value">
      <button class="lg dark" :aria-label="$t('a11y.topbar_save')" @click="closeSaveMenuAndEmit('save')">
        <iconify-icon icon="mingcute:save-2-line" width="1.5rem" aria-hidden="true" />
        <p>{{ $t('tooltip.topbar_save') }}</p>
      </button>
      <button
        v-if="!$route.path.endsWith('/new')"
        class="lg dark"
        :aria-label="$t('a11y.topbar_copy')"
        @click="closeSaveMenuAndEmit('copy')"
      >
        <iconify-icon icon="mingcute:copy-2-line" width="1.5rem" aria-hidden="true" />
        <p>{{ $t('tooltip.topbar_copy') }}</p>
      </button>
      <button class="lg dark" :aria-label="$t('a11y.topbar_gltf')" @click="closeSaveMenuAndEmit('gltf')">
        <iconify-icon icon="simple-icons:gltf" width="1.5rem" aria-hidden="true" />
        <p>{{ $t('tooltip.topbar_gltf') }}</p>
      </button>
    </div>
    <!------ END floating menus ------>
    <AppResetConfirmDialog ref="resetDialog" @confirm="$emit('reset')" />
  </div>
</template>

<script setup lang="ts">
import AppResetConfirmDialog from '../dialogs/AppResetConfirmDialog.vue'
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import { ref, watch, type Ref } from 'vue'
import { EventBus } from '@/core/event-bus'
import { autoUpdate, offset, useFloating } from '@floating-ui/vue'
import { PRNG_SEED, regenerateSeed } from '@/utils/math-utils'

const editMode: Ref<boolean> = ref(false)

const planetNameInput: Ref<HTMLInputElement | null> = ref(null)
const resetDialog: Ref<{ open: () => void } | null> = ref(null)

// floating-ui start
const isRandomMenuOpen: Ref<boolean> = ref(false)
const randomMenuTrigger: Ref<HTMLElement | null> = ref(null)
const randomMenu: Ref<HTMLElement | null> = ref(null)
const randomFloating = useFloating(randomMenuTrigger, randomMenu, {
  whileElementsMounted: autoUpdate,
  placement: 'bottom-end',
  middleware: [offset(8)],
})

const isSaveMenuOpen: Ref<boolean> = ref(false)
const saveMenuTrigger: Ref<HTMLElement | null> = ref(null)
const saveMenu: Ref<HTMLElement | null> = ref(null)
const saveFloating = useFloating(saveMenuTrigger, saveMenu, {
  whileElementsMounted: autoUpdate,
  placement: 'bottom-end',
  middleware: [offset(8)],
})
// floating-ui end

watch(() => EventBus.clickEvent.value, (evt) => onWindowClick(evt!))

defineProps<{ compactMode: boolean }>()
const $emit = defineEmits(['rename', 'reset', 'save', 'copy', 'gltf', 'random'])

function onWindowClick(evt: MouseEvent) {
  if (evt.target === randomMenuTrigger.value) {
    toggleRandomMenu()
  } else if (!randomMenu.value?.contains(evt.target as Node)) {
    toggleRandomMenu(false)
  }

  if (evt.target === saveMenuTrigger.value) {
    toggleSaveMenu()
  } else if (!saveMenu.value?.contains(evt.target as Node)) {
    toggleSaveMenu(false)
  }
}

function closeSaveMenuAndEmit(evt: 'rename' | 'reset' | 'save' | 'copy' | 'gltf' | 'random') {
  toggleSaveMenu(false)
  $emit(evt)
}

function generateSeed() {
  regenerateSeed()
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
  z-index: 10;
  pointer-events: all;
  height: 2.75rem;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;

  align-self: center;

  &.compact {
    justify-self: flex-end;
  }

  hr {
    height: 1.5rem;
    border-color: var(--lg-accent);
  }
  .name-wrapper {
    background: var(--lg-primary);
    border: 1px solid var(--lg-accent);
    border-radius: 4px;
    height: 2.75rem;
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

  #random-menu {
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
    border-radius: 0;
    border-left: none;
    border-top: none;
    border-right: none;

    height: 2.5rem;
    flex: 1;

    .name-wrapper {
      flex: 1;
      font-size: 1em;
      justify-content: space-between;
      width: 100%;
      min-width: 0;
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
