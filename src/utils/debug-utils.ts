import { saveAs } from "file-saver"

/**
 * Static debugging class, only normally used for development purposes
 */
export class DebugUtils {
  
  static biomeData: Uint8Array = new Uint8Array(256 * 256 * 4)

  /**
   * Downloads the current biome data in RAW format (32 BPP format)
   */
  static getRawBiomeData() {
    saveAs(new Blob([DebugUtils.biomeData]), 'biome-map.raw')
  }
}