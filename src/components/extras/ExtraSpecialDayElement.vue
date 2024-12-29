<template>
  <div v-if="specialDay && !!EXTRAS_SPECIAL_DAYS" class="special-day-box" :title="$t(specialDay!.translationKey)">
    <div class="special-day-emoji" :class="{ multi: specialDay!.emoji.length > 1, ...getSpecialOverlay(specialDay!.overlayMode) }">
      <iconify-icon v-for="emoji of specialDay?.emoji" :key="emoji" :icon="emoji" width="1.75rem" aria-hidden="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { checkSpecialDay, EXTRAS_SPECIAL_DAYS, getSpecialOverlay, type SpecialDayInfo } from '@/core/extras';
import { ref, type Ref } from 'vue';

const specialDay: Ref<SpecialDayInfo|undefined> = ref(checkSpecialDay())
</script>

<style lang="scss">
.special-day-box {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 4px;

  display: flex;
  align-items: center;
  justify-content: center;
  cursor: help;

  .special-day-emoji:not(.multi) {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .special-day-emoji.multi {
    position: relative;
    width: 100%;
    height: 100%;
    
    iconify-icon:first-child {
      inset: 0 auto auto 0.25rem;
    }
    iconify-icon:last-child {
      inset: auto 0 0 auto;
      filter: drop-shadow(-1px -1px var(--black));
    }

    iconify-icon {
      position: absolute;
      height: 2rem;
      display: flex;
      align-items: center;
    }
  }

  .special-day-emoji.overlay-1 {
    filter: hue-rotate(330deg) saturate(500%) brightness(25%);
  }
}
</style>