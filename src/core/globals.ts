import { reactive } from "vue";
import LagrangeParameters from "@core/models/lagrange-parameters.model";

export const SITE_NAME = 'Lagrange'

export const LG_PARAMETERS = reactive(new LagrangeParameters())
export const LG_DEFAULTS = new LagrangeParameters()

export const LG_UPDATE_PARAMS = ['_planetGeometryType', '_planetMeshQuality']
export const LG_CLOUDS_SHADOW_HEIGHT = 1e-4
export const LG_HEIGHT_DIVIDER = 200.0

export const LG_NAME_PLANET = 'lg:planet'
export const LG_NAME_CLOUDS = 'lg:planet:clouds'
export const LG_NAME_ATMOSPHERE = 'lg:planet:atmosphere'
export const LG_NAME_SUN = 'lg:sun'
export const LG_NAME_AMBLIGHT = 'lg:ambient'