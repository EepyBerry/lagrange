// Sourced from franky-adl, using code from Iñigo Quilez:
// https://github.com/franky-adl/voronoi-sphere/blob/main/src/shaders/voronoi3d_basic.glsl
// ------------------------------------------------------------------------------------------------

// hash function from https://github.com/MaxBittker/glsl-voronoi-noise
vec3 hash3d(vec3 p) {
  return fract(
      sin(vec3(dot(p, vec3(1.0, 57.0, 113.0)), dot(p, vec3(57.0, 113.0, 1.0)),
               dot(p, vec3(113.0, 1.0, 57.0)))) *
      43758.5453);
}

// Function from Iñigo Quiles
// www.iquilezles.org/www/articles/functions/functions.htm
// for visual demo, go to https://thebookofshaders.com/edit.php#05/parabola.frag
float parabola( float x, float k ){
    return pow(4.*x*(1.-x), k);
}

// Function from Iñigo Quiles
// www.iquilezles.org/www/articles/functions/functions.htm
// for visual demo, go to https://thebookofshaders.com/edit.php#05/pcurve.frag
float pcurve( float x, float a, float b ){
    float k = pow(a+b,a+b) / (pow(a,a)*pow(b,b));
    return k * pow( x, a ) * pow( 1.0-x, b );
}

// voronoi implementation largely referenced from https://www.shadertoy.com/view/MslGD8
vec2 voronoi3( in vec3 x, in float time )
{
    vec3 n = floor(x);
    vec3 f = fract(x);
    vec4 m = vec4(8.0);

    for( int k=-1; k<=1; k++ ) {
        for( int j=-1; j<=1; j++ ) {
            for( int i=-1; i<=1; i++ )
            {
                vec3 g = vec3(float(i),float(j),float(k));
                vec3 o = hash3d( n + g );
                vec3 r = g + (0.5+0.5*sin(vec3(time)+6.2831*o)) - f;
                float d = dot(r,r);
                if( d<m.x )
                {
                    m = vec4( d, o );
                }
            }
        }
    }

    return vec2(m.x, m.y+m.z+m.w);
}