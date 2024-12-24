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
  // Sample neighbouring heights & compute diff vectors 
  float samplingOffset = 1.0/u_resolution;
  float height = texture2D(u_bump_tex, vUv).y;
  float dxHeight = texture2D(u_bump_tex, vUv + vec2(samplingOffset, 0.0)).y;
  float dyHeight = texture2D(u_bump_tex, vUv + vec2(0.0, samplingOffset)).y;
  vec2 dxy = height - vec2(dxHeight, dyHeight);

  // Calculate & scale normal
  vec3 N = normalize(vec3(dxy * u_scale / samplingOffset, 1.0));

  // Set outputs
  gl_FragColor = vec4(N, 1.0);
}