import { Vector3 } from 'three'
import { ref } from 'vue'

// Responsiveness width thresholds
export const XS_WIDTH_THRESHOLD = 568
export const SM_WIDTH_THRESHOLD = 768
export const MD_WIDTH_THRESHOLD = 1200

// Internationalization
export const LOCALE_MAP: { [k: string]: string } = {
  en: 'en-US',
  fr: 'fr-FR',
}

// Accessibility
export const A11Y_ANIMATE = ref(true)

// Extras
export const EXTRAS_HOLOGRAM_MODE = ref(true)

// Scene object names
export const LG_NAME_PLANET = 'lg:planet'
export const LG_NAME_CLOUDS = 'lg:planet:clouds'
export const LG_NAME_ATMOSPHERE = 'lg:planet:atmosphere'
export const LG_NAME_RING = 'lg:planet:ring'
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
export const ATMOSPHERE_HEIGHT_DIVIDER = 200.0

// Textures
export const TEXTURE_SIZES = {
  SURFACE: 512,
  CLOUDS: 256,
  BIOME: 256,
  RING: 256,
}

/**
 * Equal to 1/256.0
 */
export const INT8_TO_UNIT_MUL = 3.90625e-3
