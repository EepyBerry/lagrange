export default class WebGPUPatchwork {
    private static _initialized: boolean = false
    private static _isAvailable: boolean = false

    static async init() {
        this._isAvailable = (typeof navigator !== 'undefined' && navigator.gpu !== undefined)
        if (typeof window !== 'undefined' && this._isAvailable) {
            this._isAvailable = Boolean(await navigator.gpu.requestAdapter())
        }
        this._initialized = true
    }

    static async isAvailable() {
        if (!this._initialized) {
            throw new Error("Cannot execute call: WebGPU wasn't initialized yet (call WebGPUPatchwork.init() ONCE before any operation)")
        }
        this._isAvailable = (typeof navigator !== 'undefined' && navigator.gpu !== undefined)
        if (typeof window !== 'undefined' && this._isAvailable) {
            this._isAvailable = Boolean(await navigator.gpu.requestAdapter())
        }
    }

    static getErrorMessage() {
        // TODO: add error message element (see WebGPU.js on threejs github)
    }
}