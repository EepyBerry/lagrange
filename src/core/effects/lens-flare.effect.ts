import * as THREE from 'three'
import { LG_NAME_PLANET, LG_NAME_RING_ANCHOR } from '../globals'
import { damp } from 'three/src/math/MathUtils.js'
import { type NodeMaterial, type WebGPURenderer } from 'three/webgpu'
import { LensFlareTSLMaterial, type LensFlareData, type LensFlareUniforms } from '@/core/tsl/materials/lens-flare.tslmat'

/**
 * Custom class that contains all the processing required to create lens flares.
 *
 * Based on Anderson Mancini's code: https://github.com/ektogamat/lensflare-threejs-vanilla
 */
export class LensFlareEffect {
  private _parameters: LensFlareData
  private _tslMaterial: LensFlareTSLMaterial
  private _mesh: THREE.Mesh
  private _uniforms: LensFlareUniforms

  private _internalOpacity: number
  private _viewport: THREE.Vector4
  private _flarePosition: THREE.Vector3
  private _raycaster: THREE.Raycaster

  constructor(data: LensFlareData) {
    this._internalOpacity = 1
    this._viewport = new THREE.Vector4()
    this._flarePosition = new THREE.Vector3()
    this._raycaster = new THREE.Raycaster()

    this._parameters = data
    this._tslMaterial = new LensFlareTSLMaterial(data)
    this._mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 1, 1), this._tslMaterial.buildMaterial())
    this._mesh.frustumCulled = false
    this._uniforms = this._tslMaterial.uniforms
  }

  private checkTransparency(intersects: THREE.Intersection[]) {
    if (intersects?.length === 0) {
      this._internalOpacity = 1
      return
    }

    const iObject = intersects[0].object as THREE.Mesh
    const iMaterial = iObject.material as NodeMaterial
    if (!iObject.visible) {
      this._internalOpacity = 1
    } else {
      if (iMaterial.transparent && iMaterial.opacity < 0.98) {
        this._internalOpacity = 1 / (iMaterial.opacity * 10)
      } else {
        this._internalOpacity = iObject.userData.lens === 'no-occlusion' ? 1 : 0
      }
    }
  }

  public update(renderer: WebGPURenderer, scene: THREE.Scene, camera: THREE.Camera, clock: THREE.Clock) {
    const dt = clock.getDelta()

    renderer.getViewport(this._viewport)
    this._mesh.lookAt(camera.position)
    this._tslMaterial.uniforms.resolution.value.x = this._viewport.z
    this._tslMaterial.uniforms.resolution.value.y = this._viewport.w

    const projectedPosition = this._parameters.lensPosition.clone()
    projectedPosition.project(camera)

    this._flarePosition.set(projectedPosition.x, projectedPosition.y, projectedPosition.z)
    if (this._flarePosition.z < 1) {
      this._tslMaterial.uniforms.lensPosition.value.x = this._flarePosition.x
      this._tslMaterial.uniforms.lensPosition.value.y = this._flarePosition.y
    }

    this._raycaster.setFromCamera(new THREE.Vector2(projectedPosition.x, projectedPosition.y), camera)

    const planet = scene.getObjectByName(LG_NAME_PLANET)
    const rings = scene.getObjectByName(LG_NAME_RING_ANCHOR)?.children
    if (planet && rings) {
      const intersects = this._raycaster.intersectObjects([planet, ...rings], false)
      this.checkTransparency(intersects)
    }
    this._tslMaterial.uniforms.opacity.value = damp(this._tslMaterial.uniforms.opacity.value, this._internalOpacity, 10, dt)
  }

  public updatePosition(lensPosition: THREE.Vector3) {
    this._tslMaterial.uniforms.lensPosition.value.x = lensPosition.x
    this._tslMaterial.uniforms.lensPosition.value.y = lensPosition.y
    this._tslMaterial.uniforms.lensPosition.value.z = lensPosition.z
  }

  public get mesh(): THREE.Mesh {
    return this._mesh
  }
  
  public get uniforms(): LensFlareUniforms {
    return this._uniforms
  }
}
