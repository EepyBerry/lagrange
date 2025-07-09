import * as THREE from 'three'
import { LG_NAME_PLANET, LG_NAME_RING_ANCHOR } from '../globals'
import vertexShader from '@assets/glsl/core/lens_flare.vert.glsl?raw'
import fragmentShader from '@assets/glsl/core/lens_flare.frag.glsl?raw'
import { damp } from 'three/src/math/MathUtils.js'
import { TEXTURE_LOADER } from './external-data.loader'
import type { WebGPURenderer } from 'three/webgpu'

export type LensFlareParams = {
  lensPosition: THREE.Vector3
  colorGain: THREE.Color
  starPoints: number
  starPointsIntensity: number
  glareSize: number
  glareIntensity: number
  flareSize: number
  flareShape: number
  ghostScale: number
  additionalStreaks: boolean
}

/**
 * Custom class that contains all the processing required to create lens flares.
 *
 * Based on Anderson Mancini's code: https://github.com/ektogamat/lensflare-threejs-vanilla
 */
export class LensFlareEffect {
  private _params: LensFlareParams
  private _material: THREE.ShaderMaterial
  private _mesh: THREE.Mesh

  private _internalOpacity: number
  private _viewport: THREE.Vector4
  private _flarePosition: THREE.Vector3
  private _raycaster: THREE.Raycaster

  constructor(params: Partial<LensFlareParams>) {
    this._params = {
      lensPosition: params.lensPosition ?? new THREE.Vector3(0),
      colorGain: params.colorGain ?? new THREE.Color(95, 12, 10),
      starPointsIntensity: params.starPointsIntensity ?? 0.25,
      starPoints: params.starPoints ?? 2,
      glareSize: params.glareSize ?? 0.025,
      glareIntensity: params.glareIntensity ?? 0.5,
      flareSize: params.flareSize ?? 0.001,
      flareShape: params.flareShape ?? 0.375,
      ghostScale: params.ghostScale ?? 0.15,
      additionalStreaks: params.additionalStreaks ?? false,
    }
    this._internalOpacity = 1
    this._viewport = new THREE.Vector4()
    this._flarePosition = new THREE.Vector3()
    this._raycaster = new THREE.Raycaster()

    this._material = this.initMaterial()
    this._mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 1, 1), this._material)
    this._mesh.frustumCulled = false
  }

  private initMaterial(): THREE.ShaderMaterial {
    const lensFlareMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        lensPosition: { value: this._params.lensPosition.clone() },
        opacity: { value: this._internalOpacity },
        colorGain: { value: this._params.colorGain },
        starPoints: { value: this._params.starPoints },
        starPointsIntensity: { value: this._params.starPointsIntensity },
        glareSize: { value: this._params.glareSize },
        glareIntensity: { value: this._params.glareIntensity },
        flareSize: { value: this._params.flareSize },
        flareShape: { value: this._params.flareShape },
        ghostScale: { value: this._params.ghostScale },
        additionalStreaks: { value: this._params.additionalStreaks },
      },
      fragmentShader,
      vertexShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      name: 'LensFlareShader',
    })
    return lensFlareMaterial
  }

  private checkTransparency(intersects: THREE.Intersection[]) {
    if (intersects?.length === 0) {
      this._internalOpacity = 1
      return
    }

    const iObject = intersects[0].object as THREE.Mesh
    const iMaterial = iObject.material as THREE.Material
    if (!iObject.visible) {
      this._internalOpacity = 1
    } else if (iMaterial instanceof THREE.MeshPhysicalMaterial) {
      this._internalOpacity = (iMaterial.transmission * 0.5)
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
    this._material.uniforms.iResolution.value.set(this._viewport.z, this._viewport.w)

    const projectedPosition = this._params.lensPosition.clone()
    projectedPosition.project(camera)

    this._flarePosition.set(projectedPosition.x, projectedPosition.y, projectedPosition.z)
    if (this._flarePosition.z < 1) {
      this._material.uniforms.lensPosition.value.set(this._flarePosition.x, this._flarePosition.y)
    }

    this._raycaster.setFromCamera(new THREE.Vector2(projectedPosition.x, projectedPosition.y), camera)

    const planet = scene.getObjectByName(LG_NAME_PLANET)
    const rings = scene.getObjectByName(LG_NAME_RING_ANCHOR)?.children
    if (planet && rings) {
      const intersects = this._raycaster.intersectObjects([planet, ...rings], false)
      this.checkTransparency(intersects)
    }
    this._material.uniforms.iTime.value += dt
    this._material.uniforms.opacity.value = damp(this._material.uniforms.opacity.value, this._internalOpacity, 10, dt)
  }

  public updatePosition(lensPosition: THREE.Vector3) {
    this.material.uniforms['lensPosition'].value.set(lensPosition.x, lensPosition.y, lensPosition.z)
  }

  public get mesh(): THREE.Mesh {
    return this._mesh
  }
  public get material(): THREE.ShaderMaterial {
    return this._material
  }
}
