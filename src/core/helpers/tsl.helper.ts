import type { ShaderNodeObject } from "three/tsl";
import type { MeshStandardNodeMaterial, Node } from "three/webgpu";

export type TSLFnParams = ShaderNodeObject<Node>[]

export interface TSLShader {
  run(mat: MeshStandardNodeMaterial): void
}