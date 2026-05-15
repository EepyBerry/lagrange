import { Fn, float, mat3, mul, normalize, vec3 } from 'three/tsl';
import { Node, TextureNode } from 'three/webgpu';
import { getMatrixElement } from './math-utils';

export const sampleSobel = /*@__PURE__*/ Fn(
  ([i_texture, i_uv, i_offset]: [TextureNode, Node<'vec2'>, Node<'vec3'>]) => {
    const s00 = i_texture.sample(i_uv.add(i_offset.xx)).x.toVar('s00');
    const s01 = i_texture.sample(i_uv.add(i_offset.yx)).x.toVar('s10');
    const s02 = i_texture.sample(i_uv.add(i_offset.zx)).x.toVar('s20');
    const s10 = i_texture.sample(i_uv.add(i_offset.xy)).x.toVar('s01');
    const s12 = i_texture.sample(i_uv.add(i_offset.zy)).x.toVar('s21');
    const s20 = i_texture.sample(i_uv.add(i_offset.xz)).x.toVar('s02');
    const s21 = i_texture.sample(i_uv.add(i_offset.yz)).x.toVar('s12');
    const s22 = i_texture.sample(i_uv.add(i_offset.zz)).x.toVar('s22');
    return mat3(s00, s01, s02, s10, i_uv.x, s12, s20, s21, s22);
  },
);

export const sobel = /*@__PURE__*/ Fn(([i_heights, i_strength]: [Node<'mat3'>, Node<'float'>]) => {
  const scale = float(i_strength).toVar('scale');
  const heights = mat3(i_heights).toVar('heights');
  const sobelX = float(
    scale.mul(
      float(1).mul(
        getMatrixElement(heights, 0, 0)
          .sub(getMatrixElement(heights, 0, 2))
          .add(mul(2, getMatrixElement(heights, 1, 0)))
          .sub(mul(2, getMatrixElement(heights, 1, 2)))
          .add(getMatrixElement(heights, 2, 0))
          .sub(getMatrixElement(heights, 2, 2)),
      ),
    ),
  ).toVar('sobelX');
  const sobelY = float(
    scale.mul(
      float(-1).mul(
        getMatrixElement(heights, 0, 0)
          .add(mul(2, getMatrixElement(heights, 0, 1)))
          .add(getMatrixElement(heights, 0, 2))
          .sub(getMatrixElement(heights, 2, 0))
          .sub(mul(2, getMatrixElement(heights, 2, 1)))
          .sub(getMatrixElement(heights, 2, 2)),
      ),
    ),
  ).toVar('sobelY');
  return vec3(
    normalize(vec3(sobelX, sobelY, 1))
      .mul(0.5)
      .add(0.5),
  );
}).setLayout({
  name: 'LG_SOBEL_sobel',
  type: 'vec3',
  inputs: [
    { name: 'pHeights', type: 'mat3' },
    { name: 'pStrength', type: 'float' },
  ],
});
