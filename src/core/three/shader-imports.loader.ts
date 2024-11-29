import fbm from '@assets/glsl/functions/fbm.func.glsl?raw'
import voronoise from '@assets/glsl/functions/voronoise.func.glsl?raw'
import colorUtils from '@assets/glsl/functions/color_utils.func.glsl?raw'
import bump from '@assets/glsl/functions/bump.func.glsl?raw'
import atmosphereUtils from '@assets/glsl/functions/atmosphere_utils.func.glsl?raw'
import lwd from '@assets/glsl/functions/lwd.func.glsl?raw'
import biomes from '@assets/glsl/functions/biomes.func.glsl?raw'

const IMPORT_TOKEN = '@import'
const IMPORT_MAP: { [k: string]: string } = {
  'functions/fbm': fbm,
  'functions/voronoise': voronoise,
  'functions/color_utils': colorUtils,
  'functions/bump': bump,
  'functions/atmosphere_utils': atmosphereUtils,
  'functions/lwd': lwd,
  'functions/biomes': biomes,
}

export function resolveImports(shader: string): string {
  for (const key of Object.keys(IMPORT_MAP)) {
    shader = shader.replace(`${IMPORT_TOKEN} ${key};`, IMPORT_MAP[key])
  }
  return shader
}
