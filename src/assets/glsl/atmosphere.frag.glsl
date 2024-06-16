// Sourced from Brian Jackson (@jaxzin), using code from GLtracy:
// https://glitch.com/~polite-playful-wool
// https://www.shadertoy.com/view/lslXDr

#ifdef GL_ES
precision highp float;
#endif

uniform vec3 u_light_position;
uniform float u_light_intensity;
uniform float u_surface_radius;
uniform float u_radius;

in float fov;
in vec4 vWorldPosition;
in vec3 viewRay; // View space ray direction

@import functions/atmosphere_utils;

void main() {
    // Step 3: World Space Ray
    vec4 worldRay = inverse(viewMatrix) * vec4(viewRay, 0.0);

    // Normalize the ray direction
    vec3 dir = normalize(worldRay.xyz);

    // default ray origin
    vec3 eye = vWorldPosition.xyz;

    // sun light dir
    vec3 l = normalize(u_light_position - vWorldPosition.xyz);

    // find if the pixel is part of the atmosphere
    vec2 e = ray_vs_sphere(eye, dir, u_radius);

    // something went horribly wrong so set the pixel transparent
    if ( e.x > e.y ) {
        csm_DiffuseColor = vec4(0.0, 0.0, 0.0, 0.0);
        return;
    }

    // find if the pixel is part of the surface
    vec2 f = ray_vs_sphere(eye, dir, u_surface_radius);
    e.y = min( e.y, f.x );

    vec4 I = in_scatter(eye, dir, e, l, u_light_intensity);

    vec4 I_gamma = pow(I, vec4(1.0 / 2.2));
    csm_DiffuseColor = I_gamma;
}