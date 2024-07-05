<template>
    <div v-show="load" class="spinner">
        <iconify-icon class="spinner-icon" icon="mingcute:loading-3-fill" width="6rem" aria-hidden="true" />
    </div>
</template>

<script setup lang="ts">
defineProps<{ load: boolean }>()
</script>

<style scoped lang="scss">
.spinner {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    //background: var(--lg-overlay);
    backdrop-filter: brightness(50%);
    z-index: 5;

    &-icon {
        animation: rotate 500ms linear infinite;
    }
}
@keyframes rotate {
    0% { transform: rotateZ(0deg) }
    100% { transform: rotateZ(360deg) }
}
</style>