import { type Mesh } from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { setObjectValue } from '../utils/utils';

/**
 * Exports a list of meshes to a glTF file, which is then automatically downloaded to the user's device
 * @param exporter instance of GLTFExporter
 * @param meshes meshes to export, usually the full planet w/o atmosphere
 */
export async function exportMeshesToGLTF(exporter: GLTFExporter, meshes: Mesh[]): Promise<string> {
  try {
    const gltf = await exporter.parseAsync(meshes, { embedImages: true });
    const gltfString = JSON.stringify(patchGLTFProperties(gltf as Record<string, unknown>));
    return URL.createObjectURL(new Blob([gltfString]));
  } catch (err) {
    console.error(err);
    return '';
  }
}

/**
 * Patches certain values in the glTF file to work around three.js limitations
 * @param gltf the gltf object to patch
 * @returns the patched object
 */
function patchGLTFProperties(gltf: Record<string, unknown>): Record<string, unknown> {
  setObjectValue(gltf, 'materials[0].emissiveFactor', [1,1,1]); // emissiveFactor; isn't set when emissiveMap and/or emissiveNode are already set
  return gltf;
}