<template>
  <div :id="'measurement-'+valueLabel.toLocaleLowerCase()">
    <p :id="'measurement-'+valueLabel.toLocaleLowerCase()+'-label'">{{ valueLabel }}</p>
    <div class="measurement-box-inner">
      <iconify-icon
        :icon="icon"
        width="1.5rem"
        aria-hidden="true"
      />
      <p :aria-labelledby="'measurement-'+valueLabel+'-label'">{{ strValue }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ strValue?: string, icon: string, valueLabel: string }>()
</script>

<style scoped lang="scss">
.measurement-box-inner {
  padding: 0.25rem;
  background: var(--lg-accent);
  border-radius: 2px;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
}
</style>