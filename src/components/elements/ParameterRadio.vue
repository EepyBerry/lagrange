<template>
  <tr class="field">
    <td>
      <slot name="title">ParameterName</slot>
    </td>
    <td class="radio-options">
      <slot name="options"></slot>
    </td>
  </tr>
</template>

<style scoped lang="scss">
tr.field {
  width: 100%;

  td {
    font-size: 0.875rem;
    text-wrap: nowrap;
  }
  td:first-child {
    width: 100%;
    white-space: nowrap;
  }
  td:nth-child(2),
  td:last-child {
    width: auto;
    padding-left: 4px;
  }

  td.unit {
    font-size: 0.75rem;
  }
}
.radio-options {
  display: flex;
  align-items: center;
  height: 100%;
  justify-content: flex-end;

  :deep(.radio-button) {
    border-radius: 0;
  }
  & > :deep(.radio-button:first-of-type) {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    border-right: 2px solid var(--lg-button-active);
  }
  & > :deep(.radio-button:last-of-type) {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    border-left: 2px solid var(--lg-button-active);
  }
}
</style>