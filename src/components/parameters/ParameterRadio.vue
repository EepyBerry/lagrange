<template>
  <tr class="field">
    <td colspan="2">
      <div class="radio-label">
        <slot name="title">ParameterName</slot>
      </div>
      <div class="radio-options">
        <slot name="options"></slot>
      </div>
    </td>
  </tr>
</template>

<style scoped lang="scss">
tr.field {
  td {
    text-wrap: nowrap;
  }
}
.radio-options {
  display: flex;
  align-items: center;
  height: 2rem;
  justify-content: flex-end;
  gap: 2px;
  background: var(--lg-button-active);
  border-radius: 4px;
  border: none;

  :deep(.radio-button) {
    border-radius: 0;
    flex-grow: 1;
  }
  & > :deep(.radio-button:first-of-type) {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  & > :deep(.radio-button:last-of-type) {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
}
</style>
