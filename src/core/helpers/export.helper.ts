import saveAs from 'file-saver'
import type { Mesh, Scene } from 'three'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'
import type { WebGPURenderer } from 'three/webgpu'

const GLTF_EXPORTER = new GLTFExporter()

export function exportSceneToGLTF(scene: Scene, filename: string): void {
  GLTF_EXPORTER.parse(
    scene,
    (data) => {
      console.info('<Lagrange> Exported scene to GLTF successfully!')
      saveAs(new Blob([JSON.stringify(data)]), `${filename}.gltf`)
    },
    (err) => console.error(err),
  )
}

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

export function exportPlanetScreenshot(renderer: WebGPURenderer, planetName: string): void {
  renderer.domElement.toBlob((blob) => {
    saveAs(blob!, `${planetName.replaceAll(' ', '_')}-${new Date().toISOString()}.png`)
  }, 'image/png')
}
