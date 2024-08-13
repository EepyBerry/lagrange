// Sourced from Yi-wen LIN:
// https://github.com/yiwenl/glsl-fbm/blob/master/3d.glsl
// ------------------------------------------------------------------------------------------------
// 3D fractional Brownian motion

float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise3(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

float fbm3(vec3 x, float freq, float amp, float lac, int octaves) {
	float val = 0.0;
	vec3 shift = vec3(100);
	for (int i = 0; i < octaves; ++i) {
		val += amp * noise3(x*freq);
		x = x * lac + shift;
		amp *= 0.5;
	}
	return val;
}

float fbm3(vec3 x, float freq, float amp, float lac) {
	float val = 0.0;
	vec3 shift = vec3(100);
	val += amp * noise3(x*freq);
    x = x * lac + shift;
    amp *= 0.5;
	return val;
}

// Sourced from Yi-wen LIN:
// https://github.com/yiwenl/glsl-fbm/blob/master/1d.glsl
// ------------------------------------------------------------------------------------------------
// 1D fractional Brownian motion

float rand(float n){return fract(sin(n) * 43758.5453123);}

float noise1(float p){
    float fl = floor(p);
    float fc = fract(p);
    return mix(rand(fl), rand(fl + 1.0), fc);
}

float fbm1(float x, float freq, float amp, float lac) {
	float val = 0.0;
	float shift = 100.0;
	val += amp * noise1(x*freq);
    x = x * lac + shift;
    amp *= 0.5;
	return val;
}