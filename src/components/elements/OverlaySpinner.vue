<template>
    <div class="spinner">
        <iconify-icon class="spinner-icon" icon="mingcute:loading-3-fill" width="3rem"/>
    </div>
</template>
<style scoped lang="scss">
.spinner {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--lg-overlay);

    &-icon {
        animation: load 500ms linear infinite;
    }
}
@keyframes load {
    0% { transform: rotateZ(0deg) }
    100% { transform: rotateZ(360deg) }
}
</style>