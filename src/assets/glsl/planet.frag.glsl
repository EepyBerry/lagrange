#ifdef GL_ES
precision highp float;
#endif

struct NoiseParameters {
    int type;
    float freq;
    float amp;
    float lac;
    int oct;
};
struct PBRParameters {
    float wrough;
    float wmetal;
    float grough;
    float gmetal;
};

// Noise uniforms
uniform float u_radius;
uniform NoiseParameters u_gnd_noise;

// Bump uniforms
uniform bool u_bump;
uniform float u_bump_offset;
uniform float u_bump_strength;

// Water & roughness/metalness uniforms
uniform float u_water_level;
uniform PBRParameters u_pbr_params;

// Biome uniforms
uniform bool u_biomes;
uniform int u_temp_mode;
uniform int u_humi_mode;
uniform NoiseParameters u_temp_noise;
uniform NoiseParameters u_humi_noise;
uniform sampler2D u_biomes_tex;

// Color ramp uniforms
uniform float[16] u_cr_positions;
uniform vec3[16] u_cr_colors;
uniform int u_cr_size;

// Packed varyings (uv, position, tangent, bitangent)
in mat4 vTransform;

@import functions/fbm;
@import functions/color_utils;
@import functions/normal_utils;

// Biome function
vec3 apply_biomes(float t, float h, vec3 color) {
    vec3 biomeColor = color;
    vec2 texCoord = vec2(h, t);
    vec4 texel = texture2D(u_biomes_tex, texCoord);
    biomeColor = mix(color, texel.xyz, texel.w);
    return biomeColor;
}

// Bump mapping function, pretty mediocre but enough for a start...
// Calculates height derivatives, then perturbs the normal according to these values
vec3 apply_bump(float height) {
    vec3 vPos = vTransform[1].xyz;
    vec3 dx = vTransform[2].xyz * u_bump_offset;
    vec3 dy = vTransform[3].xyz * u_bump_offset;
    float dxHeight = fbm3(vPos + dx, u_gnd_noise.freq, u_gnd_noise.amp, u_gnd_noise.lac, u_gnd_noise.oct);
    float dyHeight = fbm3(vPos + dy, u_gnd_noise.freq, u_gnd_noise.amp, u_gnd_noise.lac, u_gnd_noise.oct);
    return perturb_normal(vPos, dx, dy, height, dxHeight, dyHeight, u_radius, u_bump_strength);
}

void main() {
    // Initial values
    vec3 vPos = vTransform[1].xyz;
    vec3 color = vec3(0.0);

    // Temperature
    float FLAG_POLAR_TEMP = step(0.5, float(u_temp_mode));
    float FLAG_NOISE_TEMP = step(1.5, float(u_temp_mode));
    float ty = mix(abs(vPos.y), vPos.y, FLAG_POLAR_TEMP);
    float adjustedTy = smoothstep(1.0, -FLAG_POLAR_TEMP, ty);
    float tHeight = mix(adjustedTy, 1.0, FLAG_NOISE_TEMP);
    tHeight *= fbm3(vPos, u_temp_noise.freq, u_temp_noise.amp, u_temp_noise.lac, u_temp_noise.oct);

    // Humidity
    float FLAG_POLAR_HUMI = step(0.5, float(u_humi_mode));
    float FLAG_NOISE_HUMI = step(1.5, float(u_humi_mode));
    float hy = mix(abs(vPos.y), vPos.y, FLAG_POLAR_HUMI);
    float adjustedHy = smoothstep(-FLAG_POLAR_HUMI, 1.0, hy);
    float hHeight = mix(adjustedHy, 1.0, FLAG_NOISE_HUMI);
    hHeight *= fbm3(vPos, u_humi_noise.freq, u_humi_noise.amp, u_humi_noise.lac, u_humi_noise.oct);

    // Initial heightmap & flags
    float height = fbm3(vPos, u_gnd_noise.freq, u_gnd_noise.amp, u_gnd_noise.lac, u_gnd_noise.oct);
    float FLAG_LAND = step(u_water_level, height);
    float FLAG_BIOMES = FLAG_LAND * float(u_biomes);

    // Render noise as color
    color += height;
    color = color_ramp(u_cr_colors, u_cr_positions, u_cr_size, color.x);

    // Render biomes
    color = mix(color, apply_biomes(tHeight, hHeight, color), FLAG_BIOMES);

    // Set outputs
    csm_Bump = mix(vNormal, apply_bump(height), FLAG_LAND);
    csm_Roughness = mix(u_pbr_params.wrough, u_pbr_params.grough, FLAG_LAND);
    csm_Metalness = mix(u_pbr_params.wmetal, u_pbr_params.gmetal, FLAG_LAND);
    csm_DiffuseColor = vec4(color, 1.0);
}