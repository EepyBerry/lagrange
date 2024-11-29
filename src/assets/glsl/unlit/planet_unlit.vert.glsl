#ifdef GL_ES
precision highp float;
#endif

// Packed varyings (uv, position, tangent, bitangent)
out mat4 vTransform;

void main() {
    vTransform = mat4(
        vec4(vec3(uv, 0.0), 0.0),
        vec4(position, 0.0),
        vec4(0.0),
        vec4(0.0)
    );
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}