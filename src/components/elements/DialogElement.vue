<template>
  <dialog ref="dialog" class="lg">
    <section>
      <header class="dialog-header">
        <h2 v-if="showTitle" class="dialog-title">
          <slot name="title"></slot>
        </h2>
        <button @click="close" class="lg icon-button dialog-close" aria-label="Close dialog">
          <iconify-icon icon="mingcute:close-line" width="1.5rem" aria-hidden="true" />
        </button>
      </header>
      <div class="dialog-content">
        <slot name="content"></slot>
      </div>
    </section>
  </dialog>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';

const dialog: Ref<HTMLDialogElement|null> = ref(null)
defineProps<{ showTitle: boolean }>()

function open() {
  dialog.value!.showModal()
}
function close() {
  dialog.value!.close()
}

defineExpose({ open, close })
</script>

<style scoped lang="scss">
dialog[open].lg {
  position: fixed;

  background-color: var(--lg-primary);
  border: 1px solid var(--lg-accent);
  border-radius: 4px;
  padding: 1rem;
  margin: auto;
  max-width: 90%;
  color: var(--lg-text);

  display: flex;
  flex-direction: column;
  align-items: space-between;
  gap: 4px;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .dialog-title {
      font-weight: 600;
      padding-bottom: 1rem;
    }

    button.dialog-close {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
    }
  }
  .dialog-content {
    font-size: 0.875rem;
  }
}
dialog[open].lg::backdrop {
  background-color: rgb(0 0 0 / 37.5%);
}

@media screen and (max-width:767px) {
  dialog[open].lg {
    max-width: calc(100% - 1rem);
    padding: 0.75rem;
  }
}
</style>