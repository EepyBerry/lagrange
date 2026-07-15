import { CubeTextureLoader, NearestFilter, Scene, type MinificationTextureFilter } from "three";

const CUBE_TEXTURE_LOADER = new CubeTextureLoader();

export function loadCubeTextureSkybox(scene: Scene, path: string, filter?: MinificationTextureFilter) {
  const cubemap = CUBE_TEXTURE_LOADER.setPath(path).load([
    "right.png",
    "left.png",
    "top.png",
    "bottom.png",
    "front.png",
    "back.png",
  ]);
  cubemap.minFilter = filter ?? NearestFilter;
  scene.background = cubemap;
}
