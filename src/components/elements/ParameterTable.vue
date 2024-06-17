<template>
  <table>
    <tbody>
      <slot>
        <tr><td>Add parameters here</td></tr>
      </slot>
    </tbody>
  </table>
</template>
<style scoped lang="scss">
table {
  border: none;
  border-collapse: separate;
  border-spacing: 0 2px;
}
</style>