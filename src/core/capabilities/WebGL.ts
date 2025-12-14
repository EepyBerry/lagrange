import type { Composer } from 'vue-i18n';

/**
 * Custom class to check WebGL2 capabilities, based on three.js code
 * @see https://github.com/mrdoob/three.js/blob/dev/examples/jsm/capabilities/WebGL.js
 */
export default class WebGL {
  private static _error?: Error | DOMException;

  static isWebGL2Available() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
    } catch (e) {
      this._error = e as Error | DOMException;
      return false;
    }
  }

  static isColorSpaceAvailable(colorSpace: PredefinedColorSpace) {
    try {
      const canvas = document.createElement('canvas');
      const ctx = window.WebGL2RenderingContext && canvas.getContext('webgl2')!;
      ctx.drawingBufferColorSpace = colorSpace;
      return ctx.drawingBufferColorSpace === colorSpace;
    } catch (_) {
      return false;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getWebGL2ErrorMessage(i18n: Composer<any>): string {
    return this._error ? this._error.message : i18n.t('main.error.default_webgl_support');
  }
}
