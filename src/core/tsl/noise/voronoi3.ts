import { hash3 } from '@tsl/utils/hash.tsl.ts';
import { floor, Fn, If, vec3, min, float, int, Loop, dot, normalize, ivec3 } from 'three/tsl';
import { type Node } from 'three/webgpu';

// Transpiled (HLSL) from Blender's source code:
// https://github.com/blender/blender/blob/main/intern/cycles/kernel/svm/voronoi.h#L597
// ---
// This code is available under the GNU General Public License v3.0
// https://download.blender.org/release/GPL3-license.txt

export const voronoi3 = /*@__PURE__*/ Fn(
  ([p_pos, p_jitter, p_mode]: [Node<'vec3'>, Node<'float'>, Node<'float'>]) => {
    const pos = vec3(p_pos).toVar('p_pos');
    const jitter = vec3(p_jitter).toVar('p_jitter');
    const mode = float(p_mode).toVar('p_mode');

    const cellPos = ivec3(floor(pos)).toVar('cellPos');
    const localPos = vec3(pos.sub(cellPos.toVec3())).toVar('localPos');

    const cellOffset = vec3(0).toVar('cellOffset');
    const vectorToPoint = vec3(0).toVar('vectorToPoint');
    const vectorToClosest = vec3(0).toVar('vectorToClosest');
    const distanceToPoint = float(0).toVar('distanceToPoint');
    const minDistance = float(8).toVar('minDistance');

    // first pass: standard voronoi
    // @ts-expect-error borked typedefs
    Loop({ start: int(-1), end: 1, name: 'k', condition: '<=' }, ({ k }: { k: Node<'int'> }) => {
      // @ts-expect-error borked typedefs
      Loop({ start: int(-1), end: 1, name: 'j', condition: '<=' }, ({ j }: { j: Node<'int'> }) => {
        // @ts-expect-error borked typedefs
        Loop({ start: int(-1), end: 1, name: 'i', condition: '<=' }, ({ i }: { i: Node<'int'> }) => {
          cellOffset.assign(vec3(i, j, k));
          vectorToPoint.assign(cellOffset.add(hash3(cellPos.add(cellOffset.toIVec3())).mul(jitter)).sub(localPos));
          distanceToPoint.assign(dot(vectorToPoint, vectorToPoint));
          If(distanceToPoint.lessThan(minDistance), () => {
            minDistance.assign(distanceToPoint);
            vectorToClosest.assign(vectorToPoint);
          });
        });
      });
    });

    // second pass (optional): distance to edge
    If(mode.greaterThan(0.5), () => {
      const distanceToEdge = float(0.0).toVar('distanceToEdge');
      const perpendicularToEdge = vec3(0.0).toVar('perpendicularToEdge');
      minDistance.assign(8.0);
      // @ts-expect-error borked typedefs
      Loop({ start: int(-1), end: 1, name: 'k', condition: '<=' }, ({ k }: { k: Node<'int'> }) => {
        // @ts-expect-error borked typedefs
        Loop({ start: int(-1), end: 1, name: 'j', condition: '<=' }, ({ j }: { j: Node<'int'> }) => {
          // @ts-expect-error borked typedefs
          Loop({ start: int(-1), end: 1, name: 'i', condition: '<=' }, ({ i }: { i: Node<'int'> }) => {
            cellOffset.assign(vec3(i, j, k));
            vectorToPoint.assign(cellOffset.add(hash3(cellPos.add(cellOffset.toIVec3())).mul(jitter)).sub(localPos));
            perpendicularToEdge.assign(vectorToPoint.sub(vectorToClosest));
            If(dot(perpendicularToEdge, perpendicularToEdge).greaterThan(0.0001), () => {
              distanceToEdge.assign(dot(vectorToClosest.add(vectorToPoint).mul(0.5), normalize(perpendicularToEdge)));
              minDistance.assign(min(minDistance, distanceToEdge));
            });
          });
        });
      });
    });

    return minDistance;
  },
  {
    P: 'vec3',
    return: 'float',
  },
).setLayout({
  name: 'LG_NOISE_voronoi3',
  type: 'float',
  inputs: [
    { name: 'P', type: 'vec3' },
    { name: 'jitter', type: 'float' },
    { name: 'mode', type: 'float' },
  ],
});
