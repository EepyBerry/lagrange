#ifdef GL_ES
precision highp float;
#endif

// Main uniforms
uniform float u_radius;
uniform int u_octaves;
uniform vec2 u_resolution;
uniform float u_frequency;
uniform float u_amplitude;
uniform float u_lacunarity;
uniform float u_water_level;
uniform float u_water_roughness;
uniform float u_ground_roughness;
uniform float u_water_metalness;
uniform float u_ground_metalness;

// Color ramp uniforms
uniform float[16] u_cr_positions;
uniform vec3[16] u_cr_colors;
uniform int u_cr_size;

in vec2 vUv;
in vec3 vPos;
in vec3 vTangent;
in vec3 vBitangent;

@import functions/fbm;
@import functions/color_utils;

void main() {
    vec3 color = vec3(0.0);

    float bumpOffset = 0.001;
    float bumpStrength = 0.1;

    // Calculate height, dxHeight and dyHeight
    vec3 dx = vTangent * bumpOffset;
    vec3 dy = vBitangent * bumpOffset;
    float height   = fbm(vPos,      u_frequency, u_amplitude, u_lacunarity, u_octaves);
    float dxHeight = fbm(vPos + dx, u_frequency, u_amplitude, u_lacunarity, u_octaves);
    float dyHeight = fbm(vPos + dy, u_frequency, u_amplitude, u_lacunarity, u_octaves);
    
    // Calculate positions
    vec3 lcPos = vPos * (u_radius + height);
    vec3 dxPos = (vPos + dx) * (u_radius + dxHeight);
    vec3 dyPos = (vPos + dy) * (u_radius + dyHeight);
    vec3 bumpN = normalize(cross(dxPos - lcPos, dyPos - lcPos));
    vec3 N = normalize(mix(vNormal, bumpN, bumpStrength));

    // Render noise as color
    color += height;
    color = color_ramp(u_cr_colors, u_cr_positions, u_cr_size, color.x);

    csm_Bump = height > u_water_level ? N : vNormal;
    csm_Metalness = height > u_water_level ? u_ground_metalness: u_water_metalness;
    csm_Roughness = height > u_water_level ? u_ground_roughness : u_water_roughness;
    csm_DiffuseColor = vec4(color, 1.0);
}