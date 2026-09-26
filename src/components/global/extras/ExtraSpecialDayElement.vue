<template>
  <div v-if="specialDay && EXTRAS_SPECIAL_DAYS" class="special-day-box" :title="$t(specialDay!.translationKey)">
    <div>
      <span class="a11y--visually-hidden">{{ $t(specialDay!.translationKey) }}</span>
      <div id="special-day-emoji" :class="[specialDay!.emoji.length > 1 ? 'multi' : '', specialDay?.cssClass]">
        <iconify-icon
          v-for="emoji of specialDay?.emoji"
          :key="emoji"
          :icon="emoji"
          width="1.675rem"
          aria-hidden="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { checkSpecialDay, EXTRAS_SPECIAL_DAYS, type SpecialDayInfo } from '@core/extras';
import { ref, type Ref } from 'vue';

const specialDay: Ref<SpecialDayInfo | undefined> = ref(checkSpecialDay());
</script>

<style lang="scss">
.special-day-box {
  $flat-angle: 1.25rem;
  z-index: 10;
  position: fixed;
  bottom: -1px;
  right: 11rem;

  padding: var(--lg-var-border-width) var(--lg-var-border-width) 0;

  background: var(--lg-accent);
  clip-path: polygon($flat-angle 0, calc(100% - $flat-angle) 0, 100% 100%, 0 100%);

  & > div {
    padding: 0.125rem calc($flat-angle + 0.25rem) 0.125rem calc($flat-angle + 0.25rem);
    background: var(--lg-primary);
    clip-path: inherit;

    display: flex;
    align-self: center;
    align-items: center;
    justify-content: center;
  }
}
#special-day-emoji {
  cursor: help;
  height: 2.5rem;
  min-width: 2.5rem;
}
#special-day-emoji:not(.multi) {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
#special-day-emoji.multi {
  position: relative;
  width: 100%;

  iconify-icon:first-child {
    position: absolute;
    inset: 0.1875rem auto auto 0.25rem;
  }
  iconify-icon:last-child {
    position: absolute;
    inset: auto 0 0.1875rem auto;
    filter: drop-shadow(-1px -1px var(--black));
  }
}

.special-day-emoji.aprilfools {
  filter: hue-rotate(330deg) saturate(500%) brightness(25%);
}
</style>
