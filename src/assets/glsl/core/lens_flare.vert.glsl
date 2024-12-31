// Sourced from Anderson Mancini:
// https://codesandbox.io/s/lens-flare-vanilla-threejs-pt4fwr
// ------------------------------------------------------------------------------------------------

#ifdef GL_ES
precision highp float;
#endif

out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}