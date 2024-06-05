<template>
  <tr class="field">
    <td>
      <slot name="title">ParameterName</slot>
    </td>
    <td colspan="2" class="radio-options">
      <slot name="options"></slot>
    </td>
  </tr>
</template>

<style lang="scss">
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

  & > :nth-child(2) {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  & > :last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
}
</style>