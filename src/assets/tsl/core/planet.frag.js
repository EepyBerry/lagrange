import { LG_PLANET_DATA } from '@/core/services/planet-editor.service';
import { uniform } from 'three/tsl'

// Size & PBR uniforms
const uRadius = uniform(LG_PLANET_DATA.value.planetRadius)
const uPBRParams = uniform({
  waterLevel: LG_PLANET_DATA.value.planetWaterLevel,
  waterRoughness: LG_PLANET_DATA.value.planetWaterRoughness,
  waterMetalness: LG_PLANET_DATA.value.planetWaterMetalness,
  groundRoughness: LG_PLANET_DATA.value.planetGroundRoughness,
  groundMetalness: LG_PLANET_DATA.value.planetGroundMetalness,
})

// Noise uniforms
const uWarp = uniform(LG_PLANET_DATA.value.planetSurfaceShowWarping)
const uDisplace = uniform(LG_PLANET_DATA.value.planetSurfaceShowDisplacement)
const uSurfaceDisplacement = uniform(LG_PLANET_DATA.value.planetSurfaceDisplacement)
const uSurfaceNoise = uniform(LG_PLANET_DATA.value.planetSurfaceNoise)

// Bump uniforms
const uBump = uniform(LG_PLANET_DATA.value.planetSurfaceShowBumps)
const uBumpStrength = uniform(LG_PLANET_DATA.value.planetSurfaceBumpStrength)
const uBumpOffset = uniform(0.005)

// Biome uniforms