#ifdef GL_ES
precision highp float;
#endif

// Packed varyings (uv, position)
out mat3 vTransform;

void main() {
    vTransform = mat3(
        vec3(uv, 0.0),
        position,
        vec3(0.0),
    );
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}