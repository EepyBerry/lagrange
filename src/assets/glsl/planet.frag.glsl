#ifdef GL_ES
precision highp float;
#endif

varying vec3 vPos;
uniform float opacity;

/*__SHADER_FUNCTIONS__*/

void main() {
    float noise = cnoise(normalize(vPos) * vec3(1., 1., 1.) * 2.);
    float r = max(0.0, noise);
    float b = max(0.0, -noise);
    
    vec4 diffuseColor = vec4( vec3(r, 0.0, b), 1.0 );
    gl_FragColor = diffuseColor;
}