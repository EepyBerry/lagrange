#ifdef GL_ES
precision highp float;
#endif

struct DisplacementParameters {
    float fac;
    float eps;
    float mul;

    float freq;
    float amp;
    float lac;
    int oct;
};
struct NoiseParameters {
    int mode;
    float freq;
    float amp;
    float lac;
    int oct;

    int layers;
    float xwarp;
    float ywarp;
    float zwarp;
};
struct PBRParameters {
    float wlevel;
};

// Planet size
uniform float u_radius;

// Water level
uniform PBRParameters u_pbr_params;

// Noise uniforms
uniform bool u_warp;
uniform bool u_displace;
uniform DisplacementParameters u_surface_displacement;
uniform NoiseParameters u_surface_noise;
uniform sampler2D u_surface_tex;

// Biome uniforms
uniform bool u_biomes;
uniform NoiseParameters u_temp_noise;
uniform NoiseParameters u_humi_noise;
uniform sampler2D u_biomes_tex;

// Packed varyings (uv, position, tangent, bitangent)
in mat4 vTransform;

@import functions/fbm;

// Height + domain-warping
float compute_height(vec3 vPos) {
    float height = fbm3(vPos, u_surface_noise.freq, u_surface_noise.amp, u_surface_noise.lac, u_surface_noise.oct);
    height = mix(height, fbm1(height, u_surface_noise.freq, u_surface_noise.amp, u_surface_noise.lac, u_surface_noise.oct), clamp(float(u_surface_noise.layers) - 1.0, 0.0, 1.0));
    height = mix(height, fbm1(height, u_surface_noise.freq, u_surface_noise.amp, u_surface_noise.lac, u_surface_noise.oct), clamp(float(u_surface_noise.layers) - 2.0, 0.0, 1.0));
    return height;
}

vec3 compute_curl(vec3 vPos) {
    float eps = u_surface_displacement.eps;
    float mul = u_surface_displacement.mul;

    float n1 = fbm3(vec3(vPos.x + eps, vPos.y, vPos.z), u_surface_displacement.freq, u_surface_displacement.amp, u_surface_displacement.lac, u_surface_displacement.oct);
    float n2 = fbm3(vec3(vPos.x - eps, vPos.y, vPos.z), u_surface_displacement.freq, u_surface_displacement.amp, u_surface_displacement.lac, u_surface_displacement.oct);
    float dx = (n1 - n2) / (mul * eps);

    n1 = fbm3(vec3(vPos.x, vPos.y + eps, vPos.z), u_surface_displacement.freq, u_surface_displacement.amp, u_surface_displacement.lac, u_surface_displacement.oct);
    n2 = fbm3(vec3(vPos.x, vPos.y - eps, vPos.z), u_surface_displacement.freq, u_surface_displacement.amp, u_surface_displacement.lac, u_surface_displacement.oct);
    float dy = (n1 - n2) / (mul * eps);

    n1 = fbm3(vec3(vPos.x, vPos.y, vPos.z + eps), u_surface_displacement.freq, u_surface_displacement.amp, u_surface_displacement.lac, u_surface_displacement.oct);
    n2 = fbm3(vec3(vPos.x, vPos.y, vPos.z - eps), u_surface_displacement.freq, u_surface_displacement.amp, u_surface_displacement.lac, u_surface_displacement.oct);
    float dz = (n1 - n2) / (mul * eps);

    //Curl
    return mix(vPos, vec3(dx, dy, dz), u_surface_displacement.fac);
}

// Temperature function
float apply_temperature(vec3 vPos) {
    float FLAG_POLAR_TEMP = step(0.5, float(u_temp_noise.mode));
    float FLAG_NOISE_TEMP = step(1.5, float(u_temp_noise.mode));
    float ty = mix(abs(vPos.y), vPos.y, FLAG_POLAR_TEMP);
    float adjustedTy = smoothstep(1.0, -FLAG_POLAR_TEMP, ty);
    float tHeight = mix(adjustedTy, 1.0, FLAG_NOISE_TEMP);
    return tHeight * fbm3(vPos, u_temp_noise.freq, u_temp_noise.amp, u_temp_noise.lac, u_temp_noise.oct);
}

// Humidity function
float apply_humidity(vec3 vPos) {
    float FLAG_POLAR_HUMI = step(0.5, float(u_humi_noise.mode));
    float FLAG_NOISE_HUMI = step(1.5, float(u_humi_noise.mode));
    float hy = mix(abs(vPos.y), vPos.y, FLAG_POLAR_HUMI);
    float adjustedHy = smoothstep(-FLAG_POLAR_HUMI, 1.0, hy);
    float hHeight = mix(adjustedHy, 1.0, FLAG_NOISE_HUMI);
    return hHeight * fbm3(vPos, u_humi_noise.freq, u_humi_noise.amp, u_humi_noise.lac, u_humi_noise.oct);
}

// Biome function
vec3 apply_biomes(float t, float h, vec3 color) {
    vec3 biomeColor = color;
    vec2 texCoord = vec2(h, t);
    vec4 texel = texture2D(u_biomes_tex, texCoord);
    biomeColor = mix(color, texel.xyz, texel.w);
    return biomeColor;
}

void main() {
    vec3 color = vec3(0.0);
    vec3 vPos = vTransform[1].xyz;

    // Warping
    vPos.x *= mix(1.0, u_surface_noise.xwarp, float(u_warp));
    vPos.y *= mix(1.0, u_surface_noise.ywarp, float(u_warp));
    vPos.z *= mix(1.0, u_surface_noise.zwarp, float(u_warp));

    // Displacement (curl noise)
    vPos = mix(vPos, compute_curl(vPos), float(u_displace));

    // Heightmap & global flags
    float height = compute_height(vPos);
    float FLAG_LAND = step(u_pbr_params.wlevel, height);
    float FLAG_BIOMES = FLAG_LAND * float(u_biomes);

    // Temperature & humidity
    float tHeight = mix(0.0, apply_temperature(vPos), FLAG_BIOMES);
    float hHeight = mix(0.0, apply_humidity(vPos), FLAG_BIOMES);

    // Render noise as color
    color += height;
    color = texture2D(u_surface_tex, vec2(color.x, 0.5)).xyz;

    // Render biomes
    color = mix(color, apply_biomes(tHeight, hHeight, color), FLAG_BIOMES);

    // Set outputs
    csm_DiffuseColor = vec4(color, 1.0);
}