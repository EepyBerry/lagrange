// Temperature function
float compute_temperature(vec3 vPos, NoiseParameters noise) {
  float FLAG_POLAR = step(0.5, float(noise.mode));
  float FLAG_NOISE = step(1.5, float(noise.mode));
  float ty = mix(abs(vPos.y), vPos.y, FLAG_POLAR);
  float adjustedTy = smoothstep(1.0, -FLAG_POLAR, ty);
  float tHeight = mix(adjustedTy, 1.0, FLAG_NOISE);
  return tHeight * fbm3(vPos, noise.freq, noise.amp, noise.lac, noise.oct);
}

// Humidity function
float compute_humidity(vec3 vPos, NoiseParameters noise) {
  float FLAG_POLAR = step(0.5, float(noise.mode));
  float FLAG_NOISE = step(1.5, float(noise.mode));
  float hy = mix(abs(vPos.y), vPos.y, FLAG_POLAR);
  float adjustedHy = smoothstep(-FLAG_POLAR, 1.0, hy);
  float hHeight = mix(adjustedHy, 1.0, FLAG_NOISE);
  return hHeight * fbm3(vPos, noise.freq, noise.amp, noise.lac, noise.oct);
}