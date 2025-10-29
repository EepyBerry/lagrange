/**
 * Patchworked threejs class to check WebGPU capabilities
 * @see https://github.com/mrdoob/three.js/blob/4342d10ea73aa3cea3dcddd4973a6521dda8d5e8/examples/jsm/capabilities/WebGPU.js#L4
 */
export default class WebGPUPatchwork {
    private static _hasBeenRequested: boolean = false;
    private static _isAvailable: boolean = false;

    static async isAvailable(forceCheck: boolean = false) {
        if (this._hasBeenRequested && !forceCheck) {
            return this._isAvailable;
        }

        this._isAvailable = (typeof navigator !== 'undefined' && navigator.gpu !== undefined);
        if (typeof window !== 'undefined' && this._isAvailable) {
            this._isAvailable = Boolean(await navigator.gpu.requestAdapter());
        }
        this._hasBeenRequested = true;
    }

    static getErrorMessage(): HTMLDivElement {
        const message = 'Your browser does not support <a href="https://gpuweb.github.io/gpuweb/" style="color:blue">WebGPU</a> yet';
		const element = document.createElement('div');
		element.id = 'webgpumessage';
		element.style.fontFamily = 'monospace';
		element.style.fontSize = '13px';
		element.style.fontWeight = 'normal';
		element.style.textAlign = 'center';
		element.style.background = '#fff';
		element.style.color = '#000';
		element.style.padding = '1.5em';
		element.style.maxWidth = '400px';
		element.style.margin = '5em auto 0';
		element.innerHTML = message;
		return element;
    }
}