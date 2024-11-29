// Slightly ajusted from Daniel Greenheck:
// https://github.com/dgreenheck/threejs-procedural-planets
// Note: licensed under CC BY-NC-SA 3.0 Unported license (see: bump.func.glsl_LICENSE)

// Perturbs a surface normal from computed heights
vec3 compute_bumpmap(vec3 pos, vec3 dx, vec3 dy,
                   float height, float dxHeight, float dyHeight,
                   float radius, float bumpStrength) {
    vec3 hPos = pos * (radius + height);
    vec3 dxPos = (pos + dx) * (radius + dxHeight);
    vec3 dyPos = (pos + dy) * (radius + dyHeight);
    vec3 bumpN = normalize(cross(dyPos - hPos, dxPos - hPos));
    return normalize(mix(vNormal, bumpN, bumpStrength));
}