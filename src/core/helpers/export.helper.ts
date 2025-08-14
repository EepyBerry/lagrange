import saveAs from 'file-saver'
import { RenderTarget, SRGBColorSpace, type Mesh, type Scene } from 'three'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'
import type { PerspectiveCamera, WebGPURenderer } from 'three/webgpu'
import { bufferToDataURL } from '../utils/render-utils'

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

export function exportPlanetScreenshot(renderer: WebGPURenderer, scene: Scene, camera: PerspectiveCamera, planetName: string): void {
  const canvas = renderer.domElement
  const screenshotRTT = new RenderTarget(canvas.width, canvas.height, { colorSpace: SRGBColorSpace })
  renderer.setRenderTarget(screenshotRTT)
  renderer.render(scene, camera)
  renderer.readRenderTargetPixelsAsync(screenshotRTT, 0, 0, canvas.width, canvas.height).then((v)=> {
    const canvasTex = bufferToDataURL(v as Uint8Array, canvas.width, canvas.height)
    saveAs(canvasTex, `${planetName.replaceAll(' ', '_')}-${new Date().toISOString()}.png`)
  })
  renderer.setRenderTarget(null)
}
