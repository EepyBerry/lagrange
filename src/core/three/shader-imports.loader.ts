import fbm from '@assets/glsl/functions/fbm.func.glsl?raw'
import colorUtils from '@assets/glsl/functions/color_utils.func.glsl?raw'
import bumpMap from '@assets/glsl/functions/bump_map.func.glsl?raw'

const IMPORT_TOKEN = "@import"

export function resolveImports(shader: string): string {
    return shader
        .replace(`${IMPORT_TOKEN} functions/fbm;`,           fbm)
        .replace(`${IMPORT_TOKEN} functions/color_utils;`,   colorUtils)
        .replace(`${IMPORT_TOKEN} functions/bump_map;`,      bumpMap)
}