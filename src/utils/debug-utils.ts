import { LG_BUFFER_BIOME, LG_BUFFER_RING, LG_BUFFER_SURFACE } from '@/core/services/planet-editor.service'
import { saveAs } from 'file-saver'

/**
 * Static debugging class, only normally used for development purposes
 */
export class DebugUtils {
  /**
   * Downloads the current surface data in RAW format (32 BPP format)
   */
  static getRawRingData() {
    saveAs(new Blob([LG_BUFFER_RING]), 'ring-map.raw')
  }

  /**
   * Downloads the current surface data in RAW format (32 BPP format)
   */
  static getRawSurfaceData() {
    saveAs(new Blob([LG_BUFFER_SURFACE]), 'surface-map.raw')
  }

  /**
   * Downloads the current biome data in RAW format (32 BPP format)
   */
  static getRawBiomeData() {
    saveAs(new Blob([LG_BUFFER_BIOME]), 'biome-map.raw')
  }
}
