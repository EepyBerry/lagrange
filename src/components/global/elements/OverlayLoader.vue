<template>
  <div v-show="load" class="overlay-loader">
    <span class="progress-container">
      <span class="progress" />
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ load: boolean }>();
</script>

<style scoped lang="scss">
.overlay-loader {
  z-index: 10;
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  backdrop-filter: brightness(50%);

  .progress-container {
    position: relative;
    height: 0.5rem;
    width: 16rem;
    background: var(--lg-panel);
    border: var(--lg-var-border-width) solid var(--lg-accent);
    overflow: hidden;

    .progress {
      position: absolute;
      top: 0;
      height: 100%;
      width: 8rem;
      background: var(--lg-contrast);
      animation: progress 500ms linear infinite;
    }
  }
}
@keyframes rotate {
  0% {
    transform: rotateZ(0deg);
  }
  100% {
    transform: rotateZ(360deg);
  }
}
@keyframes progress {
  0% {
    left: -50%;
  }
  100% {
    left: 100%;
  }
}
</style>
