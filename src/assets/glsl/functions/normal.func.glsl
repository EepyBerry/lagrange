// Adjusted from dmmn
// https://www.shadertoy.com/view/MsScRt
// Note: licensed under CC BY-NC-SA 3.0 Unported license (see: normal.func.glsl_LICENSE)

// computes a normalmap using UV coordinates
vec3 compute_normalmap(float height, float dxHeight, float dyHeight, float stp, float scale) {
  vec2 dxy = height - vec2(dxHeight, dyHeight);
  return normalize(vec3(dxy * scale / stp, 1.0));
}