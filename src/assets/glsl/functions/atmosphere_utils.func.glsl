// Sourced from Brian Jackson (@jaxzin), using code from GLtracy:
// https://glitch.com/~polite-playful-wool
// https://www.shadertoy.com/view/lslXDr

// Written by GLtracy
// Credit: https://www.shadertoy.com/view/lslXDr

// math const
const float PI = 3.14159265359;
const float MAX = 10000.0;

const int NUM_OUT_SCATTER = 2;
const int NUM_IN_SCATTER = 10;

// ray intersects sphere
// e = -b +/- sqrt( b^2 - c )
vec2 ray_vs_sphere(vec3 p, vec3 dir, float r) {
    float b = dot(p, dir);
    float c = dot(p, p) - r * r;
    float d = b * b - c;
    if (d < 0.0) {
        return vec2(MAX, -MAX);
    }
    d = sqrt( d );
    return vec2(-b - d, -b + d);
}

// Mie
// g : ( -0.75, -0.999 )
//      3 * ( 1 - g^2 )               1 + c^2
// F = ----------------- * -------------------------------
//      8pi * ( 2 + g^2 )     ( 1 + g^2 - 2 * g * c )^(3/2)
float phase_mie(float g, float c, float cc) {
    float gg = g * g;
    float a = (1.0 - gg) * (1.0 + cc);
    float b = 1.0 + gg - 2.0 * g * c;
    b *= sqrt(b);
    b *= 2.0 + gg;
    return (3.0 / 8.0 / PI) * a / b;
}

// Rayleigh
// g : 0
// F = 3/16PI * ( 1 + c^2 )
float phase_ray(float cc) {
    return (3.0 / 16.0 / PI) * (1.0 + cc);
}

float density(vec3 p, float ph) {
    float actualScaleHeight = 8500.0;  // The scale height on Earth in meters
    float scale = u_density / actualScaleHeight; // Scaling factor based on the gap
    float altitude = length(p) - u_surface_radius;
    
    // Initial density at the surface (sea level). Set this to your desired value.
    // Earth's air density at sea level is approximately 1.225 kg/m^3
    float rho_0 = 20.0; 
    
    //TBD, why does it looks better with these tunings?
    //scale *= 0.125;
    rho_0 *= 0.08125; 

    // Use exponential decay formula to calculate density
    float rho = rho_0 * exp(-max(altitude, 0.0) / (actualScaleHeight * scale));
    return rho * ph;

    // return exp(-max(altitude, 0.0) / (ph*atmoThickness));
}


float optic(vec3 p, vec3 q, float ph) {
    vec3 s = (q - p) / float(NUM_OUT_SCATTER);
    vec3 v = p + s * 0.5;
    float sum = 0.0;
    for (int i = 0; i < NUM_OUT_SCATTER; i++) {
        sum += density(v, ph);
        v += s;
    }
    sum *= length(s);
    return sum;
}

vec4 in_scatter( vec3 o, vec3 dir, vec2 e, vec3 l, float l_intensity) {
    const float ph_ray = 0.15;
    const float ph_mie = 0.05;
    const float ph_alpha = 0.25;

    const vec3 k_ray = vec3( 3.8, 13.5, 33.1 );
    const vec3 k_mie = vec3( 21.0 );
    const float k_mie_ex = 1.1;
    
    const float k_alpha = 2.0;

    vec3 sum_ray = vec3( 0.0 );
    vec3 sum_mie = vec3( 0.0 );
    float sum_alpha = 0.0;

    float n_ray0 = 0.0;
    float n_mie0 = 0.0;

    float len = (e.y - e.x) / float(NUM_IN_SCATTER);
    vec3 s = dir * len;
    vec3 v = o + dir * (e.x + len * 0.5);

    for (int i = 0; i < NUM_IN_SCATTER; i++, v += s) {
        float d_ray = density( v, ph_ray ) * len;
        float d_mie = density( v, ph_mie ) * len;
        float d_alpha = density( v, ph_alpha ) * len;

        n_ray0 += d_ray;
        n_mie0 += d_mie;

        vec2 f = ray_vs_sphere( v, l, u_radius );
        vec3 u = v + l * f.y;

        float n_ray1 = optic( v, u, ph_ray );
        float n_mie1 = optic( v, u, ph_mie );

        vec3 att = exp(-(n_ray0 + n_ray1) * k_ray - (n_mie0 + n_mie1) * k_mie * k_mie_ex);

        sum_ray += d_ray * att;
        sum_mie += d_mie * att;
        
        // The optical density is only a factor of the density of the traveled media
        sum_alpha += d_alpha;

    }

    float c  = dot( dir, -l );
    float cc = c * c;
    vec3 scatter =
        sum_ray * k_ray * phase_ray( cc ) +
        sum_mie * k_mie * phase_mie( -0.78, c, cc );

    float alpha = sum_alpha * k_alpha;
    return vec4(scatter * l_intensity, alpha);
}

// ray direction
vec3 ray_dir( float fov, vec2 size, vec2 pos ) {
    vec2 xy = pos - size * 0.5;

    float cot_half_fov = tan( radians( 90.0 - fov * 0.5 ) );
    float z = size.y * 0.5 * cot_half_fov;

    return normalize( vec3( xy, -z ) );
}