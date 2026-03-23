import { Vector3 } from "three";

// Responsiveness width thresholds
export const XS_WIDTH_THRESHOLD = 568;
export const SM_WIDTH_THRESHOLD = 768;
export const MD_WIDTH_THRESHOLD = 1200;

// Internationalization
export const LOCALE_MAP: { [k: string]: string } = {
  en: "en-US",
  fr: "fr-FR",
  de: "de-DE",
};

// Scene object names
export const MESH_NAME_PLANET = "Planet";
export const MESH_NAME_CLOUDS = "Clouds";
export const MESH_NAME_ATMOSPHERE = "Atmosphere";
export const MESH_NAME_RING_ANCHOR = "RingSystem";
export const MESH_NAME_SUN = "Sun";
export const MESH_NAME_SUNLIGHT = "SunLight";
export const MESH_NAME_AMBLIGHT = "AmbientLight";
// Baking scene object names
export const MESH_NAME_METALLICROUGHNESSMAP = "_MetallicRoughnessMap";
export const MESH_NAME_EMISSIVITYMAP = "_EmissivityMap";
export const MESH_NAME_HEIGHTMAP = "_HeightMap";
export const MESH_NAME_NORMALMAP = "_NormalMap";

// Global threejs axes
export const AXIS_X = new Vector3(1, 0, 0);
export const AXIS_Y = new Vector3(0, 1, 0);
export const AXIS_Z = new Vector3(0, 0, 1);
export const AXIS_NX = new Vector3(-1, 0, 0);
export const AXIS_NY = new Vector3(0, -1, 0);
export const AXIS_NZ = new Vector3(0, 0, -1);

// Textures
export const TEXTURE_SIZES = {
  SURFACE: 512,
  CLOUDS: 256,
  BIOME: 256,
  RING: 256,
};

// Miscellaneous
export const SUN_INIT_POS = new Vector3(0, 0, 4e3);
