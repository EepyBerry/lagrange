import { PlanetType, PlanetClassification } from "../types"

export function getI18nPlanetType(planetType?: PlanetType): string {
  switch (planetType) {
    case PlanetType.PLANET: return 'dialog.planetinfo.basic.type_planet';
    case PlanetType.MOON: return 'dialog.planetinfo.basic.type_moon';
    case PlanetType.GAS_GIANT: return 'dialog.planetinfo.basic.type_gasgiant';
    default: return 'main.unknown_value'
  }
}
export function getI18nPlanetClassification(planetClassification?: PlanetClassification): string {
  switch (planetClassification) {
    case PlanetClassification.GENERIC_TELLURIC: return 'main.planet_data.class_generic_telluric'
    case PlanetClassification.GENERIC_LUNAR: return 'main.planet_data.class_generic_lunar'
    case PlanetClassification.GENERIC_GASEOUS: return 'main.planet_data.class_generic_gaseous'
    case PlanetClassification.TELLURIC_ICE: return 'main.planet_data.class_telluric_ice'
    case PlanetClassification.TELLURIC_OCEAN: return 'main.planet_data.class_telluric_ocean'
    case PlanetClassification.TELLURIC_TROPICAL: return 'main.planet_data.class_telluric_tropical'
    case PlanetClassification.TELLURIC_ARID: return 'main.planet_data.class_telluric_arid'
    case PlanetClassification.TELLURIC_CHTHONIAN: return 'main.planet_data.class_telluric_chthonian'
    case PlanetClassification.TELLURIC_LAVA: return 'main.planet_data.class_telluric_lava'
    default: return 'main.planet_data.class_indeterminate'
  }
}