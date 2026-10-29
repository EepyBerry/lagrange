import { Vector3 } from 'three';

// Internationalization
export const LOCALE_MAP: { [k: string]: string } = {
  en: 'en-US',
  fr: 'fr-FR',
  de: 'de-DE',
};

// Scene object names
export const MESH_NAME_PLANET = 'Planet';
export const MESH_NAME_CLOUDS = 'Clouds';
export const MESH_NAME_ATMOSPHERE = 'Atmosphere';
export const MESH_NAME_RING_ANCHOR = 'RingSystem';
export const MESH_NAME_SUN = 'Sun';
export const MESH_NAME_SUNLIGHT = 'SunLight';
export const MESH_NAME_AMBLIGHT = 'AmbientLight';
// Baking scene object names
export const MESH_NAME_METALLICROUGHNESSMAP = '_MetallicRoughnessMap';
export const MESH_NAME_EMISSIVITYMAP = '_EmissivityMap';
export const MESH_NAME_HEIGHTMAP = '_HeightMap';
export const MESH_NAME_NORMALMAP = '_NormalMap';

// Global threejs axes
export const AXIS_X = new Vector3(1, 0, 0);

// Textures
export const TEXTURE_SIZES = {
  PLANET: 512,
  SURFACE: 512,
  CLOUDS: 256,
  BIOME: 256,
  RING: 256,
  CRACKS: 256,
};

// Miscellaneous
export const SUN_INIT_POS = new Vector3(0, 0, 4e3);
