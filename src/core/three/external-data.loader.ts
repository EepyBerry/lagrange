import * as THREE from 'three'

export const TEXTURE_LOADER = new THREE.TextureLoader()
export const CUBE_TEXTURE_LOADER = new THREE.CubeTextureLoader()

/**
 *
 * @param path Loads a THREE.CubeTexture from the given path and faces
 * @param faces the faces of the cubemap
 */
export function loadCubeTexture(path: string, faces: string[], filter?: THREE.MinificationTextureFilter) {
  if (faces.length !== 6) {
    throw new Error('Exactly six faces are required for a CubeTexture !')
  }
  const cubemap = CUBE_TEXTURE_LOADER.setPath(path).load(faces)
  cubemap.minFilter = filter ?? THREE.NearestFilter
  return cubemap
}

/**
 * Loads a texture from a local URL (for pre-stored textures)
 * @param data the image URL
 */
export function loadTextureFromUrl(url: string, colorSpace: THREE.ColorSpace) {
  const texture = TEXTURE_LOADER.load(url, undefined, undefined, (err) => console.error(err))
  texture.colorSpace = colorSpace
  return texture
}
