import { int } from 'three/tsl';
import type { Node } from 'three/webgpu';

export function getMatrixElement(matrix: Node<'mat2'|'mat3'|'mat4'>, x: number, y: number): Node<'float'> {
  return matrix.element(int(x)).element(int(y)) as Node<'float'>;
}
