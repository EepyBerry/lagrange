/**
 * Lens Flare by Anderson Mancini, refactoring for up-to-date threejs by EepyBerry
 * Based on: https://github.com/ektogamat/R3F-Ultimate-Lens-Flare
 */
import * as THREE from "three"
import { easing } from 'maath'
import { LG_NAME_PLANET } from "../globals"
import vertexShader from "./lens_flare.vert.glsl?raw"
import fragmentShader from "./lens_flare.frag.glsl?raw"

export type LensFlareParams = {
  enabled?: boolean
  lensPosition?: THREE.Vector3
  opacity?: number
  colorGain?: THREE.Color
  starPoints?: number
  glareSize?: number
  flareSize?: number
  flareSpeed?: number
  flareShape?: number
  haloScale?: number
  animated?: boolean
  anamorphic?: boolean
  secondaryGhosts?: boolean
  starBurst?: boolean
  ghostScale?: number
  additionalStreaks?: boolean
  lensDirtTexture?: THREE.Texture
}

/**
 * @param {Object} options
 * @param {Boolean | undefined} options.enabled Enable or disable the effect
 * @param {THREE.Vector3 | undefined} options.lensPosition The lens position in Vector3 format
 * @param {Number | undefined} options.opacity The opacity for this effect
 * @param {THREE.Color | undefined} options.colorGain The colorGain in RGB format
 * @param {Number | undefined} options.starPoints The integer number of star points
 * @param {Number | undefined} options.glareSize The float number of glare size
 * @param {Number | undefined} options.flareSize The float number of flare size
 * @param {Number | undefined} options.flareSpeed The float number of the flare animation speed. Set 0 to disable
 * @param {Number | undefined} options.flareShape The float number to define the flare shape. Higher number sharper
 * @param {Number | undefined} options.haloScale The float number to define the halo of startBurst scale
 * @param {Boolean | undefined} options.animated Enable or disable the flare rotation animation
 * @param {Boolean | undefined} options.anamorphic Enable or disable the anamorphic flare shape
 * @param {Boolean | undefined} options.secondaryGhosts Enable or disable the secondary ghosts
 * @param {Boolean | undefined} options.starBurst Enable or disable the star burst. Disable for better performance
 * @param {Number | undefined} options.ghostScale The float number of the ghosts scale
 * @param {Boolean | undefined} options.aditionalStreaks Enable or disable the aditional streaks
 * @param {Boolean | undefined} options.followMouse Enable or disable follow mouse lens flare
 */
export function LensFlareEffect(
  params: LensFlareParams,
  oldOpacityValue: { value: number }
) {
  const internalParams = {
    iTime: { value: 0 },
    iResolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight)
    },
    enabled: params.enabled ?? true,
    lensPosition: params.lensPosition ?? new THREE.Vector3(0),
    opacity: params.opacity ?? 1,
    colorGain: params.colorGain ?? new THREE.Color(95, 12, 10),
    starPoints: params.starPoints ?? 2,
    glareSize: params.glareSize ?? 0,
    flareSize: params.flareSize ?? 0.0015,
    flareSpeed: params.flareSpeed ?? 0,
    flareShape: params.flareShape ?? 0.5,
    haloScale: params.haloScale ?? 0,
    animated: params.animated ?? false,
    anamorphic: params.anamorphic ?? false,
    secondaryGhosts: params.secondaryGhosts ?? false,
    starBurst: params.starBurst ?? false,
    ghostScale: params.ghostScale ?? 0.15,
    additionalStreaks: params.additionalStreaks ?? false,
    lensDirtTexture: params.lensDirtTexture ?? new THREE.TextureLoader().load("assets/img/lens-Dirt-Texture.jpg")
  };

  const clock = new THREE.Clock();
  const screenPosition = internalParams.lensPosition;
  const viewport = new THREE.Vector4();
  const oldOpacity = oldOpacityValue;

  let internalOpacity = oldOpacity.value;
  const flarePosition = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();

  const lensFlareMaterial = new THREE.ShaderMaterial({
    uniforms: {
      iTime: { value: 0 },
      iResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight)
      },
      enabled: { value: internalParams.enabled },
      lensPosition: { value: internalParams.lensPosition.clone() },
      opacity: { value: internalOpacity },
      colorGain: { value: internalParams.colorGain },
      starPoints: { value: internalParams.starPoints },
      glareSize: { value: internalParams.glareSize },
      flareSize: { value: internalParams.flareSize },
      flareSpeed: { value: internalParams.flareSpeed },
      flareShape: { value: internalParams.flareShape },
      haloScale: { value: internalParams.haloScale },
      animated: { value: internalParams.animated },
      anamorphic: { value: internalParams.anamorphic },
      secondaryGhosts: { value: internalParams.secondaryGhosts },
      starBurst: { value: internalParams.starBurst },
      ghostScale: { value: internalParams.ghostScale },
      aditionalStreaks: { value: internalParams.additionalStreaks },
      lensDirtTexture: { value: internalParams.lensDirtTexture }
    },
    fragmentShader,
    vertexShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    name: "LensFlareShader"
  });

  /**
   * Transparency check
   */
  const checkTransparency = (intersects: THREE.Intersection[]) => {
    if (intersects?.length === 0) {
      internalOpacity = oldOpacity.value;
      return
    }

    for (const intersect of intersects) {
      const iObject = intersect.object as THREE.Mesh
      const iMaterial = iObject.material as THREE.Material
      if (!iObject.visible) {
        internalOpacity = oldOpacity.value;
      } else if (iMaterial instanceof THREE.MeshPhysicalMaterial) {
        internalOpacity = oldOpacity.value * (iMaterial.transmission * 0.5)
      } else {
        if (iMaterial.transparent && iMaterial.opacity < 0.98) {
          internalOpacity = oldOpacity.value / (iMaterial.opacity * 10)
        } else {
          internalOpacity = iObject.userData.lens === 'no-occlusion' ? oldOpacity.value : 0
        }
      }
    }
  }

  const lensFlareContainer = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 1, 1), lensFlareMaterial);
  lensFlareContainer.onBeforeRender = (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) => {
    const elapsedTime = clock.getElapsedTime();

    renderer.getCurrentViewport(viewport);
    lensFlareContainer.lookAt(camera.position);

    lensFlareMaterial.uniforms.iResolution.value.set(viewport.z, viewport.w);

    const projectedPosition = screenPosition.clone();
    projectedPosition.project(camera);

    flarePosition.set(projectedPosition.x, projectedPosition.y, projectedPosition.z);
    if (flarePosition.z < 1) {
      lensFlareMaterial.uniforms.lensPosition.value.set(flarePosition.x, flarePosition.y);
    }

    raycaster.setFromCamera(new THREE.Vector2(projectedPosition.x, projectedPosition.y), camera);
    const intersects = raycaster.intersectObjects([scene.getObjectByName(LG_NAME_PLANET)!], true);
    checkTransparency(intersects);

    lensFlareMaterial.uniforms.iTime.value = elapsedTime;
    easing.damp(lensFlareMaterial.uniforms.opacity, "value", internalOpacity, 0.005, clock.getDelta());
  };
  lensFlareContainer.frustumCulled = false
  return lensFlareContainer;
}