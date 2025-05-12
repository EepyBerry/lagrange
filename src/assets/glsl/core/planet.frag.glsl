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
  float wrough;
  float wmetal;
  int wemimode;
  vec3 wemicolor;
  float wemiscale;
  float grough;
  float gmetal;
};

// Planet size
uniform float u_radius;

// Water level & roughness/metalness
uniform PBRParameters u_pbr_params;

// Noise uniforms
uniform bool u_warp;
uniform bool u_displace;
uniform DisplacementParameters u_surface_displacement;
uniform NoiseParameters u_surface_noise;
uniform sampler2D u_surface_tex;

// Bump uniforms
uniform bool u_bump;
uniform float u_bump_offset;
uniform float u_bump_strength;

// Biome uniforms
uniform bool u_biomes;
uniform NoiseParameters u_temp_noise;
uniform NoiseParameters u_humi_noise;
uniform sampler2D u_biomes_tex;

// Packed varyings (uv, position, tangent, bitangent)
in mat4 vTransform;

@import functions/fbm;
@import functions/bump;
@import functions/lwd;
@import functions/biomes;
@import functions/color_utils;

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
  vec3 vTangent = vTransform[2].xyz;
  vec3 vBitangent = vTransform[3].xyz;
  vec3 surfaceWarpVec = vec3(u_surface_noise.xwarp, u_surface_noise.ywarp, u_surface_noise.zwarp);

  // XYZ Warping + displacement
  vPos = compute_warping(vPos, surfaceWarpVec, u_warp);
  vPos = compute_displacement(vPos, u_surface_displacement, u_displace);

  // Heightmap & global flags
  float height = compute_layering(vPos, u_surface_noise);
  float FLAG_LAND = step(u_pbr_params.wlevel, height);
  float FLAG_BIOMES = FLAG_LAND * float(u_biomes);
  float FLAG_EMISSIVE_CURRENT = step(float(u_pbr_params.wemimode), 0.5);

  // Render noise as color
  color += height;
  color = texture2D(u_surface_tex, vec2(color.x, 0.5)).xyz;

  // Render biomes
  float tHeight = mix(0.0, compute_temperature(vPos, u_temp_noise), FLAG_BIOMES);
  float hHeight = mix(0.0, compute_humidity(vPos, u_humi_noise), FLAG_BIOMES);
  color = mix(color, apply_biomes(tHeight, hHeight, color), FLAG_BIOMES);

  // Render bump-map (under MIT license)
  // note: see license in bump.func.glsl
  vec3 dx = vTangent * surfaceWarpVec * u_bump_offset;
  vec3 dy = vBitangent * surfaceWarpVec * u_bump_offset;
  float dxHeight = compute_layering(vPos + dx, u_surface_noise);
  float dyHeight = compute_layering(vPos + dy, u_surface_noise);
  vec3 bump = compute_bumpmap(vPos, dx, dy, height, dxHeight, dyHeight, u_radius, u_bump_strength);

  // Set outputs
  csm_DiffuseColor = vec4(color, 1.0);
  csm_Bump = mix(vNormal, bump, FLAG_LAND * float(u_bump));
  csm_Roughness = mix(u_pbr_params.wrough, u_pbr_params.grough, FLAG_LAND);
  csm_Metalness = mix(u_pbr_params.wmetal, u_pbr_params.gmetal, FLAG_LAND);
  csm_Emissive = mix(mix(u_pbr_params.wemicolor, color, FLAG_EMISSIVE_CURRENT)*u_pbr_params.wemiscale, vec3(0.0), FLAG_LAND);
}