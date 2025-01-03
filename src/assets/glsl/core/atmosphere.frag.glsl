// Sourced from Brian Jackson (@jaxzin), using code from GLtracy:
// https://glitch.com/~polite-playful-wool
// https://www.shadertoy.com/view/lslXDr
// ------------------------------------------------------------------------------------------------

#ifdef GL_ES
precision highp float;
#endif

uniform vec3  u_light_position;
uniform float u_light_intensity;
uniform float u_surface_radius;
uniform float u_radius;
uniform float u_density;

uniform float u_intensity;
uniform int   u_color_mode; // determines color output between hue-mode, direct-mode or mixed-mode
uniform float u_hue;
uniform vec3  u_tint;

in float fov;
in vec4 vWorldPosition;
in vec3 viewRay; // View space ray direction

@import functions/atmosphere_utils;
@import functions/color_utils;

void main() {
    // World Space Ray
    vec4 worldRay = inverse(viewMatrix) * vec4(viewRay, 0.0);

    // Normalize the ray direction
    vec3 rayDir = normalize(worldRay.xyz);

    // default ray origin
    vec3 eye = vWorldPosition.xyz;
    vec3 sunglightDir = normalize(u_light_position - vWorldPosition.xyz);

    // find if the pixel is part of the atmosphere
    vec2 e = ray_vs_sphere(eye, rayDir, u_radius);

    // something went horribly wrong so set the pixel transparent
    if ( e.x > e.y ) {
        gl_FragColor = vec4(0.0);
        return;
    }

    // find if the pixel is part of the surface
    vec2 f = ray_vs_sphere(eye, rayDir, u_surface_radius);
    e.y = min( e.y, f.x );

    vec4 I = in_scatter(eye, rayDir, e, sunglightDir, u_light_intensity);
    vec4 I_gamma = pow(I, vec4(1.0 / 2.2));
    vec4 I_shifted = vec4(hue_shift(I_gamma.xyz, u_hue * PI), I_gamma.a);
    vec4 tint = vec4(u_tint, 1.0);
    
    if (u_color_mode == 0) {
        gl_FragColor = I_shifted * u_intensity;
    } else if (u_color_mode == 1) {
        gl_FragColor = whitescale(I_gamma) * tint_to_matrix(tint) * u_intensity;
    } else {
        gl_FragColor = I_shifted * tint * u_intensity;
    }
}