#ifdef GL_ES
precision highp float;
#endif

// Packed varyings (uv, position, tangent, bitangent)
in mat4 vTransform;

uniform sampler2D u_ring_tex;

void main() {
  csm_DiffuseColor = vec4(vTransform[0].xyz, 0.75);
}