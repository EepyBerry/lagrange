import { ShaderFileType } from "../types"

const IMPORT_REGEXP = /^@import (.*);$/gm

const GLSL_CORE_FILES: Record<string, any> = import.meta.glob('@assets/glsl/core/*.glsl', { eager: true, query: '?raw' })
const GLSL_BAKING_FILES: Record<string, any> = import.meta.glob('@assets/glsl/baking/*.glsl', { eager: true, query: '?raw' })
const GLSL_FUNCTION_FILES: Record<string, any> = import.meta.glob('@assets/glsl/functions/*.func.glsl', { eager: true, query: '?raw' })

export function resolveImports(shader: string): string {
  [...shader.matchAll(IMPORT_REGEXP)].forEach(match => {
    shader = shader.replace(match[0], fetch(match[1]+'.func.glsl', ShaderFileType.FUNCTION))
  })
  return shader
}

export function fetch(filename: string, type: ShaderFileType): string {
  let glslUris, glslRecords, correspondingFile

  switch (type) {
    case ShaderFileType.CORE: {
      glslRecords = GLSL_CORE_FILES
      glslUris = Object.keys(GLSL_CORE_FILES)
      break
    }
    case ShaderFileType.BAKING: {
      glslRecords = GLSL_BAKING_FILES
      glslUris = Object.keys(GLSL_BAKING_FILES)
      break
    }
    case ShaderFileType.FUNCTION: {
      glslRecords = GLSL_FUNCTION_FILES
      glslUris = Object.keys(GLSL_FUNCTION_FILES)
      break
    }
  }
  correspondingFile = glslUris.find(u => u.endsWith(filename))
  if (!correspondingFile) {
    throw new Error(`[shader-loader] Could not fetch '${filename}': file not found!`)
  }
  return glslRecords[correspondingFile].default
}