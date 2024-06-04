import { reactive } from "vue";
import LagrangeParameters from "./lagrange-parameters";

export const LG_PARAMETERS = reactive(new LagrangeParameters())
export const LG_DEFAULTS = new LagrangeParameters()
