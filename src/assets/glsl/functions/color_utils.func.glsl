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

// From: https://gist.github.com/mairod/a75e7b44f68110e1576d77419d608786?permalink_comment_id=3195243#gistcomment-3195243
vec3 hue_shift(vec3 color, float hue) {
  const vec3 k = vec3(0.57735, 0.57735, 0.57735);
  float cosAngle = cos(hue);
  return vec3(color * cosAngle + cross(k, color) * sin(hue) + k * dot(k, color) * (1.0 - cosAngle));
}

// From: https://www.reddit.com/r/opengl/comments/6nghtj/glsl_mix_implementation_incorrect/
vec3 srgb_to_linear(vec3 color) {
  return pow(color, vec3(2.2));
}

// From: https://www.reddit.com/r/opengl/comments/6nghtj/glsl_mix_implementation_incorrect/
vec3 linear_to_srgb(vec3 color) {
  return pow(color, vec3(1.0/2.2));
}