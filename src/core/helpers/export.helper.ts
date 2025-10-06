import saveAs from 'file-saver'
import { type Mesh } from 'three'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'
import { setObjectValue } from '../utils/utils'

const GLTF_EXPORTER = new GLTFExporter()

/**
 * Exports a list of meshes to a glTF file, which is then automatically downloaded to the user's device
 * @param meshes meshes to export, usually the full planet w/o atmosphere
 * @param filename name of the glTF file (without .gltf extension)
 */
export function exportMeshesToGLTF(meshes: Mesh[], filename: string): void {
  GLTF_EXPORTER.parse(
    meshes,
    (data) => {
      console.info('<Lagrange> Exported meshes to GLTF successfully!')
      const gltfString = JSON.stringify(patchGLTFProperties(data as Record<string, unknown>))
      saveAs(new Blob([gltfString]), `${filename}.gltf`)
    },
    (err) => console.error(err),
  )
}

/**
 * Patches certain values in the glTF file to work around three.js limitations
 * @param gltf the gltf object to patch
 * @returns the patched object
 */
function patchGLTFProperties(gltf: Record<string, unknown>): Record<string, unknown> {
  setObjectValue(gltf, 'materials[0].emissiveFactor', [1,1,1]) // emissiveFactor; isn't set when emissiveMap and/or emissiveNode are already set
  return gltf
}