// LWD function chunk (Layer-Warp-Displace)

vec3 _displace(vec3 vPos, DisplacementParameters displacement) {
    float eps = displacement.eps;
    float mul = displacement.mul;

    float n1 = fbm3(vec3(vPos.x + eps, vPos.y, vPos.z), displacement.freq, displacement.amp, displacement.lac, displacement.oct);
    float n2 = fbm3(vec3(vPos.x - eps, vPos.y, vPos.z), displacement.freq, displacement.amp, displacement.lac, displacement.oct);
    float dx = (n1 - n2) / (mul * eps);

    n1 = fbm3(vec3(vPos.x, vPos.y + eps, vPos.z), displacement.freq, displacement.amp, displacement.lac, displacement.oct);
    n2 = fbm3(vec3(vPos.x, vPos.y - eps, vPos.z), displacement.freq, displacement.amp, displacement.lac, displacement.oct);
    float dy = (n1 - n2) / (mul * eps);

    n1 = fbm3(vec3(vPos.x, vPos.y, vPos.z + eps), displacement.freq, displacement.amp, displacement.lac, displacement.oct);
    n2 = fbm3(vec3(vPos.x, vPos.y, vPos.z - eps), displacement.freq, displacement.amp, displacement.lac, displacement.oct);
    float dz = (n1 - n2) / (mul * eps);

    //Curl
    return mix(vPos, vec3(dx, dy, dz), displacement.fac);
}

float compute_layering(vec3 vPos, NoiseParameters noise) {
  // Note: 1 layer = standard heightmap, 2+ layers applies domain-warping
  float height = fbm3(vPos, noise.freq, noise.amp, noise.lac, noise.oct);
  height = mix(height, fbm1(height, noise.freq, noise.amp, noise.lac, noise.oct), clamp(float(noise.layers) - 1.0, 0.0, 1.0));
  height = mix(height, fbm1(height, noise.freq, noise.amp, noise.lac, noise.oct), clamp(float(noise.layers) - 2.0, 0.0, 1.0));
  return height;
}

vec3 compute_warping(vec3 vPos, vec3 warp, bool enableWarping) {
  vPos.x *= mix(1.0, warp.x, float(enableWarping));
  vPos.y *= mix(1.0, warp.y, float(enableWarping));
  vPos.z *= mix(1.0, warp.z, float(enableWarping));
  return vPos;
}

vec3 compute_displacement(vec3 vPos, DisplacementParameters displacement, bool enableDisplacement) {
  vPos = mix(vPos, _displace(vPos, displacement), float(enableDisplacement));
  return vPos;
}