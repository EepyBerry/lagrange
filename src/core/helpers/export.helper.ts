import saveAs from "file-saver";
import type { Scene } from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

const GLTF_EXPORTER = new GLTFExporter()

export function exportToGLTF(scene: Scene, filename: string) {
    GLTF_EXPORTER.parse(scene, 
        (data) => {
            console.info('Exported scene to GLTF successfully!')
            saveAs(new Blob([JSON.stringify(data)]), `${filename}.gltf`)
        },
        (err) => console.error(err)
    )
}