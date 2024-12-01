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

// Noise uniforms
uniform bool u_warp;
uniform bool u_displace;
uniform DisplacementParameters u_surface_displacement;
uniform NoiseParameters u_surface_noise;

// Bump uniforms
uniform bool u_bump;
uniform float u_bump_offset;
uniform float u_bump_strength;

// Packed varyings (uv, position)
in mat4 vTransform;

@import functions/fbm;
@import functions/lwd;
@import functions/normal;

void main() {
    vec3 color = vec3(0.0);
    vec3 vPos = vTransform[1].xyz;

    // XYZ Warping + displacement
    vPos = compute_warping(vPos, vec3(u_surface_noise.xwarp, u_surface_noise.ywarp, u_surface_noise.zwarp), u_warp);
    vPos = compute_displacement(vPos, u_surface_displacement, u_displace);

    // Heightmap
    float height = compute_layering(vPos, u_surface_noise);

    // Set outputs
    csm_DiffuseColor = vec4(vec3(height), 1.0);
}