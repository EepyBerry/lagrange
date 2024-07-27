<template>
  <tr>
    <td>
      <div class="keybind">
        <div class="keybinds-label">
          <iconify-icon :icon="icon" width="1.5rem" aria-hidden="true" />
          <slot></slot>
        </div>
        <div class="keybinds-key" :class="{ unset: keyBind?.key === '[unset]' }">
          <iconify-icon
            v-if="tryGetKeyRepresentation(keyBind?.key)"
            :icon="tryGetKeyRepresentation(keyBind?.key)"
            width="1.25rem"
          />
          <span v-else>{{ selected ? '.....' : keyBind?.key }}</span>
        </div>
        <button class="lg" :aria-label="$t('a11y.action_edit_keybind')" @click="$emit('toggle')">
          <iconify-icon
            v-if="selected"
            class="icon"
            icon="mingcute:close-line"
            width="1.25rem"
            aria-hidden="true"
          />
          <iconify-icon
            v-else
            class="icon"
            icon="mingcute:edit-2-line"
            width="1.25rem"
            aria-hidden="true"
          />
        </button>
      </div>
    </td>
  </tr>
</template>
<script setup lang="ts">
import type { IDBKeyBinding } from '@/dexie.config';

const $emit = defineEmits(['toggle'])
defineProps<{ keyBind?: IDBKeyBinding, selected: boolean, icon: string }>()

function tryGetKeyRepresentation(key?: string) {
  if (!key) {
    return undefined
  }
  switch (key) {
    case 'ARROWUP':
      return 'mingcute:arrow-up-line'
    case 'ARROWRIGHT':
      return 'mingcute:arrow-right-line'
    case 'ARROWDOWN':
      return 'mingcute:arrow-down-line'
    case 'ARROWLEFT':
      return 'mingcute:arrow-left-line'
    default:
      return undefined
  }
}
</script>

<style scoped lang="scss">
.keybind {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.keybinds-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-right: 0.5rem;
  flex: 1;
}
.keybinds-key {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 6rem;
  min-height: 2rem;
  background: var(--lg-panel);
  border: 1px solid var(--lg-accent);
  border-radius: 0.25rem;
  font-weight: 600;
  padding: 0 0.5rem;
  &.unset {
    border-color: var(--lg-warn-active);
  }
}
</style>