#ifdef GL_ES
precision highp float;
#endif

// Populated by ThreeJS via BufferGeometry#computeTangents()
attribute vec3 tangent;

// Packed varyings (uv, position, tangent, bitangent)
out mat4 vTransform;

void main() {
    vTransform = mat4(
        vec4(vec3(uv, 0.0), 0.0),
        vec4(position, 0.0),
        vec4(tangent, 0.0),
        vec4(cross(normal, tangent), 0.0)
    );
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}