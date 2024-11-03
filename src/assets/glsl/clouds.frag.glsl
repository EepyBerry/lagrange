#ifdef GL_ES
precision highp float;
#endif

struct NoiseParameters {
    int type;
    float freq;
    float amp;
    float lac;
    int oct;

    float xwarp;
    float ywarp;
    float zwarp;
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
    // Warping
    vec3 wPos = vec3(
        vPos.x * u_noise.xwarp,
        vPos.y * u_noise.ywarp,
        vPos.z * u_noise.zwarp
    );

    // Clouds
    vec3 opacity = vec3(0.0);
    vec3 wOpacity = vec3(
        fbm3(wPos,               u_noise.freq, u_noise.amp, u_noise.lac, u_noise.oct),
        fbm3(wPos + DVEC_A,      u_noise.freq, u_noise.amp, u_noise.lac, u_noise.oct),
        fbm3(wPos + DVEC_B,      u_noise.freq, u_noise.amp, u_noise.lac, u_noise.oct)
    );
    if (wOpacity.x < 0.1) {
        discard;
    }
    opacity += fbm3(wPos + wOpacity, u_noise.freq, u_noise.amp, u_noise.lac, u_noise.oct);
    opacity = texture2D(u_opacity_tex, vec2(opacity.x, 0.5)).xyz;

    csm_Metalness = 0.5;
    csm_Roughness = 1.0;
    csm_DiffuseColor = vec4(u_color, opacity.x);
}