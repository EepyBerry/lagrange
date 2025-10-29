/**
 * Patchworked threejs class to check WebGPU capabilities
 * @see https://github.com/mrdoob/three.js/blob/4342d10ea73aa3cea3dcddd4973a6521dda8d5e8/examples/jsm/capabilities/WebGPU.js#L4
 */
export default class WebGPUPatchwork {
    private static _initError?: Error | DOMException

    static async isAvailable() {
        try {
            const isAvailable = (typeof navigator !== 'undefined' && navigator.gpu !== undefined);
            if (typeof window !== 'undefined' && isAvailable) {
                return Boolean(await navigator.gpu.requestAdapter());
            }
        } catch (e) {
            console.error(e)
            this._initError = e as (Error | DOMException)
            return false
        }
    }

    static getErrorMessage(): HTMLDivElement {
        const message = this._initError
            ? this._initError.message
            : 'Your browser does not support <a href="https://gpuweb.github.io/gpuweb/" style="color:blue">WebGPU</a> yet';
        const element = document.createElement('div');
        element.id = 'webgpumessage';
        element.innerHTML = message;
        return element;
    }
}