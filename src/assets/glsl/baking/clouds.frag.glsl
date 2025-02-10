#ifdef GL_ES
precision highp float;
#endif

struct NoiseParameters {
    int type;
    float freq;
    float amp;
    float lac;
    int oct;

    int layers;
    float xwarp;
    float ywarp;
    float zwarp;
};

// Main uniforms
uniform bool u_warp;
uniform NoiseParameters u_noise;

uniform bool u_displace;
uniform DisplacementParameters u_displacement;

uniform vec3 u_color;
uniform sampler2D u_opacity_tex;

// Packed varyings (uv, position)
in mat4 vTransform;

@import functions/fbm;
@import functions/lwd;
@import functions/color_utils;

// Constants
const vec3 DVEC_A = vec3(0.1, 0.1, 0.0);
const vec3 DVEC_B = vec3(0.2, 0.2, 0.0);

void main() {
    vec3 vPos = vTransform[1].xyz;
    vec3 warpVec = vec3(u_noise.xwarp, u_noise.ywarp, u_noise.zwarp);

    // XYZ Warping + Displacement
    vec3 wPos = compute_warping(vPos, warpVec, u_warp);
    wPos = compute_displacement(wPos, u_displacement, u_displace);

    // Clouds
    vec3 opacity = vec3(0.0);
    vec3 wOpacity = vec3(
        fbm3(wPos,               u_noise.freq, u_noise.amp, u_noise.lac, u_noise.oct),
        fbm3(wPos + DVEC_A,      u_noise.freq, u_noise.amp, u_noise.lac, u_noise.oct),
        fbm3(wPos + DVEC_B,      u_noise.freq, u_noise.amp, u_noise.lac, u_noise.oct)
    );
    if (wOpacity.x < 0.05) {
        discard;
    }
    opacity += fbm3(vPos + wOpacity, u_noise.freq, u_noise.amp, u_noise.lac, u_noise.oct);
    opacity = texture2D(u_opacity_tex, vec2(opacity.x, 0.5)).xyz;
    csm_DiffuseColor = vec4(u_color, opacity.x);
}