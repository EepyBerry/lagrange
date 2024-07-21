import { reactive } from 'vue'
import PlanetData from '@core/models/planet-data.model'
import type { IDBKeyBinding } from '@/dexie.config'
import { Vector3 } from 'three'

// Responsiveness width thresholds
export const XS_WIDTH_THRESHOLD = 568
export const SM_WIDTH_THRESHOLD = 768
export const MD_WIDTH_THRESHOLD = 1200

// Internationalization
export const LOCALE_MAP: { [k: string]: string } = {
  en: 'en-US',
  fr: 'fr-FR',
}


// Editor variables
export const LG_PARAMETERS = reactive(new PlanetData())
export const LG_DEFAULTS = new PlanetData()
export const LG_EDITOR_INPUTS = reactive<IDBKeyBinding[]>([]) // IDBKeyBinding[]

export const LG_CLOUDS_SHADOW_HEIGHT = 1e-4
export const LG_HEIGHT_DIVIDER = 200.0

export const LG_NAME_PLANET = 'lg:planet'
export const LG_NAME_CLOUDS = 'lg:planet:clouds'
export const LG_NAME_ATMOSPHERE = 'lg:planet:atmosphere'
export const LG_NAME_SUN = 'lg:sun'
export const LG_NAME_SUNLIGHT = 'lg:sun:light'
export const LG_NAME_AMBLIGHT = 'lg:ambient'

// Global threejs axes
export const AXIS_X = new Vector3(1, 0, 0)
export const AXIS_Y = new Vector3(0, 1, 0)
export const AXIS_Z = new Vector3(0, 0, 1)
export const AXIS_NX = new Vector3(-1, 0, 0)
export const AXIS_NY = new Vector3(0, -1, 0)
export const AXIS_NZ = new Vector3(0, 0, -1)

// Miscellaneous
export const SUN_INIT_POS = new Vector3(0, 0, 4e3)
