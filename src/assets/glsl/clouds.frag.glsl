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

// Main uniforms
uniform int u_octaves;
uniform NoiseParameters u_noise;
uniform vec3 u_color;

// Color ramp uniforms
uniform float[16] u_cr_positions;
uniform vec3[16] u_cr_colors;
uniform int u_cr_size;

in vec3 vPos;

@import functions/fbm;
@import functions/color_utils;

// Constants
const vec3 DVEC_A = vec3(0.1, 0.1, 0.0);
const vec3 DVEC_B = vec3(0.2, 0.2, 0.0);

void main() {
    vec3 opacity = vec3(0.0);
    vec3 wOpacity = vec3(
        fbm3(vPos,               u_noise.freq, u_noise.amp, u_noise.lac, u_noise.oct),
        fbm3(vPos + DVEC_A,      u_noise.freq, u_noise.amp, u_noise.lac, u_noise.oct),
        fbm3(vPos + DVEC_B,      u_noise.freq, u_noise.amp, u_noise.lac, u_noise.oct)
    );
    if (wOpacity.x < 0.1) {
        discard;
    }
    opacity += fbm3(vPos + wOpacity, u_noise.freq, u_noise.amp, u_noise.lac, u_noise.oct);

    opacity = color_ramp(u_cr_colors, u_cr_positions, u_cr_size, opacity.x);
    csm_Metalness = 0.5;
    csm_Roughness = 1.0;
    csm_DiffuseColor = vec4(u_color, opacity.x);
}