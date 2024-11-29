import { ShaderFileType } from "../types"

const IMPORT_TOKEN = '@import'

const GLSL_CORE_FILES: Record<string, any> = import.meta.glob(`@assets/glsl/core/*.glsl`, { eager: true, query: '?raw' })
const GLSL_BAKING_FILES: Record<string, any> = import.meta.glob(`@assets/glsl/baking/*.glsl`, { eager: true, query: '?raw' })
const GLSL_FUNCTION_FILES: Record<string, any> = import.meta.glob(`@assets/glsl/functions/*.func.glsl`, { eager: true, query: '?raw' })

export function resolveImports(shader: string): string {
  const glslFuncUris = Object.keys(GLSL_FUNCTION_FILES)
  const glslFuncTokens: string[] = [
    'functions/fbm',
    'functions/color_utils',
    'functions/bump',
    'functions/atmosphere_utils',
    'functions/lwd',
    'functions/biomes'
  ]
  for (const token of glslFuncTokens) {
    const correspondingFunc = glslFuncUris.find(u => u.includes(token))
    if (!correspondingFunc) {
      console.error(`[shader-import] Could not load '${token}' shader function!`)
      continue
    }
    shader = shader.replace(`${IMPORT_TOKEN} ${token};`, GLSL_FUNCTION_FILES[correspondingFunc].default)
  }
  return shader
}

export function fetch(filename: string, type: ShaderFileType): string {
  let glslUris, correspondingFile
  if (type === ShaderFileType.CORE) {
    glslUris = Object.keys(GLSL_CORE_FILES)
    correspondingFile = glslUris.find(u => u.endsWith(filename))
    if (!correspondingFile) {
      throw new Error(`[shader-loader] Could not load '${filename}' core file!`)
    }
    return GLSL_CORE_FILES[correspondingFile].default
  } else if (type === ShaderFileType.BAKING) {
    glslUris = Object.keys(GLSL_BAKING_FILES)
    correspondingFile = glslUris.find(u => u.endsWith(filename))
    if (!correspondingFile) {
      throw new Error(`[shader-import] Could not load '${filename}' baking file!`)
    }
    return GLSL_BAKING_FILES[correspondingFile].default
  }
  throw new Error(`[shader-loader] Invalid shader file type supplied!`)
}