import fbm from '@assets/glsl/functions/fbm.func.glsl?raw'
import colorUtils from '@assets/glsl/functions/color_utils.func.glsl?raw'
import normalUtils from '@assets/glsl/functions/normal_utils.func.glsl?raw'
import atmosphereUtils from '@assets/glsl/functions/atmosphere_utils.func.glsl?raw'

const IMPORT_TOKEN = "@import"
const NEW_LINE = '\r\n'

export function resolveImports(shader: string): string {
    return shader
        .replace(`${IMPORT_TOKEN} functions/fbm;`,           fbm + NEW_LINE)
        .replace(`${IMPORT_TOKEN} functions/color_utils;`,   colorUtils + NEW_LINE)
        .replace(`${IMPORT_TOKEN} functions/normal_utils;`,  normalUtils + NEW_LINE)
        .replace(`${IMPORT_TOKEN} functions/atmosphere_utils;`,  atmosphereUtils + NEW_LINE)
}