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
uniform NoiseParameters u_noise;
uniform vec3 u_color;
uniform sampler2D u_opacity_tex;

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
    opacity = texture2D(u_opacity_tex, vec2(opacity.x, 0.5)).xyz;

    csm_Metalness = 0.5;
    csm_Roughness = 1.0;
    csm_DiffuseColor = vec4(u_color, opacity.x);
}