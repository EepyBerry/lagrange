#ifdef GL_ES
precision highp float;
#endif


// Bump uniforms
uniform bool u_bump;
uniform float u_bump_offset;
uniform float u_bump_strength;

// Water & roughness/metalness uniforms
uniform float u_water_level;
uniform float u_ground_roughness;
uniform float u_ground_metalness;

// Biome uniforms
uniform bool u_biomes;
uniform bool u_show_poles;
uniform float u_pole_limit;

in vec2 vUv;
in vec3 vPos;
in vec3 vTangent;
in vec3 vBitangent;

@import functions/fbm;
@import functions/color_utils;
@import functions/normal_utils;
@import functions/voronoise;

void main() {
    vec3 color = vec3(0.0);
    vec3 N = vNormal;
    float height = fbm3(vPos, u_frequency, u_amplitude, u_lacunarity, u_octaves);

    // create initial voronoi diagram
    vec2 c = voronoi3((1.0+6.0*sin(0.2))*vPos, 1.0);
    vec3 color = 0.5 + 0.5*cos( c.y*6.2831 + vec3(0.0,1.0,2.0) );	
    color *= clamp(1.0 - 0.4*c.x*c.x,0.0,1.0);
    col -= (1.0-smoothstep( 0.08, 0.09, c.x)); // Delaunay center point

    if (u_bump) {
        // Calculate height, dxHeight and dyHeight
        vec3 dx = vTangent * u_bump_offset;
        vec3 dy = vBitangent * u_bump_offset;
        float dxHeight = fbm3(vPos + dx, u_frequency, u_amplitude, u_lacunarity, u_octaves);
        float dyHeight = fbm3(vPos + dy, u_frequency, u_amplitude, u_lacunarity, u_octaves);

        // Perturb normal
        N = u_bump
            ? perturbNormal(vPos, dx, dy, height, dxHeight, dyHeight, u_radius, u_bump_strength)
            : vNormal;
    }

    // Render poles
    if (u_biomes && u_show_poles) {
        float northBlendValue = (vPos.y - u_pole_limit) / (u_radius - u_pole_limit);
        color = vPos.y > u_pole_limit && height > u_water_level
            ? mix(color, vec3(1.0), clamp(northBlendValue, 0.0, 1.0))
            : color;
        float southBlendValue = (vPos.y + u_radius) / (-u_pole_limit + u_radius);
        color = vPos.y < -u_pole_limit && height > u_water_level
            ? mix(vec3(1.0), color, clamp(southBlendValue, 0.0, 1.0))
            : color;
    }

    // Set outputs
    csm_Bump = height > u_water_level ? N : vNormal;
    csm_Metalness = height > u_water_level ? u_ground_metalness : u_water_metalness;
    csm_Roughness = height > u_water_level ? u_ground_roughness : u_water_roughness;
    csm_DiffuseColor = vec4(color, 1.0);
}