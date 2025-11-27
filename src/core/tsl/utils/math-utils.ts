import { Fn, type ShaderNodeObject, int } from 'three/tsl'
import type { Node } from 'three/webgpu'

export function getMatrixElement(matrix: ShaderNodeObject<Node>, x: number, y: number): ShaderNodeObject<Node> {
  return matrix.element(int(x)).element(int(y))
}
