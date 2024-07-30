<template>
    <ParameterTable>
        <ParameterCheckbox
        v-model="LG_PLANET_DATA.atmosphereEnabled"
        id="a-toggle"
        :true-value="true"
        :false-value="false"
        >
        {{ $t('editor.controls.atmosphere.atmosphere_show') }}
        </ParameterCheckbox>
        <template v-if="LG_PLANET_DATA.atmosphereEnabled">
        <ParameterCategory>{{ $t('editor.controls.atmosphere.transform') }}</ParameterCategory>
        <ParameterSlider v-model="LG_PLANET_DATA.atmosphereHeight" id="a-height" :step="0.1" :min="1" :max="8">
            {{ $t('editor.controls.atmosphere.transform_height') }}
        </ParameterSlider>
        <ParameterSlider
            v-model="LG_PLANET_DATA.atmosphereDensityScale"
            id="a-density"
            :step="0.01"
            :min="1"
            :max="10"
        >
            {{ $t('editor.controls.atmosphere.transform_density') }}
        </ParameterSlider>
        <ParameterCategory>{{ $t('editor.controls.atmosphere.rgba') }}</ParameterCategory>
        <ParameterSlider v-model="LG_PLANET_DATA.atmosphereIntensity" id="a-int" :step="0.01" :min="0" :max="2">
            {{ $t('editor.controls.atmosphere.rgba_intensity') }}
        </ParameterSlider>
        <ParameterSlider v-model="LG_PLANET_DATA.atmosphereHue" id="a-hue" :step="0.01" :min="0" :max="2" extras="rgb">
            {{ $t('editor.controls.atmosphere.rgba_hue') }}
        </ParameterSlider>
        <ParameterColor v-model="LG_PLANET_DATA.atmosphereTint">
            {{ $t('editor.controls.atmosphere.rgba_tint') }}
        </ParameterColor>
        </template>
    </ParameterTable>
</template>
<script setup lang="ts">
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import ParameterTable from '@components/parameters/ParameterTable.vue'
import ParameterSlider from '@components/parameters/ParameterSlider.vue'
import ParameterCheckbox from '@components/parameters/ParameterCheckbox.vue'
import ParameterCategory from '@components/parameters/ParameterCategory.vue'
import ParameterDivider from '../parameters/ParameterDivider.vue'
import ParameterColor from '../parameters/ParameterColor.vue'
</script>