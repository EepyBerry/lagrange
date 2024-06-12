#ifdef GL_ES
precision highp float;
#endif

// Main uniforms
uniform int u_octaves;
uniform vec2 u_resolution;
uniform float u_frequency;
uniform float u_amplitude;
uniform float u_lacunarity;
uniform vec3 u_color;

// Color ramp uniforms
uniform float[16] u_cr_positions;
uniform vec3[16] u_cr_colors;
uniform int u_cr_size;

in vec3 vPos;

@import functions/fbm;
@import functions/color_utils;

void main() {
    vec3 opacity = vec3(0.0);
    vec3 da = vec3(0.1, 0.1, 0.0);
    vec3 db = vec3(0.2, 0.2, 0.0);
    vec3 wOpacity = vec3(
        fbm3(vPos + opacity, u_frequency, u_amplitude, u_lacunarity, u_octaves),
        fbm3(vPos + da,      u_frequency, u_amplitude, u_lacunarity, u_octaves),
        fbm3(vPos + db,      u_frequency, u_amplitude, u_lacunarity, u_octaves)
    );
    opacity += fbm3(vPos + wOpacity, u_frequency, u_amplitude, u_lacunarity, u_octaves);
    opacity = color_ramp(u_cr_colors, u_cr_positions, u_cr_size, opacity.x);
    
    csm_DiffuseColor = vec4(u_color, opacity);
}