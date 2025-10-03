import saveAs from 'file-saver'
import { type Mesh } from 'three'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'
import { setObjectValue } from '../utils/utils'

const GLTF_EXPORTER = new GLTFExporter()

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

function patchGLTFProperties(gltf: Record<string, unknown>): Record<string, unknown> {
  setObjectValue(gltf, 'materials[0].emissiveFactor', [1,1,1])
  return gltf
}