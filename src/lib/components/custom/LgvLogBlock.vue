<template>
  <section class="lgv log-block">
    <template v-for="line in _log" :key="line.id">
      <div class="log-line" :class="line.level">
        <span v-if="showGlyphs" class="log-line__glyph">{{ levelGlyph(line.level) }}</span>
        <span v-if="line.isStackTrace">&nbsp;&nbsp;</span>
        <span class="log-line__text">{{ line.text }}</span>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import {
  type LogLevel,
  type InternalLogEntry,
  type LgvLogBlockExposes,
  type LogEventTypeMap,
  type LogEventHandlers,
} from '@lib/components/custom/LgvLogBlock.types.ts';
import { nanoid } from 'nanoid';
import { ref, type Ref } from 'vue';

const $props = withDefaults(defineProps<{ showGlyphs?: boolean; maxLines?: number }>(), {
  showGlyphs: true,
  maxLines: 100,
});
defineExpose<LgvLogBlockExposes>({ log, clear });

const _log: Ref<InternalLogEntry[]> = ref([]);
let _logEventMapper: LogEventHandlers = {
  success: (params) =>
    _log.value.push({
      level: 'success',
      id: nanoid(),
      text: params.message,
    }),
  info: (params) =>
    _log.value.push({
      level: 'info',
      id: nanoid(),
      text: params.message,
    }),
  alert: (params) =>
    _log.value.push({
      level: 'alert',
      id: nanoid(),
      text: params.message,
    }),
  error: (params) => {
    const prettifiedError = prettifyError(params.error);
    for (let i = 0; i < prettifiedError.length; i++) {
      _log.value.push({
        level: 'error',
        id: nanoid(),
        text: prettifiedError[i],
        isStackTrace: i > 0,
      });
    }
  },
};

function log<L extends LogLevel>(level: L, params: LogEventTypeMap[L]) {
  _logEventMapper[level](params);
  if (_log.value.length > $props.maxLines) {
    _log.value.splice(0, _log.value.length - $props.maxLines);
  }
}
function clear() {
  _log.value.splice(0);
}

function prettifyError(error: Error | string | unknown): string[] {
  if (error instanceof Error) {
    if (error.stack) {
      return error.stack.split('\n').filter((d) => d.length > 0);
    } else {
      return [error.message];
    }
  } else if (typeof error === 'string') {
    return [error];
  } else {
    return [error + ''];
  }
}

function levelGlyph(level: LogLevel) {
  switch (level) {
    case 'success':
      return '(✓)';
    case 'info':
      return '(i)';
    case 'alert':
      return '/!\\';
    case 'error':
      return '[x]';
  }
}
</script>

<style scoped lang="scss">
.lgv.log-block {
  padding: 0.75rem;
  background: var(--lg-log-panel);
  border: 1px solid var(--lg-accent);
  border-radius: 2px;
  font-family: monospace;
  overflow-x: auto;

  & > * {
    width: max-content;
    margin: 0;
  }

  & > *:last-child {
    margin-bottom: 0;
  }

  .log-line > .log-line__glyph {
    margin-right: 8px;
  }
  .log-line.success {
    color: var(--lg-log-success);
  }
  .log-line.info {
    color: var(--lg-log-info);
  }
  .log-line.alert {
    color: var(--lg-log-alert);
  }
  .log-line.error {
    color: var(--lg-log-error);
  }
}
.lgv.log-block.warn {
  border-color: var(--lg-warn-active);
  scrollbar-color: var(--lg-warn) var(--lg-warn-panel);
}
</style>
