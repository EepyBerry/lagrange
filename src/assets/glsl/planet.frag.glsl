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

// Bump uniforms
uniform bool u_bump;
uniform float u_bump_offset;
uniform float u_bump_strength;

// Biome uniforms
uniform bool u_biomes;
uniform NoiseParameters u_temp_noise;
uniform NoiseParameters u_humi_noise;
uniform sampler2D u_biomes_tex;

// Packed varyings (uv, position, tangent, bitangent)
in mat4 vTransform;

@import functions/fbm;
@import functions/normal_utils;
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

// Bump mapping function, pretty mediocre but enough for a start...
// Calculates height derivatives, then perturbs the normal according to these values
vec3 apply_bump(vec3 vPos, float height) {
    vec3 dx = vec3(
        vTransform[2].x * u_surface_noise.xwarp,
        vTransform[2].y * u_surface_noise.ywarp,
        vTransform[2].z * u_surface_noise.zwarp
    ) * u_bump_offset;
    vec3 dy = vec3(
        vTransform[3].x * u_surface_noise.xwarp,
        vTransform[3].y * u_surface_noise.ywarp,
        vTransform[3].z * u_surface_noise.zwarp
    ) * u_bump_offset;
    float dxHeight = compute_layering(vPos + dx, u_surface_noise);
    float dyHeight = compute_layering(vPos + dy, u_surface_noise);
    return perturb_normal(vPos, dx, dy, height, dxHeight, dyHeight, u_radius, u_bump_strength);
}

void main() {
    vec3 color = vec3(0.0);
    vec3 vPos = vTransform[1].xyz;

    // XYZ Warping + displacement
    vPos = compute_warping(vPos, vec3(u_surface_noise.xwarp, u_surface_noise.ywarp, u_surface_noise.zwarp), u_warp);
    vPos = compute_displacement(vPos, u_surface_displacement, u_displace);

    // Heightmap & global flags
    float height = compute_layering(vPos, u_surface_noise);
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
    csm_Bump = mix(vNormal, apply_bump(vPos, height), FLAG_LAND * float(u_bump));
    csm_Roughness = mix(u_pbr_params.wrough, u_pbr_params.grough, FLAG_LAND);
    csm_Metalness = mix(u_pbr_params.wmetal, u_pbr_params.gmetal, FLAG_LAND);
    csm_DiffuseColor = vec4(color, 1.0);
}