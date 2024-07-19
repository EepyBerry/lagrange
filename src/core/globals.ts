import { reactive } from 'vue'
import LagrangeParameters from '@core/models/lagrange-parameters.model'
import type { IDBKeyBinding } from '@/dexie.config'
import { Vector3 } from 'three'

export const COMPACT_UI_WIDTH_THRESHOLD = 768

export const LOCALE_MAP: { [k: string]: string } = {
  en: 'en-US',
  fr: 'fr-FR',
}

export const LG_PARAMETERS = reactive(new LagrangeParameters())
export const LG_DEFAULTS = new LagrangeParameters()
export const LG_EDITOR_INPUTS = reactive<IDBKeyBinding[]>([]) // IDBKeyBinding[]

export const LG_CLOUDS_SHADOW_HEIGHT = 1e-4
export const LG_HEIGHT_DIVIDER = 200.0

export const LG_NAME_PLANET = 'lg:planet'
export const LG_NAME_CLOUDS = 'lg:planet:clouds'
export const LG_NAME_ATMOSPHERE = 'lg:planet:atmosphere'
export const LG_NAME_SUN = 'lg:sun'
export const LG_NAME_SUNLIGHT = 'lg:sun:light'
export const LG_NAME_AMBLIGHT = 'lg:ambient'

export const AXIS_X = new Vector3(1, 0, 0)
export const AXIS_Y = new Vector3(0, 1, 0)
export const AXIS_Z = new Vector3(0, 0, 1)
export const AXIS_NX = new Vector3(-1, 0, 0)
export const AXIS_NY = new Vector3(0, -1, 0)
export const AXIS_NZ = new Vector3(0, 0, -1)

export const SUN_INIT_POS = new Vector3(0, 0, 4e3)
