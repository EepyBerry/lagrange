// Slightly ajusted from Daniel Greenheck (huge thanks!):
// https://github.com/dgreenheck/threejs-procedural-planets
// ------------------------------------------------------------------------------------------------

// Perturbs a surface normal from computed heights
vec3 perturbNormal(vec3 pos, vec3 dx, vec3 dy,
                   float height, float dxHeight, float dyHeight,
                   float radius, float bumpStrength) {
    vec3 hPos = pos * (radius + height);
    vec3 dxPos = (pos + dx) * (radius + dxHeight);
    vec3 dyPos = (pos + dy) * (radius + dyHeight);
    vec3 bumpN = normalize(cross(dxPos - hPos, dyPos - hPos));
    return normalize(mix(vNormal, bumpN, bumpStrength));
}