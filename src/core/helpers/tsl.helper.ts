import type { ShaderNodeObject } from "three/tsl";
import type { MeshStandardNodeMaterial, Node } from "three/webgpu";

export type TSLFnParams = ShaderNodeObject<Node>[]

export interface TSLVertexShader {
  runVertex(mat: MeshStandardNodeMaterial): void
}
export interface TSLFragmentShader {
  runFragment(mat: MeshStandardNodeMaterial): void
}