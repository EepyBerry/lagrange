import type { Composer } from "vue-i18n";

/**
 * Custom class to check WebGPU capabilities, based on three.js code
 * @see https://github.com/mrdoob/three.js/blob/dev/examples/jsm/capabilities/WebGPU.js
 */
export default class WebGPU {
    private static _error?: Error | DOMException

    static async isAvailable() {
        try {
            const isAvailable = (typeof navigator !== 'undefined' && navigator.gpu !== undefined);
            if (typeof window !== 'undefined' && isAvailable) {
                return Boolean(await navigator.gpu.requestAdapter());
            }
        } catch (e) {
            this._error = e as (Error | DOMException)
            return false
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static getErrorMessage(i18n: Composer<any>): string {
        return this._error
            ? this._error.message
            : i18n.t('main.error.default_webgpu_support');
    }
}