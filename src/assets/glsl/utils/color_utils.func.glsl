// © 2024 EepyBerry
// Modified from Visionary 3D's code (yt)

vec3 color_ramp(vec3 colors[8], float positions[8], int ramp_size, float fac) {
  int MAX_ITERATIONS = min(ramp_size, 8);
  int pos_idx = 0;
  for (int i = 1; i < MAX_ITERATIONS-1; ++i) {
		bool isBetween = positions[i] <= fac;
    pos_idx = isBetween ? i : pos_idx;
	}
  float range = positions[pos_idx + 1] - positions[pos_idx];
  float lerpFac = (fac - positions[pos_idx]) / range;
  return mix(colors[pos_idx], colors[pos_idx+1], lerpFac);
}