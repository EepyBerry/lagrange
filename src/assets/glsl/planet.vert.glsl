#ifdef GL_ES
precision highp float;
#endif

out vec3 vPos;

void main() {
     vPos = position;
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}