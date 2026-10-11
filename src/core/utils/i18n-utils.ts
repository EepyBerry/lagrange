import { PlanetType, PlanetClass } from '../types';

export function getI18nPlanetType(planetType?: PlanetType): string {
  switch (planetType) {
    case PlanetType.PLANET:
      return 'dialog.planet_info.basic.type_planet';
    case PlanetType.MOON:
      return 'dialog.planet_info.basic.type_moon';
    case PlanetType.GASGIANT:
      return 'dialog.planet_info.basic.type_gasgiant';
    default:
      return 'common.unknown_value';
  }
}
export function getI18nPlanetClass(planetClass?: PlanetClass): string {
  switch (planetClass) {
    case PlanetClass.PLANET_TELLURIC:
      return 'common.planet_data.class_planet_telluric';
    case PlanetClass.PLANET_ICE:
      return 'common.planet_data.class_planet_ice';
    case PlanetClass.PLANET_OCEAN:
      return 'common.planet_data.class_planet_ocean';
    case PlanetClass.PLANET_TROPICAL:
      return 'common.planet_data.class_planet_tropical';
    case PlanetClass.PLANET_ARID:
      return 'common.planet_data.class_planet_arid';
    case PlanetClass.PLANET_CHTHONIAN:
      return 'common.planet_data.class_planet_chthonian';
    case PlanetClass.PLANET_MAGMATIC:
      return 'common.planet_data.class_planet_magmatic';
    case PlanetClass.MOON_ROCKY:
      return 'common.planet_data.class_moon_rocky';
    case PlanetClass.MOON_ICE:
      return 'common.planet_data.class_moon_ice';
    case PlanetClass.MOON_CHTHONIAN:
      return 'common.planet_data.class_moon_chthonian';
    case PlanetClass.GASGIANT_COLD:
      return 'common.planet_data.class_gasgiant_cold';
    case PlanetClass.GASGIANT_HOT:
      return 'common.planet_data.class_gasgiant_hot';
    default:
      return 'common.planet_data.class_indeterminate';
  }
}
