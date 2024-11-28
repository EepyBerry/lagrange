#ifdef GL_ES
precision highp float;
#endif

struct DisplacementParameters {
    float fac;
    float eps;
    float mul;

    float freq;
    float amp;
    float lac;
    int oct;
};
struct NoiseParameters {
    int mode;
    float freq;
    float amp;
    float lac;
    int oct;

    int layers;
    float xwarp;
    float ywarp;
    float zwarp;
};
struct PBRParameters {
    float wlevel;
    float wrough;
    float wmetal;
    float grough;
    float gmetal;
};

// Planet size
uniform float u_radius;

// Water level & roughness/metalness
uniform PBRParameters u_pbr_params;

// Noise uniforms
uniform bool u_warp;
uniform bool u_displace;
uniform DisplacementParameters u_surface_displacement;
uniform NoiseParameters u_surface_noise;
uniform sampler2D u_surface_tex;

// Biome uniforms
uniform bool u_biomes;
uniform NoiseParameters u_temp_noise;
uniform NoiseParameters u_humi_noise;
uniform sampler2D u_biomes_tex;

// Packed varyings (uv, position, tangent, bitangent)
in mat4 vTransform;

@import functions/fbm;
@import functions/lwd;
@import functions/biomes;

// Biome function
vec3 apply_biomes(float t, float h, vec3 color) {
    vec3 biomeColor = color;
    vec2 texCoord = vec2(h, t);
    vec4 texel = texture2D(u_biomes_tex, texCoord);
    biomeColor = mix(color, texel.xyz, texel.w);
    return biomeColor;
}

void main() {
    vec3 color = vec3(0.0);
    vec3 vPos = vTransform[1].xyz;

    // layering + warping + displacement (LWD) operations
    float height = compute_layering(vPos, u_surface_noise);
    vPos = compute_warping(vPos, vec3(u_surface_noise.xwarp, u_surface_noise.ywarp, u_surface_noise.zwarp), u_warp);
    vPos = compute_displacement(vPos, u_surface_displacement, u_displace);

    // Heightmap & global flags
    float FLAG_LAND = step(u_pbr_params.wlevel, height);
    float FLAG_BIOMES = FLAG_LAND * float(u_biomes);

    // Render noise as color
    color += height;
    color = texture2D(u_surface_tex, vec2(color.x, 0.5)).xyz;

    // Render biomes
    float tHeight = mix(0.0, compute_temperature(vPos, u_temp_noise), FLAG_BIOMES);
    float hHeight = mix(0.0, compute_humidity(vPos, u_humi_noise), FLAG_BIOMES);
    color = mix(color, apply_biomes(tHeight, hHeight, color), FLAG_BIOMES);

    // Set outputs
    csm_DiffuseColor = vec4(color, 1.0);
}