#ifdef GL_ES
precision highp float;
#endif

// Packed varyings (uv, position, tangent, bitangent)
in mat4 vTransform;

uniform sampler2D u_ring_tex;

void main() {
  vec3 color = vec3(1.0, 1.0, 1.0);
  csm_FragColor = vec4(color, 0.5);
}