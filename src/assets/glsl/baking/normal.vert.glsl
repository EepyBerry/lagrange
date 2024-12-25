#ifdef GL_ES
precision highp float;
#endif

// Packed varyings (uv, position, tangent, bitangent)
out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(uv, 0.0, 1.0);
}