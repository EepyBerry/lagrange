import fbm from '@assets/glsl/functions/fbm.func.glsl?raw'
import voronoise from '@assets/glsl/functions/voronoise.func.glsl?raw'
import colorUtils from '@assets/glsl/functions/color_utils.func.glsl?raw'
import normalUtils from '@assets/glsl/functions/normal_utils.func.glsl?raw'
import atmosphereUtils from '@assets/glsl/functions/atmosphere_utils.func.glsl?raw'

const IMPORT_TOKEN = '@import'

const IMPORT_MAP: { [k: string]: string } = {
  'functions/fbm': fbm,
  'functions/voronoise': voronoise,
  'functions/color_utils': colorUtils,
  'functions/normal_utils': normalUtils,
  'functions/atmosphere_utils': atmosphereUtils
}

export function resolveImports(shader: string): string {
  for (const key of Object.keys(IMPORT_MAP)) {
    shader = shader.replace(`${IMPORT_TOKEN} ${key};`, IMPORT_MAP[key])
  }
  return shader
}