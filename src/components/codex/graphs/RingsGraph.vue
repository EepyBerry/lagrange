<template>
  <div class="graph-container">
    <dl id="legend">
      <div>
        <dt class="mathsymbol">c</dt>
        <span>=</span>
        <dd>{{ $t('dialog.planet_info.rings_center') }}</dd>
      </div>
      <div>
        <dt class="mathsymbol">s</dt>
        <span>=</span>
        <dd>{{ $t('dialog.planet_info.rings_surface') }}</dd>
      </div>
    </dl>
    <figure class="graph">
      <div
        ref="graphArea"
        class="graph__area"
        :style="{
          '--planet-radius': `${planetRadius}`,
          '--planet-radius-pct': `${cssPlanetRadius}%`,
        }"
      >
        <span class="axis" />
        <span class="axis-grads" />
        <!-- labels -->
        <span id="label__center" class="mathsymbol">c</span>
        <span id="label__surface" class="mathsymbol">s</span>
        <!-- planet -->
        <img v-if="planetPreview" :src="planetPreview" alt="planet-preview" class="planet-preview" />
        <span class="planet-center cross-y" />
        <span class="planet-center cross-x" />
        <span class="planet-surface" />
        <span class="planet-top">
          <span class="planet-top__inner" />
        </span>
        <span class="planet-top-mask">
          <span class="planet-top-mask__inner" />
        </span>
        <span class="planet-bottom">
          <span class="planet-bottom__inner" />
        </span>
        <span class="planet-bottom-mask">
          <span class="planet-bottom-mask__inner" />
        </span>
        <!-- rings -->
        <template v-for="(ring, i) in props.rings" :key="ring.id">
          <span
            class="ring-label"
            :style="{
              '--ring-inner-radius-pct': `${(ring.innerRadius * 100) / RING_MAX_RADIUS}%`,
              '--ring-outer-radius-pct': `${(ring.outerRadius * 100) / RING_MAX_RADIUS}%`,
            }"
          >
            <span class="__marker-left" />
            <span class="__marker-line" />
            <span class="__marker-right" />
            <span class="__label">{{ String.fromCharCode(i + 65) }}</span>
          </span>
          <span
            class="ring"
            :class="{ hover: hoveredRing === ring.id }"
            :style="{
              '--z-index': -i - 2,
              '--ring-inner-radius-pct': `${(ring.innerRadius * 100) / RING_MAX_RADIUS}%`,
              '--ring-outer-radius-pct': `${(ring.outerRadius * 100) / RING_MAX_RADIUS}%`,
              '--ring-gradient': colorRampToRadialGradient(ring),
            }"
            @mouseover="setHover(ring.id)"
            @mouseleave="resetHover"
          >
            <span class="ring__inner" />
          </span>
          <span
            class="ring-mask"
            :style="{
              '--z-index': -i - 2,
              '--ring-outer-radius-pct': `${(ring.innerRadius * 100) / RING_MAX_RADIUS}%`,
            }"
          >
            <span class="ring__inner" />
          </span>
        </template>
      </div>
    </figure>
  </div>
</template>

<script setup lang="ts">
import type { ColorRamp } from '@core/models/planet/color-ramp.model.ts';
import { MathUtils } from 'three';
import { computed, onMounted, ref, useTemplateRef, type ComputedRef, type Ref } from 'vue';

const RING_MAX_RADIUS = 5;
export type Ring = {
  id: string;
  innerRadius: number;
  outerRadius: number;
  colorRamp: ColorRamp;
};

const props = defineProps<{ planetPreview?: string; planetRadius: number; rings: Ring[] }>();
const $emit = defineEmits(['ring-hover', 'ring-leave']);

const hoveredRing = defineModel<string | null>();
const cssPlanetRadius: ComputedRef<number> = computed(() => (props.planetRadius * 100) / RING_MAX_RADIUS);

const graphArea = useTemplateRef<HTMLDivElement>('graphArea');
const graphAreaWidth: Ref<number> = ref(0);
const graphResizeObserver = new ResizeObserver((entries) => {
  graphAreaWidth.value = entries[0].contentRect.width;
});

onMounted(() => graphResizeObserver.observe(graphArea.value!));

function setHover(id: string) {
  hoveredRing.value = id;
  $emit('ring-hover', id);
}
function resetHover() {
  hoveredRing.value = null;
  $emit('ring-leave');
}

function colorRampToRadialGradient(ring: Ring): string {
  if (!graphAreaWidth.value) {
    return 'transparent';
  }
  const innerRadiusPx = (ring.innerRadius / RING_MAX_RADIUS) * graphAreaWidth.value;
  const outerRadiusPx = (ring.outerRadius / RING_MAX_RADIUS) * graphAreaWidth.value;
  const gradientStart = (innerRadiusPx * 100) / outerRadiusPx;
  const gradient: string[] = [];
  for (const step of ring.colorRamp.steps) {
    const remappedFactor = MathUtils.mapLinear(MathUtils.clamp(step.factor, 0, 0.995), 0, 1, gradientStart, 99.95);
    const rgb = step.color.getHexString();
    const a = Math.ceil(step.alpha * 255).toString(16);
    gradient.push(`#${rgb + a.padStart(2, '0')} ${remappedFactor}%`);
  }
  return `radial-gradient(farthest-side at 0 0, ${gradient.join(', ')}, transparent 100%)`;
}
</script>

