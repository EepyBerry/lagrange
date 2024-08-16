#ifdef GL_ES
precision highp float;
#endif

struct Biome {
    float tMin;
    float tMax;
    vec3 color;
};

// Noise uniforms
uniform float u_radius;
uniform int u_octaves;
uniform float u_frequency;
uniform float u_amplitude;
uniform float u_lacunarity;

// Bump uniforms
uniform bool u_bump;
uniform float u_bump_offset;
uniform float u_bump_strength;

// Water & roughness/metalness uniforms
uniform float u_water_level;
uniform float u_water_roughness;
uniform float u_ground_roughness;
uniform float u_water_metalness;
uniform float u_ground_metalness;

// Biome uniforms
uniform bool u_biomes;
uniform float u_pole_limit;
uniform sampler2D u_biome_tex;

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

// Biome calculation function
vec3 apply_biomes(float t, vec3 color) {
    vec3 biomeColor = color;
    vec2 texCoord = vec2(t, 0.5);
    vec4 texel = texture2D(u_biome_tex, texCoord);
    biomeColor = mix(color, texel.xyz, texel.w);
    return biomeColor;
}

// Bump mapping function, pretty mediocre but enough for a start...
vec3 apply_bump(float height) {
    // Calculate height, dxHeight and dyHeight
    vec3 dx = vTangent * u_bump_offset;
    vec3 dy = vBitangent * u_bump_offset;
    float dxHeight = fbm3(vPos + dx, u_frequency, u_amplitude, u_lacunarity, u_octaves);
    float dyHeight = fbm3(vPos + dy, u_frequency, u_amplitude, u_lacunarity, u_octaves);

    // Perturb normal
    return perturb_normal(vPos, dx, dy, height, dxHeight, dyHeight, u_radius, u_bump_strength);
}

void main() {
    // main variables
    float temperatureHeight = smoothstep(1.0, 0.0, abs(vPos.y));
    temperatureHeight = clamp(temperatureHeight * fbm3(vPos, 2.5, 1.5, 2.5, 2), 0.0, 1.0);
    vec3 color = vec3(0.0);

    // Initial heightmap & flags
    float height = fbm3(vPos,  u_frequency, u_amplitude, u_lacunarity, u_octaves);
    float FLAG_LAND = step(u_water_level, height);
    float FLAG_BIOMES = FLAG_LAND * float(u_biomes);

    // Render noise as color
    color += height;
    color = color_ramp(u_cr_colors, u_cr_positions, u_cr_size, color.x);

    // Render biomes
    color = mix(color, apply_biomes(temperatureHeight, color), FLAG_BIOMES);

    // Set outputs
    csm_Bump = mix(vNormal, apply_bump(height), FLAG_LAND);
    csm_Roughness = mix(u_water_roughness, u_ground_roughness, FLAG_LAND);
    csm_Metalness = mix(u_water_metalness, u_ground_metalness, FLAG_LAND);
    csm_DiffuseColor = vec4(color, 1.0);
}