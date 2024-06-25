import type { PerspectiveCamera, Scene, WebGLRenderer } from "three"

export class SceneElements {
    private _scene: Scene
    private _renderer: WebGLRenderer
    private _camera: PerspectiveCamera
  
    public get scene(): Scene {
      return this._scene
    }
    public get renderer(): WebGLRenderer {
      return this._renderer
    }
    public get camera(): PerspectiveCamera {
      return this._camera
    }
  
    constructor(scene: Scene, renderer: WebGLRenderer, camera: PerspectiveCamera) {
      this._scene = scene
      this._renderer = renderer
      this._camera = camera
    }
  }
  