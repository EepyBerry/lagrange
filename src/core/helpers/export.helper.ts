import saveAs from "file-saver";
import type { Mesh, Scene } from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

const GLTF_EXPORTER = new GLTFExporter()

export function exportSceneToGLTF(scene: Scene, filename: string) {
    GLTF_EXPORTER.parse(scene, 
        (data) => {
            console.info('Exported scene to GLTF successfully!')
            saveAs(new Blob([JSON.stringify(data)]), `${filename}.gltf`)
        },
        (err) => console.error(err)
    )
}

export function exportMeshesToGLTF(meshes: Mesh[], filename: string) {
  GLTF_EXPORTER.parse(meshes, 
      (data) => {
          console.info('Exported meshes to GLTF successfully!')
          saveAs(new Blob([JSON.stringify(data)]), `${filename}.gltf`)
      },
      (err) => console.error(err)
  )
}