<style scoped lang="scss">
// Mixins
@mixin make-ring-quarter($inner-class, $ring-color, $top: true) {
  position: absolute;
  top: 50%;
  left: -0.5px;
  aspect-ratio: 1;
  @if $top {
    transform: translateY(-100%);
  }
  display: flex;

  .#{$inner-class}__inner {
    width: 100%;
    aspect-ratio: 1;
    background: $ring-color;
    @if $top {
      border-radius: 0 100% 0 0;
    } @else {
      border-radius: 0 0 100% 0;
    }
  }
}

// Styling
.graph-container {
  $corner-length: 10px;

  position: relative;
  padding: 1px;
  width: 100%;
  background: var(--lg-accent);

  clip-path: polygon(
    0 0,
    calc(100% - $corner-length) 0,
    100% $corner-length,
    100% calc(100% - $corner-length),
    calc(100% - $corner-length) 100%,
    $corner-length 100%,
    0 calc(100% - $corner-length),
    0 $corner-length
  );

  #legend {
    z-index: 1;
    position: absolute;
    top: 6px;
    right: 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-end;
    font-size: 14px;

    & > div {
      display: flex;
      align-items: center;
      gap: 3px;
    }
  }
}

.graph {
  $main-color: #eee;
  $axis-color: #888;
  $ring-color: var(--lg-contrast);
  $background-color: var(--lg-panel);
  $border-color: var(--lg-input);

  pointer-events: none;
  padding: 1.5rem;
  display: flex;
  background: $background-color;

  clip-path: inherit;
  .graph__area {
    position: relative;
    pointer-events: none;
    flex: 1;
    height: 160px;
    overflow: hidden;
  }
  .axis {
    position: absolute;
    inset: 50% 0;
    border-bottom: 1px dashed $axis-color;
  }
  .axis-grads {
    z-index: 1;
    position: absolute;
    inset: calc(50% - 4px) 0;
    height: 9px;
    background: repeating-linear-gradient(
      to right,
      transparent,
      transparent calc(20% - 2px),
      $axis-color calc(20% - 2px),
      $axis-color 20%
    );
  }
  #label__center {
    position: absolute;
    top: calc(50% - 24px);
    left: 8px;
    font-size: 18px;
  }
  #label__surface {
    position: absolute;
    top: calc(50% - 24px);
    left: calc(var(--planet-radius-pct) + 6px);
    font-size: 18px;
  }

  .planet-preview {
    $radius: var(--planet-radius);
    $normalized-radius: calc((1 / var(--planet-radius)));
    $correction-factor: calc(-0.05 * $normalized-radius);
    $scaled-image: calc($normalized-radius + $correction-factor);

    position: absolute;
    left: calc(var(--planet-radius-pct) * -1 - 1.5%);
    bottom: 50%;
    opacity: 0.25;
    transform: translateY(50%) scale($scaled-image);
    width: calc(var(--planet-radius-pct) * 2 + 3%);
    aspect-ratio: 1;
  }
  .planet-center {
    z-index: 1;
    position: absolute;
    &.cross-y {
      top: calc(50% - 5px);
      left: 0;
      height: 11px;
      border-left: 3px solid $main-color;
    }
    &.cross-x {
      top: calc(50% - 1px);
      left: -4px;
      width: 11px;
      border-bottom: 3px solid $main-color;
    }
  }

  .planet-surface {
    z-index: 1;
    position: absolute;
    top: calc(50% - 1px);
    left: calc(var(--planet-radius-pct) - 7.5px);
    width: 11px;
    border-bottom: 3px solid $main-color;
  }

  .planet-top-mask {
    z-index: -1;
    pointer-events: none;
    width: calc(var(--planet-radius-pct) - 3px);
    @include make-ring-quarter(planet-top-mask, $background-color);
  }
  .planet-top {
    z-index: -1;
    width: var(--planet-radius-pct);
    @include make-ring-quarter(planet-top, $main-color);
  }

  .planet-bottom-mask {
    z-index: -1;
    pointer-events: none;
    width: calc(var(--planet-radius-pct) - 3px);
    @include make-ring-quarter(planet-bottom-mask, $background-color, false);
  }
  .planet-bottom {
    z-index: -1;
    width: var(--planet-radius-pct);
    @include make-ring-quarter(planet-bottom, $main-color, false);
  }

  .ring-mask {
    pointer-events: auto;
    z-index: var(--z-index);
    width: var(--ring-outer-radius-pct);
    @include make-ring-quarter(ring, $background-color, false);
  }
  .ring {
    pointer-events: auto;
    transition: filter 0.1s linear;
    border: none;
    background: none;
    padding: 0;
    z-index: var(--z-index);
    width: var(--ring-outer-radius-pct);
    @include make-ring-quarter(ring, var(--ring-gradient), false);

    &.hover {
      filter: brightness(1.5);
    }
  }
  .ring-label {
    $height: 20px;
    position: absolute;
    top: calc(50% - $height);
    left: var(--ring-inner-radius-pct);
    width: calc(var(--ring-outer-radius-pct) - var(--ring-inner-radius-pct));
    height: $height;

    .__marker-left {
      position: absolute;
      left: 0;
      height: 100%;
      border-right: 2px solid $main-color;
    }
    .__marker-line {
      position: absolute;
      inset: 7px 0 auto;
      border-bottom: 1px dotted $main-color;
    }
    .__marker-right {
      position: absolute;
      right: 0;
      height: 100%;
      border-left: 2px solid $main-color;
    }
    .__label {
      position: absolute;
      top: -22px;
      left: calc(50%);
      transform: translateX(-50%);
      font-size: 16px;
    }
  }
}
</style>
