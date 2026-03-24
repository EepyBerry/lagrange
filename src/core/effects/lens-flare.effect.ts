import { MESH_NAME_PLANET, MESH_NAME_RING_ANCHOR } from '../globals';
import { damp } from 'three/src/math/MathUtils.js';
import {
  Camera,
  Mesh,
  PlaneGeometry,
  Raycaster,
  Scene,
  Timer,
  Vector2,
  Vector3,
  Vector4,
  type Intersection,
  type NodeMaterial,
  type WebGPURenderer,
} from 'three/webgpu';
import {
  LensFlareTSLMaterial,
  type LensFlareData,
  type LensFlareUniforms,
} from '@core/tsl/materials/lens-flare.tslmat';

/**
 * Custom class that contains all the processing required to create lens flares.
 *
 * Based on Anderson Mancini's code: https://github.com/ektogamat/lensflare-threejs-vanilla
 */
export class LensFlareEffect {
  private _parameters: LensFlareData;
  private _tslMaterial: LensFlareTSLMaterial;
  private _mesh: Mesh;
  private _uniforms: LensFlareUniforms;

  private _internalOpacity: number;
  private _viewport: Vector4;
  private _flarePosition: Vector3;
  private _raycaster: Raycaster;

  constructor(data: LensFlareData) {
    this._internalOpacity = 1;
    this._viewport = new Vector4();
    this._flarePosition = new Vector3();
    this._raycaster = new Raycaster();

    this._parameters = data;
    this._tslMaterial = new LensFlareTSLMaterial(data);
    this._uniforms = this._tslMaterial.uniforms;
    this._mesh = new Mesh(new PlaneGeometry(2, 2, 1, 1), this._tslMaterial.buildMaterial());
    this._mesh.frustumCulled = false;
  }

  private checkTransparency(intersects: Intersection[]) {
    if (intersects?.length === 0) {
      this._internalOpacity = 1;
      return;
    }

    const iObject = intersects[0].object as Mesh;
    const iMaterial = iObject.material as NodeMaterial;
    if (!iObject.visible) {
      this._internalOpacity = 1;
    } else {
      if (iMaterial.transparent && iMaterial.opacity < 0.98) {
        this._internalOpacity = 1 / (iMaterial.opacity * 10);
      } else {
        this._internalOpacity = iObject.userData.lens === 'no-occlusion' ? 1 : 0;
      }
    }
  }

  public update(renderer: WebGPURenderer, scene: Scene, camera: Camera, timer: Timer) {
    const dt = timer.getDelta();

    renderer.getViewport(this._viewport);
    this._mesh.lookAt(camera.position);
    this._tslMaterial.uniforms.resolution.value.x = this._viewport.z;
    this._tslMaterial.uniforms.resolution.value.y = this._viewport.w;

    const projectedPosition = this._parameters.lensPosition.clone();
    projectedPosition.project(camera);

    this._flarePosition.set(projectedPosition.x, projectedPosition.y, projectedPosition.z);
    if (this._flarePosition.z < 1) {
      this._tslMaterial.uniforms.lensPosition.value.x = this._flarePosition.x;
      this._tslMaterial.uniforms.lensPosition.value.y = this._flarePosition.y;
    }

    this._raycaster.setFromCamera(new Vector2(projectedPosition.x, projectedPosition.y), camera);

    const planet = scene.getObjectByName(MESH_NAME_PLANET);
    const rings = scene.getObjectByName(MESH_NAME_RING_ANCHOR)?.children;
    if (planet && rings) {
      const intersects = this._raycaster.intersectObjects([planet, ...rings], false);
      this.checkTransparency(intersects);
    }
    this._tslMaterial.uniforms.opacity.value = damp(
      this._tslMaterial.uniforms.opacity.value,
      this._internalOpacity,
      10,
      dt,
    );
  }

  public updatePosition(lensPosition: Vector3) {
    this._tslMaterial.uniforms.lensPosition.value.x = lensPosition.x;
    this._tslMaterial.uniforms.lensPosition.value.y = lensPosition.y;
    this._tslMaterial.uniforms.lensPosition.value.z = lensPosition.z;
  }

  public get mesh(): Mesh {
    return this._mesh;
  }

  public get uniforms(): LensFlareUniforms {
    return this._uniforms;
  }
}
