<template>
    <ParameterTable>
        <ParameterCheckbox
            v-model="LG_PLANET_DATA.biomesEnabled"
            id="b-biomes"
            :true-value="true"
            :false-value="false"
        >
            {{ $t('editor.controls.biomes.biomes_show') }}
        </ParameterCheckbox>
        <template v-if="LG_PLANET_DATA.biomesEnabled">
            <ParameterCheckbox
            v-model="LG_PLANET_DATA.biomePolesEnabled"
            id="b-poles"
            :true-value="true"
            :false-value="false"
            >
            {{ $t('editor.controls.biomes.poles_show') }}
            </ParameterCheckbox>
        </template>
    </ParameterTable>
</template>
<script setup lang="ts">
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import ParameterTable from '@components/parameters/ParameterTable.vue'
import ParameterCheckbox from '@components/parameters/ParameterCheckbox.vue'
</script>