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