import saveAs from 'file-saver'
import { type Mesh } from 'three'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'

const GLTF_EXPORTER = new GLTFExporter()

export function exportMeshesToGLTF(meshes: Mesh[], filename: string): void {
  GLTF_EXPORTER.parse(
    meshes,
    (data) => {
      console.info('<Lagrange> Exported meshes to GLTF successfully!')
      saveAs(new Blob([JSON.stringify(data)]), `${filename}.gltf`)
    },
    (err) => console.error(err),
  )
}
