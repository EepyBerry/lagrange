#ifdef GL_ES
precision highp float;
#endif

// Populated by ThreeJS via BufferGeometry#computeTangents()
attribute vec3 tangent;

out vec2 vUv;
out vec3 vPos;
out vec3 vTangent;
out vec3 vBitangent;

void main() {
     vUv = uv;
     vPos = position;
     vTangent = tangent;
     vBitangent = cross(normal, tangent);
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}