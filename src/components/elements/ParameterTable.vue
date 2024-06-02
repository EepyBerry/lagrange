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
  border-collapse: collapse;
  gap: 4px;
}
</style>