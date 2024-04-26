#ifdef GL_ES
precision highp float;
#endif

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

in vec2  uv;
in vec3  position;
out vec3 v_position;
out vec2 v_texcoord;

void main() {
    v_texcoord = uv;
    v_position = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}