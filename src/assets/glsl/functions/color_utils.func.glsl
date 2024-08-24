// Modified from Visionary 3D's code:
// https://www.youtube.com/watch?v=Ydu4epKEM3I
// ------------------------------------------------------------------------------------------------

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

vec4 blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.411764705882353) * direction;
  vec2 off2 = vec2(3.2941176470588234) * direction;
  vec2 off3 = vec2(5.176470588235294) * direction;
  color += texture2D(image, uv) * 0.1964825501511404;
  color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;
  color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;
  color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;
  color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;
  color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;
  color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;
  return color;
}

// ------------------------------------------------------------------------------------------------

mat4 tint_to_matrix(vec4 tint) {
  return mat4(
    vec4(tint.x, 0.0,    0.0,    0.0),
    vec4(0.0,    tint.y, 0.0,    0.0),
    vec4(0.0,    0.0,    tint.z, 0.0),
    vec4(0.0,    0.0,    0.0,    tint.w)
  );
}

vec4 greyscale(vec4 color) {
  return color * mat4(
    vec4(0.2126, 0.7152, 0.0722, 0.0),
    vec4(0.2126, 0.7152, 0.0722, 0.0),
    vec4(0.2126, 0.7152, 0.0722, 0.0),
    vec4(0.0,    0.0,    0.0,    1.0)
  );
}

// basically greyscale but cranked to white
vec4 whitescale(vec4 color) {
  return greyscale(color) * 2.0;
}

// From: https://gist.github.com/mairod/a75e7b44f68110e1576d77419d608786?permalink_comment_id=3195243#gistcomment-3195243
vec3 hue_shift(vec3 color, float dhue) {
  float s = sin(dhue);
	float c = cos(dhue);
	return (color * c) + (color * s) * mat3(
		vec3(0.167444, 0.329213, -0.496657),
		vec3(-0.327948, 0.035669, 0.292279),
		vec3(1.250268, -1.047561, -0.202707)
	) + dot(vec3(0.299, 0.587, 0.114), color) * (1.0 - c);
}

// From: https://www.reddit.com/r/opengl/comments/6nghtj/glsl_mix_implementation_incorrect/
vec3 srgb_to_linear(vec3 color) {
  return pow(color, vec3(2.2));
}

// From: https://www.reddit.com/r/opengl/comments/6nghtj/glsl_mix_implementation_incorrect/
vec3 linear_to_srgb(vec3 color) {
  return pow(color, vec3(1.0/2.2));
}