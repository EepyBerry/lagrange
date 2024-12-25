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

// Water level & roughness/metalness
uniform PBRParameters u_pbr_params;

// Noise uniforms
uniform bool u_warp;
uniform bool u_displace;
uniform DisplacementParameters u_surface_displacement;
uniform NoiseParameters u_surface_noise;

// Packed varyings (uv, position)
in mat4 vTransform;

@import functions/fbm;
@import functions/lwd;

void main() {
    vec3 color = vec3(0.0);
    vec3 vPos = vTransform[1].xyz;

    // XYZ Warping + displacement
    vPos = compute_warping(vPos, vec3(u_surface_noise.xwarp, u_surface_noise.ywarp, u_surface_noise.zwarp), u_warp);
    vPos = compute_displacement(vPos, u_surface_displacement, u_displace);

    // Heightmap & global flags
    float height = compute_layering(vPos, u_surface_noise);
    float FLAG_LAND = step(u_pbr_params.wlevel, height);

    // Render noise as color
    color += height;
    float outRoughness = mix(u_pbr_params.wrough, u_pbr_params.grough, FLAG_LAND);
    float outMetalness = mix(u_pbr_params.wmetal, u_pbr_params.gmetal, FLAG_LAND);

    // Set outputs
    csm_DiffuseColor = vec4(0.0, outRoughness, outMetalness, 1.0);
}