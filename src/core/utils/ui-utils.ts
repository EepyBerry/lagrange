import { PlanetClass } from '@core/types.ts';

export function getPlanetClassStyle(clazz: PlanetClass): string[] {
  const defaultStyle = ['var(--lg-panel)', 'var(--lg-text)'];
  if (!clazz) return defaultStyle;
  switch (clazz) {
    case PlanetClass.PLANET_ICE:
      return ['var(--lg-planet-class-ice-background)', 'var(--lg-planet-class-ice-text)'];
    case PlanetClass.PLANET_OCEAN:
      return ['var(--lg-planet-class-ocean-background)', 'var(--lg-planet-class-ocean-text)'];
    case PlanetClass.PLANET_TROPICAL:
      return ['var(--lg-planet-class-tropical-background)', 'var(--lg-planet-class-tropical-text)'];
    case PlanetClass.PLANET_ARID:
      return ['var(--lg-planet-class-arid-background)', 'var(--lg-planet-class-arid-text)'];
    case PlanetClass.PLANET_CHTHONIAN:
      return ['var(--lg-planet-class-chthonian-background)', 'var(--lg-planet-class-chthonian-text)'];
    case PlanetClass.PLANET_MAGMATIC:
      return ['var(--lg-planet-class-magmatic-background)', 'var(--lg-planet-class-magmatic-text)'];
    case PlanetClass.MOON_ICE:
      return ['var(--lg-planet-class-ice-background)', 'var(--lg-planet-class-ice-text)'];
    case PlanetClass.MOON_CHTHONIAN:
      return ['var(--lg-planet-class-chthonian-background)', 'var(--lg-planet-class-chthonian-text)'];
    case PlanetClass.GASGIANT_COLD:
      return ['var(--lg-planet-class-ice-background)', 'var(--lg-planet-class-ice-text)'];
    case PlanetClass.GASGIANT_HOT:
      return ['var(--lg-planet-class-magmatic-background)', 'var(--lg-planet-class-magmatic-text)'];
    default:
      return defaultStyle;
  }
}
