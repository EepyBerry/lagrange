<template>
  <tr class="field">
    <td>
      <slot name="title">ParameterName</slot>
    </td>
    <td>
      <div class="radio-options">
        <slot name="options"></slot>
      </div>
    </td>
  </tr>
</template>

<style scoped lang="scss">
tr.field {
  td {
    font-size: 0.875rem;
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