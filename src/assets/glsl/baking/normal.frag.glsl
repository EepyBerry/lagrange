#ifdef GL_ES
precision highp float;
#endif

// Bump-map texture
uniform float u_scale;
uniform float u_resolution;
uniform sampler2D u_bump_tex;

// Packed varyings (uv, position)
in vec2 vUv;

void main() {
  // Sample neighbouring heights
  vec3 offset = vec3(-1.0/u_resolution, 0.0, 1.0/u_resolution);
  float s00 = texture(u_bump_tex, vUv + offset.xx).x;
  float s10 = texture(u_bump_tex, vUv + offset.yx).x;
  float s20 = texture(u_bump_tex, vUv + offset.zx).x;
  float s01 = texture(u_bump_tex, vUv + offset.xy).x;
  float s21 = texture(u_bump_tex, vUv + offset.zy).x;
  float s02 = texture(u_bump_tex, vUv + offset.xz).x;
  float s12 = texture(u_bump_tex, vUv + offset.yz).x;
  float s22 = texture(u_bump_tex, vUv + offset.zz).x;

  // Calculate normal using Sobel filter
  vec3 N = normalize(vec3(
    u_scale * +(s00 - s20 + 2.0*s01 - 2.0*s21 + s02 - s22),
    u_scale * -(s00 + 2.0*s10 + s20 - s02 - 2.0*s12 - s22),
    1.0
  )) * 0.5 + 0.5;

  // Set outputs
  gl_FragColor = vec4(N, 1.0);
}