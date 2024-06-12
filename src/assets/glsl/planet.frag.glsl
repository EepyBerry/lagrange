#ifdef GL_ES
precision highp float;
#endif

// Noise uniforms
uniform float u_radius;
uniform int u_octaves;
uniform vec2 u_resolution;
uniform float u_frequency;
uniform float u_amplitude;
uniform float u_lacunarity;

// Bump uniforms
uniform float u_bump_offset;
uniform float u_bump_strength;

// Water & roughness/metalness uniforms
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
@import functions/normal_utils;

void main() {
    vec3 color = vec3(0.0);

    // Calculate height, dxHeight and dyHeight
    vec3 dx = vTangent * u_bump_offset;
    vec3 dy = vBitangent * u_bump_offset;
    float height   = fbm3(vPos,      u_frequency, u_amplitude, u_lacunarity, u_octaves);
    float dxHeight = fbm3(vPos + dx, u_frequency, u_amplitude, u_lacunarity, u_octaves);
    float dyHeight = fbm3(vPos + dy, u_frequency, u_amplitude, u_lacunarity, u_octaves);

    // Perturb normal
    vec3 N = perturbNormal(vPos, dx, dy, height, dxHeight, dyHeight, u_radius, u_bump_strength);

    // Render noise as color
    color += height;
    color = color_ramp(u_cr_colors, u_cr_positions, u_cr_size, color.x);

    // Set outputs
    csm_Bump = height > u_water_level ? N : vNormal;
    csm_Metalness = height > u_water_level ? u_ground_metalness : u_water_metalness;
    csm_Roughness = height > u_water_level ? u_ground_roughness : u_water_roughness;
    csm_DiffuseColor = vec4(color, 1.0);
}