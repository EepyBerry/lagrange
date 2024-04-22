export const options = {
    perlin: {
        vel: 0.002,
        speed: 0.0005,
        perlins: 1.0,
        decay: 0.1,
        complex: 0.3,
        waves: 20.0,
        eqcolor: 11.0,
        fragment: false,
        redhell: true
    },
        spin: {
        sinVel: 0.0,
        ampVel: 80.0
    }
}

export const perlinShader = () => {
    return `
        #define M_PI 3.14159265358979323846

        float rand(vec2 co){return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);}
        float rand (vec2 co, float l) {return rand(vec2(rand(co), l));}
        float rand (vec2 co, float l, float t) {return rand(vec2(rand(co, l), t));}

        float perlin(vec2 p, float dim, float time) {
            vec2 pos = floor(p * dim);
            vec2 posx = pos + vec2(1.0, 0.0);
            vec2 posy = pos + vec2(0.0, 1.0);
            vec2 posxy = pos + vec2(1.0);
            
            float c = rand(pos, dim, time);
            float cx = rand(posx, dim, time);
            float cy = rand(posy, dim, time);
            float cxy = rand(posxy, dim, time);
            
            vec2 d = fract(p * dim);
            d = -0.5 * cos(d * M_PI) + 0.5;
            
            float ccx = mix(c, cx, d.x);
            float cycxy = mix(cy, cxy, d.x);
            float center = mix(ccx, cycxy, d.y);
            
            return center * 2.0 - 1.0;
        }

        // p must be normalized!
        float perlin(vec2 p, float dim) {
            
            /*vec2 pos = floor(p * dim);
            vec2 posx = pos + vec2(1.0, 0.0);
            vec2 posy = pos + vec2(0.0, 1.0);
            vec2 posxy = pos + vec2(1.0);
            
            // For exclusively black/white noise
            /*float c = step(rand(pos, dim), 0.5);
            float cx = step(rand(posx, dim), 0.5);
            float cy = step(rand(posy, dim), 0.5);
            float cxy = step(rand(posxy, dim), 0.5);*/
            
            /*float c = rand(pos, dim);
            float cx = rand(posx, dim);
            float cy = rand(posy, dim);
            float cxy = rand(posxy, dim);
            
            vec2 d = fract(p * dim);
            d = -0.5 * cos(d * M_PI) + 0.5;
            
            float ccx = mix(c, cx, d.x);
            float cycxy = mix(cy, cxy, d.x);
            float center = mix(ccx, cycxy, d.y);
            
            return center * 2.0 - 1.0;*/
            return perlin(p, dim, 0.0);
        }
    `
}