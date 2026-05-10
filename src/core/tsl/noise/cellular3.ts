import { dist, mod289v3, mod7, perm3 } from '@core/tsl/utils/math-utils.ts';
import { floor, Fn, fract, vec3, min, max, select, sqrt } from 'three/tsl';
import { type Node } from 'three/webgpu';

// Transpiled (GLSL) from Stefan Gustavson:
// https://github.com/stegu/webgl-noise
// ---
// Cellular noise ("Worley noise") in 3D in GLSL.
// Copyright (c) Stefan Gustavson 2011-04-19. All rights reserved.
// This code is released under the conditions of the MIT license.
// See LICENSE file for details.
// https://github.com/stegu/webgl-noise

// Cellular noise, returning F1 and F2 in a vec2.
// 3x3x3 search region for good F2 everywhere, but a lot
// slower than the 2x2x2 version.
// The code below is a bit scary even to its author,
// but it has at least half decent performance on a
// modern GPU. In any case, it beats any software
// implementation of Worley noise hands down.

export const cellular3 = /*@__PURE__*/ Fn(
  ([P, jitter]: [Node<'vec3'>, Node<'float'>]) => {
    const K = vec3(0.142857142857).toVar('K'); // 1/7
    const Ko = vec3(0.428571428571).toVar('Ko'); // 1/2-K/2
    const K2 = vec3(0.020408163265306).toVar('K2'); // 1/(7*7)
    const Kz = vec3(0.166666666667).toVar('Kz'); // 1/6
    const Kzo = vec3(0.416666666667).toVar('Kzo'); // 1/2-1/6*2

    const Pi = mod289v3(floor(P)).toVar('Pi');
    const Pf = fract(P).sub(0.5).toVar('Pf');
    const Pfx = Pf.x.add(vec3(1, 0, -1)).toVar('Pfx');
    const Pfy = Pf.y.add(vec3(1, 0, -1)).toVar('Pfy');
    const Pfz = Pf.z.add(vec3(1, 0, -1)).toVar('Pfz');
    const p = perm3(Pi.x.add(vec3(-1, 0, 1))).toVar('p');
    const p1 = perm3(p.add(Pi.y).sub(1)).toVar('p1');
    const p2 = perm3(p.add(Pi.y)).toVar('p2');
    const p3 = perm3(p.add(Pi.y).add(1)).toVar('p3');
    const p11 = perm3(p1.add(Pi.z).sub(1)).toVar('p11');
    const p12 = perm3(p1.add(Pi.z)).toVar('p12');
    const p13 = perm3(p1.add(Pi.z).add(1)).toVar('p13');
    const p21 = perm3(p2.add(Pi.z).sub(1)).toVar('p21');
    const p22 = perm3(p2.add(Pi.z)).toVar('p22');
    const p23 = perm3(p2.add(Pi.z).add(1)).toVar('p23');
    const p31 = perm3(p3.add(Pi.z).sub(1)).toVar('p31');
    const p32 = perm3(p3.add(Pi.z)).toVar('p32');
    const p33 = perm3(p3.add(Pi.z).add(1)).toVar('p33');
    const ox11 = vec3(fract(p11.mul(K)).sub(Ko)).toVar('ox11');
    const oy11 = vec3(
      mod7(floor(p11.mul(K)))
        .mul(K)
        .sub(Ko),
    ).toVar('oy11');
    const oz11 = vec3(floor(p11.mul(K2)).mul(Kz).sub(Kzo)).toVar('oz11');

    // p11 < 289 guaranteed

    const ox12 = fract(p12.mul(K)).sub(Ko).toVar('ox12');
    const oy12 = mod7(floor(p12.mul(K)))
      .mul(K)
      .sub(Ko)
      .toVar('oy12');
    const oz12 = floor(p12.mul(K2)).mul(Kz).sub(Kzo).toVar('oz12');
    const ox13 = fract(p13.mul(K)).sub(Ko).toVar('ox13');
    const oy13 = mod7(floor(p13.mul(K)))
      .mul(K)
      .sub(Ko)
      .toVar('oy13');
    const oz13 = floor(p13.mul(K2)).mul(Kz).sub(Kzo).toVar('oz13');
    const ox21 = fract(p21.mul(K)).sub(Ko).toVar('ox21');
    const oy21 = mod7(floor(p21.mul(K)))
      .mul(K)
      .sub(Ko)
      .toVar('oy21');
    const oz21 = floor(p21.mul(K2)).mul(Kz).sub(Kzo).toVar('oz21');
    const ox22 = fract(p22.mul(K)).sub(Ko).toVar('ox22');
    const oy22 = mod7(floor(p22.mul(K)))
      .mul(K)
      .sub(Ko)
      .toVar('oy22');
    const oz22 = floor(p22.mul(K2)).mul(Kz).sub(Kzo).toVar('oz22');
    const ox23 = fract(p23.mul(K)).sub(Ko).toVar('ox23');
    const oy23 = mod7(floor(p23.mul(K)))
      .mul(K)
      .sub(Ko)
      .toVar('oy23');
    const oz23 = floor(p23.mul(K2)).mul(Kz).sub(Kzo).toVar('oz23');
    const ox31 = fract(p31.mul(K)).sub(Ko).toVar('ox31');
    const oy31 = mod7(floor(p31.mul(K)))
      .mul(K)
      .sub(Ko)
      .toVar('oy31');
    const oz31 = floor(p31.mul(K2)).mul(Kz).sub(Kzo).toVar('oz31');
    const ox32 = fract(p32.mul(K)).sub(Ko).toVar('ox32');
    const oy32 = mod7(floor(p32.mul(K)))
      .mul(K)
      .sub(Ko)
      .toVar('oy32');
    const oz32 = floor(p32.mul(K2)).mul(Kz).sub(Kzo).toVar('oz32');
    const ox33 = fract(p33.mul(K)).sub(Ko).toVar('ox33');
    const oy33 = mod7(floor(p33.mul(K)))
      .mul(K)
      .sub(Ko)
      .toVar('oy33');
    const oz33 = floor(p33.mul(K2)).mul(Kz).sub(Kzo).toVar('oz33');

    const dx11 = Pfx.add(jitter.mul(ox11)).toVar('dx11');
    const dy11 = Pfy.x.add(jitter.mul(oy11)).toVar('dy11');
    const dz11 = Pfz.x.add(jitter.mul(oz11)).toVar('dz11');
    const dx12 = Pfx.add(jitter.mul(ox12)).toVar('dx12');
    const dy12 = Pfy.x.add(jitter.mul(oy12)).toVar('dy12');
    const dz12 = Pfz.y.add(jitter.mul(oz12)).toVar('dz12');
    const dx13 = Pfx.add(jitter.mul(ox13)).toVar('dx13');
    const dy13 = Pfy.x.add(jitter.mul(oy13)).toVar('dy13');
    const dz13 = Pfz.z.add(jitter.mul(oz13)).toVar('dz13');
    const dx21 = Pfx.add(jitter.mul(ox21)).toVar('dx21');
    const dy21 = Pfy.y.add(jitter.mul(oy21)).toVar('dy21');
    const dz21 = Pfz.x.add(jitter.mul(oz21)).toVar('dz21');
    const dx22 = Pfx.add(jitter.mul(ox22)).toVar('dx22');
    const dy22 = Pfy.y.add(jitter.mul(oy22)).toVar('dy22');
    const dz22 = Pfz.y.add(jitter.mul(oz22)).toVar('dz22');
    const dx23 = Pfx.add(jitter.mul(ox23)).toVar('dx23');
    const dy23 = Pfy.y.add(jitter.mul(oy23)).toVar('dy23');
    const dz23 = Pfz.z.add(jitter.mul(oz23)).toVar('dz23');
    const dx31 = Pfx.add(jitter.mul(ox31)).toVar('dx31');
    const dy31 = Pfy.z.add(jitter.mul(oy31)).toVar('dy31');
    const dz31 = Pfz.x.add(jitter.mul(oz31)).toVar('dz31');
    const dx32 = Pfx.add(jitter.mul(ox32)).toVar('dx32');
    const dy32 = Pfy.z.add(jitter.mul(oy32)).toVar('dy32');
    const dz32 = Pfz.y.add(jitter.mul(oz32)).toVar('dz32');
    const dx33 = Pfx.add(jitter.mul(ox33)).toVar('dx33');
    const dy33 = Pfy.z.add(jitter.mul(oy33)).toVar('dy33');
    const dz33 = Pfz.z.add(jitter.mul(oz33)).toVar('dz33');
    const d11 = dist(dx11, dy11, dz11).toVar('d11');
    const d12 = dist(dx12, dy12, dz12).toVar('d12');
    const d13 = dist(dx13, dy13, dz13).toVar('d13');
    const d21 = dist(dx21, dy21, dz21).toVar('d21');
    const d22 = dist(dx22, dy22, dz22).toVar('d22');
    const d23 = dist(dx23, dy23, dz23).toVar('d23');
    const d31 = dist(dx31, dy31, dz31).toVar('d31');
    const d32 = dist(dx32, dy32, dz32).toVar('d32');
    const d33 = dist(dx33, dy33, dz33).toVar('d33');

    // Do it right and sort out both F1 and F2

    const d1a = min(d11, d12).toVar('d1a');
    d12.assign(max(d11, d12));
    d11.assign(min(d1a, d13));
    d13.assign(max(d1a, d13));
    d12.assign(min(d12, d13));

    const d2a = min(d21, d22).toVar('d2a');
    d22.assign(max(d21, d22));
    d21.assign(min(d2a, d23));
    d23.assign(max(d2a, d23));
    d22.assign(min(d22, d23));

    const d3a = min(d31, d32).toVar('d3a');
    d32.assign(max(d31, d32));
    d31.assign(min(d3a, d33));
    d33.assign(max(d3a, d33));
    d32.assign(min(d32, d33));

    const da = min(d11, d21).toVar('da');
    d21.assign(max(d11, d21));
    d11.assign(min(da, d31));
    d31.assign(max(da, d31));
    d11.xy.assign(select(d11.x.lessThan(d11.y), d11.xy, d11.yx));
    d11.xz.assign(select(d11.x.lessThan(d11.z), d11.xz, d11.zx));
    d12.assign(min(d12, d21));
    d12.assign(min(d12, d22));
    d12.assign(min(d12, d31));
    d12.assign(min(d12, d32));
    d11.yz.assign(min(d11.yz, d12.xy));
    d11.y.assign(min(d11.y, d12.z));
    d11.y.assign(min(d11.y, d11.z));
    // @ts-expect-error borked typedefs
    return sqrt(d11.xy);
  },
  { P: 'vec3', return: 'vec2' },
).setLayout({
  name: 'LG_NOISE_cellular3',
  type: 'vec2',
  inputs: [
    { name: 'P', type: 'vec3' },
    { name: 'jitter', type: 'float' },
  ],
});