<template>
  <div class="graph-container">
    <figure class="graph">
      <div class="graph__area">
        <div class="graph__backgrid"></div>
        <span class="axis-x label">{{ $t('dialog.planet_info.biomes_humi') }} (%)</span>
        <span class="axis-x grads" />
        <span class="axis-y label">{{ $t('dialog.planet_info.biomes_temp') }} (%)</span>
        <span class="axis-y grads" />
        <div
          class="rect"
          v-for="(area, index) in areas.toReversed()"
          :key="index"
          :style="{
            left: `${100 * area.rect.x}%`,
            bottom: `${100 * area.rect.y}%`,
            width: `${100 * area.rect.w}%`,
            height: `${100 * area.rect.h}%`,
            borderColor: '#' + area.color.getHexString(),
            background: '#' + area.color.getHexString() + 'cf',
          }"
          @mouseover="$emit('area-hover', area.id)"
          @mouseleave="$emit('area-leave')"
        />
      </div>
    </figure>
  </div>
</template>

<script setup lang="ts">
import type Rect from '@core/utils/math/rect.ts';
import type { Color } from 'three/webgpu';

export type BiomeArea = { id: string; color: Color; rect: Rect };
defineProps<{ areas: BiomeArea[] }>();
defineEmits(['area-hover', 'area-leave']);
</script>

<style scoped lang="scss">
.graph-container {
  $corner-length: 10px;
  padding: 1px;
  width: 100%;
  height: 100%;
  background: var(--lg-input);

  clip-path: polygon(
    0 $corner-length,
    $corner-length 0,
    calc(100% - $corner-length) 0,
    100% $corner-length,
    100% calc(100% - $corner-length),
    calc(100% - $corner-length) 100%,
    $corner-length 100%,
    0 calc(100% - $corner-length),
    0 $corner-length
  );
}

.graph {
  $axis-color: #eee;
  $background-color: var(--lg-panel);
  $border-color: var(--lg-input);

  min-height: 240px;
  height: stretch;
  padding: 1.5rem;
  display: flex;
  background: $background-color;

  clip-path: inherit;

  .graph__backgrid {
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(
        transparent,
        transparent calc(10% - 1px),
        $border-color calc(10% - 1px),
        $border-color 10%
      ),
      repeating-linear-gradient(
        0.25turn,
        transparent,
        transparent calc(10% - 1px),
        $border-color calc(10% - 1px),
        $border-color 10%
      );
  }

  .graph__area {
    position: relative;
    flex: 1;
    height: 100%;
    min-height: 240px;

    border-left: 1px solid $axis-color;
    border-bottom: 1px solid $axis-color;
    border-top: 1px solid $border-color;

    .rect {
      position: absolute;
      background: var(--lg-accent);
      border: 2px solid;
      border-radius: 1px;

      transition: filter 0.1s linear;
      &:hover {
        filter: brightness(1.2);
      }
    }
    .axis-x.label {
      position: absolute;
      inset: auto 12px -22px auto;
      font-size: 12px;
      color: $axis-color;
    }
    .axis-x.grads {
      z-index: 1;
      position: absolute;
      inset: auto 0 0 0;
      height: 2px;
      background: repeating-linear-gradient(
        to right,
        transparent,
        transparent calc(10% - 2px),
        $axis-color calc(10% - 2px),
        $axis-color 10%
      );
    }
    .axis-y.label {
      position: absolute;
      writing-mode: sideways-lr;
      text-orientation: mixed;
      inset: 8px auto auto -22px;
      font-size: 12px;
      color: $axis-color;
    }
    .axis-y.grads {
      z-index: 1;
      position: absolute;
      inset: 0 auto 0 0;
      width: 2px;
      background: repeating-linear-gradient(
        to top,
        transparent,
        transparent calc(10% - 2px),
        $axis-color calc(10% - 2px),
        $axis-color 10%
      );
    }
  }
  .graph__area::after {
    z-index: 1;
    content: '';
    position: absolute;
    bottom: -6.5px;
    left: -6.5px;
    width: 12px;
    height: 12px;
    background: $background-color;
    border: 1px solid $axis-color;
    border-radius: 6px;
  }
}
</style>
