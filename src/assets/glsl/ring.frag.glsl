#ifdef GL_ES
precision highp float;
#endif

const float RING_EDGE_BIAS = 0.01;

// Packed varyings (uv, position, tangent, bitangent)
in mat4 vTransform;

uniform float u_inner_radius;
uniform float u_outer_radius;
uniform sampler2D u_ring_tex;

float clamp_to_range(float v, float min, float max) {
  return (v - min) / (max - min);
}

void main() {
  float distanceToCenter = distance(vec2(0.0), vTransform[1].xy);
  float FLAG_WITHIN_RANGE = step(u_inner_radius - RING_EDGE_BIAS, distanceToCenter) * step(distanceToCenter, u_outer_radius + RING_EDGE_BIAS);
  if (FLAG_WITHIN_RANGE < 0.5) {
    discard;
  }

  float fac = clamp_to_range(distanceToCenter, u_inner_radius, u_outer_radius);
  csm_DiffuseColor = texture2D(u_ring_tex, vec2(fac, 0.5));
}