import { reactive } from "vue";
import LagrangeParameters from "@core/models/lagrange-parameters.model";

export const LG_PARAMETERS = reactive(new LagrangeParameters())
export const LG_DEFAULTS = new LagrangeParameters()

export const LG_NAME_PLANET = 'lg:planet'
export const LG_NAME_CLOUDS = 'lg:planet:clouds'
export const LG_NAME_SUN = 'lg:sun'
