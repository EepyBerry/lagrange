// Modified from Visionary 3D's code:
// https://www.youtube.com/watch?v=Ydu4epKEM3I
vec3 color_ramp(vec3 colors[16], float positions[16], int ramp_size, float fac) {
  int MAX_ITERATIONS = min(ramp_size, 16);
  int pos_idx = 0;
  for (int i = 1; i < MAX_ITERATIONS-1; ++i) {
		bool isBetween = positions[i] <= fac;
    pos_idx = isBetween ? i : pos_idx;
	}
  float range = positions[pos_idx + 1] - positions[pos_idx];
  float lerpFac = (fac - positions[pos_idx]) / range;
  return mix(colors[pos_idx], colors[pos_idx+1], lerpFac);
}

// From: https://www.reddit.com/r/opengl/comments/6nghtj/glsl_mix_implementation_incorrect/
vec3 srgb_to_linear(vec3 color) {
  return pow(color, vec3(2.2));
}

// From: https://www.reddit.com/r/opengl/comments/6nghtj/glsl_mix_implementation_incorrect/
vec3 linear_to_srgb(vec3 color) {
  return pow(color, vec3(1.0/2.2));
}