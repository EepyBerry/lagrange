#ifdef GL_ES
precision highp float;
#endif

struct Biome {
    float frequency;
    float amplitude;
    float lacunarity;
    float temperatureMin;
    float temperatureMax;
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
uniform bool u_show_poles;
uniform float u_pole_limit;

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
// TODO: replace test code by actual implementation
vec3 apply_biomes(float temperature, vec3 color) {
    Biome b[1] = Biome[](
        Biome(2.0, 1.0, 1.0, 0.25, 1.0, vec3(1.0, 1.0, 0.0))
    );

    vec3 biomeColor = vec3(0.0);
    for (int i = 0; i < b.length(); i++) {
        Biome cb = b[i];
        float FLAG_BELOW_MAX_TEMP = step(temperature, cb.temperatureMax);
        float FLAG_ABOVE_MIN_TEMP = step(cb.temperatureMin, temperature);
        float FLAG_VALID = FLAG_BELOW_MAX_TEMP * FLAG_ABOVE_MIN_TEMP;

        float biomeHeight = FLAG_VALID * fbm3(vPos, cb.frequency, cb.amplitude, cb.lacunarity);
        biomeHeight = smoothstep(cb.temperatureMin, cb.temperatureMax, biomeHeight);

        // calculate smoothing based on an arbitrary "dead-zone"
        float biomeDz = 0.05;

        biomeColor = mix(color, cb.color, biomeHeight);
    }

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
    float temperatureHeight = smoothstep(0.75, 0.0, abs(vPos.y));
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