<template>
  <div class="graph-container">
    <figure class="graph">
      <ol class="datapoints">
        <li>
          <label for="datapoint__radius" class="datapoint__label">
            {{ $t('dialog.planet_info.basic.radius') }}
          </label>
          <p id="datapoint__radius" class="datapoint__value">
            <span class="mathsymbol">r&nbsp;=&nbsp;</span>
            <span>{{ planet.planetRadius.toFixed(2) }}&nbsp;u</span>
          </p>
        </li>
        <li>
          <label for="datapoint__axialtilt" class="datapoint__label">
            {{ $t('dialog.planet_info.basic.axialtilt') }}
          </label>
          <p id="datapoint__axialtilt" class="datapoint__value">
            <span class="mathsymbol">a&nbsp;=&nbsp;</span>
            <span>{{ planet.planetAxialTilt.toFixed(2) }}&nbsp;°</span>
          </p>
        </li>
        <li class="filler" />
        <li>
          <label for="datapoint__waterlevel" class="datapoint__label">
            {{ $t('dialog.planet_info.basic.waterlevel') }}
          </label>
          <p id="datapoint__waterlevel" class="datapoint__value">
            <span class="mathsymbol">h<sub>l</sub>&nbsp;=&nbsp;</span>
            <span>{{ (planet.planetWaterLevel * 100).toFixed(2) }}&nbsp;%</span>
          </p>
        </li>
      </ol>

      <!-- BEGIN main graph -->
      <div class="planet__container">
        <div class="planet">
          <span class="center" />
          <span class="outline" />
          <span class="water-axis">
            <span id="label__waterlevel" class="mathsymbol">h<sub>l</sub></span>
          </span>
          <span class="equator">
            <span id="label__radius" class="mathsymbol">r</span>
          </span>
          <span class="radius" />
        </div>
        <span class="zero-axis">
          <span id="label__axialtilt" class="mathsymbol">a</span>
        </span>
        <span class="axis" />
      </div>
      <!-- END main graph -->

      <ol class="datapoints">
        <li>
          <label for="datapoint__ambientlight" class="datapoint__label">
            {{ $t('dialog.planet_info.basic.ambient_light') }}
          </label>
          <p id="datapoint__ambientlight" class="datapoint__value">
            <span class="mathsymbol">L<sub>a</sub>&nbsp;=&nbsp;</span>
            <span>{{ planet.ambLightIntensity.toFixed(2) }}&nbsp;u</span>
          </p>
        </li>
        <li class="filler" />
        <li>
          <label for="datapoint__wateremissive" class="datapoint__label">
            {{ $t('dialog.planet_info.basic.emissive_water') }}
          </label>
          <p id="datapoint__wateremissive" class="datapoint__value">
            <span class="mathsymbol">Em<sub>l</sub>&nbsp;=&nbsp;</span>
            <span>{{ planet.planetWaterEmissiveIntensity.toFixed(2) }}&nbsp;u</span>
          </p>
        </li>
        <li>
          <label for="datapoint__surfaceemissive" class="datapoint__label">
            {{ $t('dialog.planet_info.basic.emissive_surface') }}
          </label>
          <p id="datapoint__surfaceemissive" class="datapoint__value">
            <span class="mathsymbol">Em<sub>s</sub>&nbsp;=&nbsp;</span>
            <span>{{ planet.getMaxGroundEmissiveIntensity().toFixed(2) }}&nbsp;u</span>
          </p>
        </li>
      </ol>
    </figure>
  </div>
</template>

<script setup lang="ts">
import type PlanetData from '@core/models/planet/planet-data.model.ts';
defineProps<{ planet: PlanetData }>();
</script>

<style scoped lang="scss">
.graph-container {
  $corner-length: 10px;
  padding: 1px;
  width: 100%;
  height: 100%;
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

  .graph {
    height: stretch;
    padding: 0.5rem;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-content: stretch;
    justify-content: center;
    gap: 1rem;
    background: var(--lg-panel);

    clip-path: inherit;
  }
  .datapoints {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;

    & > li {
      width: 100%;
      list-style-type: none;

      max-width: 16ch;
      white-space: wrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    & > li.filler {
      flex: 1;
    }

    .datapoint__label {
      font-size: 13px;
      text-wrap: wrap;
    }
    .datapoint__value {
      padding: 0.125rem 0.375rem;
      background: var(--lg-panel);
      border: 1px solid var(--lg-accent);
      text-align: end;

      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
    }
  }
}

.planet__container {
  --graph-size: 180px;
  $size: var(--graph-size);
  $rotation: -7.5deg;
  $radius-margin: 32px;

  position: relative;
  justify-self: center;
  height: $size;
  margin: auto 0;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  .water-axis {
    position: absolute;
    bottom: 7%;
    right: 7%;
    width: 2px;
    height: 16px;
    border-right: 2px dotted #fff;
    transform: rotate(-45deg);

    #label__waterlevel {
      position: absolute;
      bottom: -10px;
      right: -18px;
      transform: rotate(45deg);
      font-size: 16px;
    }
  }
  .zero-axis {
    position: absolute;
    top: 0;
    left: calc(($size * 0.5) - 10px);
    width: 10px;
    height: 50%;
    border-top: 1px dotted #fff;
    border-right: 1px solid #fff;

    #label__axialtilt {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 16px;
    }
  }
  .axis {
    position: absolute;
    top: 0;
    left: calc($size * 0.5 - 1px);
    width: 2px;
    height: 100%;
    border-left: 2px dashed #fff;
    transform: rotate($rotation);
  }
  .planet {
    position: relative;
    height: calc($size - $radius-margin);
    aspect-ratio: 1;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 2px solid #fff;
    border-radius: 50%;

    .center {
      position: absolute;
      top: calc(($size - $radius-margin) * 0.5 - 2px);
      left: calc(($size - $radius-margin) * 0.5 - 4px);
      width: 4px;
      height: 4px;
      background: #fff;
      border-radius: 50%;
    }

    .radius {
      position: absolute;
      left: calc(($size - $radius-margin) * 0.5 - 2px);
      top: calc(($size - $radius-margin) * 0.5 - 5px);
      width: calc(($size - $radius-margin) * 0.5 + 2px);
      border-bottom: 1px solid #fff;
      transform: rotate($rotation);
    }
    .equator {
      position: absolute;
      top: calc(($size - $radius-margin) * 0.375);
      width: calc(($size - $radius-margin) - 2px);
      height: calc(($size - $radius-margin) * 0.25);
      border-bottom: 2.5px solid #fff;
      border-radius: 50%;
      transform: rotate($rotation);

      #label__radius {
        position: absolute;
        right: -14px;
        top: 6px;
        transform: rotate(-$rotation);
        font-size: 16px;
      }
    }
    .equator::before {
      content: '';
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
      border-top: 2px dotted #fff;
      border-radius: 50%;
    }
  }
}

@media screen and (max-width: 767px) {
  .graph-container .datapoints {
    .datapoint__label {
      font-size: 14px;
    }
    .datapoint__value {
      font-size: 16px;
    }
  }
  .planet__container {
    --graph-size: 160px;
  }
}

@media screen and (max-width: 567px) {
  .graph-container .graph {
    grid-template-columns: 1fr 1fr;

    .datapoints > li {
      max-width: unset;
    }
  }
  .planet__container {
    display: none;
  }
}
</style>
