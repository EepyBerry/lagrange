import saveAs from 'file-saver'
import { RenderTarget, SRGBColorSpace, type Mesh, type Scene } from 'three'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'
import type { PerspectiveCamera, WebGPURenderer } from 'three/webgpu'
import { bufferToDataURL } from '../utils/render-utils'
import { EventBus } from '../event-bus'

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
  let screenshotRTT!: RenderTarget
  try {
    const canvas = renderer.domElement
    screenshotRTT = new RenderTarget(canvas.width, canvas.height, { colorSpace: SRGBColorSpace })
    renderer.setRenderTarget(screenshotRTT)
    renderer.render(scene, camera)
    renderer.readRenderTargetPixelsAsync(screenshotRTT, 0, 0, canvas.width, canvas.height).then((v) => {
      renderer.setRenderTarget(null)
      const canvasTex = bufferToDataURL(v as Uint8Array, canvas.width, canvas.height)
      saveAs(canvasTex, `${planetName.replaceAll(' ', '_')}-${new Date().toISOString()}.png`)
    }).catch(err => {
      console.error('<Lagrange> Could not export screenshot!', err)
      EventBus.sendToastEvent('warn', 'toast.screenshot_failure', 3000)
    }).finally(() => {
      renderer.setRenderTarget(null)
      screenshotRTT?.dispose()
    })
  } catch (err) {
    renderer.setRenderTarget(null)
    screenshotRTT?.dispose()
    console.error('<Lagrange> Could not export screenshot!', err)
    EventBus.sendToastEvent('warn', 'toast.screenshot_failure', 3000)
  }
}
