#ifdef GL_ES
precision highp float;
#endif

// Packed varyings (uv, position, tangent, bitangent)
in mat4 vTransform;

uniform float u_inner_radius;
uniform float u_outer_radius;
uniform sampler2D u_ring_tex;

float rangeClamp(float v, float min, float max) {
  return (v - min) / (max - min);
}

void main() {
  float distanceToCenter = length(vTransform[1].xy);
  float fac = rangeClamp(distanceToCenter, u_inner_radius, u_outer_radius);
  csm_DiffuseColor = texture2D(u_ring_tex, vec2(fac, 0.5));
}