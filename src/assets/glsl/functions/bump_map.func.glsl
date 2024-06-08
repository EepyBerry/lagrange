// © 2024 EepyBerry

/* vec3 calcBump(vec3 height, vec3 uv, float heightScale) {
  vec3 normal = vec3(0.0);
  vec3 off = vec3(1.0, 1.0, 0.0);
  float hL = height(pos.xy - off.xz);
  float hR = height(pos.xy + off.xz);
  float hD = height(pos.xy - off.zy);
  float hU = height(pos.xy + off.zy);
  float hL = texture2D(height, uv.xy - off.xz).r * heightScale;
  float hR = texture2D(height, uv.xy + off.xz).r  * heightScale;
  float hD = texture2D(height, uv.xy - off.zy).r * heightScale;
  float hU = texture2D(height, uv.xy + off.zy).r * heightScale;

  // deduce terrain normal
  normal.x = hL - hR;
  normal.y = hD - hU;
  normal.z = 2.0;
  return normalize(normal);
} */