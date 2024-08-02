<template>
  <table>
    <slot>
      <tr>
        <td>Add parameters here</td>
      </tr>
    </slot>
  </table>
</template>
<style scoped lang="scss">
table {
  border: none;
  border-collapse: separate;
  border-spacing: 0 2px;
}
@media screen and (max-width: 1023px) {
  table {
    border-spacing: 0 8px;
    font-size: 1rem;
  }
}
</style>
