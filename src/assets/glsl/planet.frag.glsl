#ifdef GL_ES
precision highp float;
#endif

// Main uniforms
uniform int u_octaves;
uniform vec2 u_resolution;
uniform float u_time;

// Color ramp uniforms
uniform float[16] u_cr_positions;
uniform vec3[16] u_cr_colors;
uniform int u_cr_size;

varying vec3 vPos;

/*__SHADER_FUNCTIONS__*/

void main() {
    vec3 color = vec3(0.0);
    color += fbm(vPos*2.0, u_octaves);
    color = color_ramp(u_cr_colors, u_cr_positions, u_cr_size, color.x);
    color = linear_to_srgb(color);
    
    csm_DiffuseColor = vec4(color,1.0);
}