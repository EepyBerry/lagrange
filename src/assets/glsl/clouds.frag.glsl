#ifdef GL_ES
precision highp float;
#endif

// Main uniforms
uniform int u_octaves;
uniform vec2 u_resolution;
uniform float u_frequency;
uniform float u_amplitude;
uniform float u_lacunarity;

// Color ramp uniforms
uniform float[16] u_cr_positions;
uniform vec3[16] u_cr_colors;
uniform int u_cr_size;

in vec3 vPos;

@import functions/fbm;
@import functions/color_utils;

void main() {
    vec3 color = vec3(0.0);
    color += fbm(vPos, u_frequency, u_amplitude, u_lacunarity, u_octaves);
    color = color_ramp(u_cr_colors, u_cr_positions, u_cr_size, color.x);
    
    csm_DiffuseColor = vec4(vec3(1.0), color);
}