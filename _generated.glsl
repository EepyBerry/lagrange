#version 300 es

// Three.js r176 - Node System


// extensions


// precision

precision highp float;
precision highp int;
precision highp sampler2D;
precision highp sampler3D;
precision highp samplerCube;
precision highp sampler2DArray;

precision highp usampler2D;
precision highp usampler3D;
precision highp usamplerCube;
precision highp usampler2DArray;

precision highp isampler2D;
precision highp isampler3D;
precision highp isamplerCube;
precision highp isampler2DArray;

precision lowp sampler2DShadow;
precision lowp sampler2DArrayShadow;
precision lowp samplerCubeShadow;


// uniforms

layout( std140 ) uniform fragment_render {
	mat4 f_cameraProjectionMatrix;
	mat4 f_cameraViewMatrix;
	mat4 f_cameraProjectionMatrixInverse;
};

layout( std140 ) uniform fragment_object {
	mat4 f_nodeUniform2;
	vec3 f_uLightPosition;
	float f_uRadius;
	float f_uSurfaceRadius;
	float f_uLightIntensity;
	float f_uDensity;
	float f_uHue;
	vec3 f_uTint;
	int f_uColorMode;
	float f_uIntensity;
};


// varyings
in vec3 positionLocal;
in vec3 v_positionWorld;
in vec3 nodeVarying4;


// codes
float computeDensity ( vec3 i_p, float i_ph, float i_surfaceRadius, float i_density ) {

	float actualScaleHeight;
	float scale;
	float altitude;
	float rho_0;
	float rho;

	actualScaleHeight = 8500.0;
	scale = ( i_density / actualScaleHeight );
	altitude = ( length( i_p ) - i_surfaceRadius );
	rho_0 = 20.0;
	rho_0 = ( rho_0 * 0.08125 );
	rho = ( rho_0 * exp( ( ( - max( altitude, 0.0 ) ) / ( actualScaleHeight * scale ) ) ) );

	return ( rho * i_ph );

}

vec2 rayVsSphere ( vec3 i_position, vec3 i_direction, float i_r ) {

	float b;
	float c;
	float d;

	b = dot( i_position, i_direction );
	c = ( dot( i_position, i_position ) - ( i_r * i_r ) );
	d = ( ( b * b ) - c );

	if ( ( d < 0.0 ) ) {

		return vec2( 10000.0, ( - 10000.0 ) );

	}

	d = sqrt( d );

	return vec2( ( ( - b ) - d ), ( ( - b ) + d ) );

}

float optic ( vec3 i_p, vec3 i_q, float i_ph, float i_surfaceRadius, float i_density ) {

	vec3 s;
	vec3 v;
	float sum;

	s = ( ( i_q - i_p ) / vec3( 2.0 ) );
	v = ( i_p + ( s * vec3( 0.5 ) ) );
	sum = 0.0;

	for ( int i = 0; i < 2; i ++ ) {

		sum = ( sum + computeDensity( v, i_ph, i_surfaceRadius, i_density ) );
		v = ( v + s );

	}

	sum = ( sum * length( s ) );

	return sum;

}

float computeRayleigh ( float i_cc ) {

	


	return ( ( 0.1875 / 3.141592653589793 ) * ( 1.0 + i_cc ) );

}

float computeMie ( float i_g, float i_c, float i_cc ) {

	float gg;
	float a;
	float b;

	gg = ( i_g * i_g );
	a = ( ( 1.0 - gg ) * ( 1.0 + i_cc ) );
	b = ( 1.0 + ( gg - ( ( 2.0 * i_g ) * i_c ) ) );
	b = ( b * sqrt( b ) );
	b = ( b * ( 2.0 + gg ) );

	return ( ( ( 0.375 / 3.141592653589793 ) * a ) / b );

}

vec4 greyscale ( vec4 i_color ) {

	


	return ( i_color * mat4( vec4( 0.2126, 0.7152, 0.0722, 0.0 ), vec4( 0.2126, 0.7152, 0.0722, 0.0 ), vec4( 0.2126, 0.7152, 0.0722, 0.0 ), vec4( 0.0, 0.0, 0.0, 1.0 ) ) );

}

mat4 inverseMat4 ( mat4 i_matrix ) {

	mat4 m;
	float a00;
	float a01;
	float a02;
	float a03;
	float a10;
	float a11;
	float a12;
	float a13;
	float a20;
	float a21;
	float a22;
	float a23;
	float a30;
	float a31;
	float a32;
	float a33;
	float b00;
	float b01;
	float b02;
	float b03;
	float b04;
	float b05;
	float b06;
	float b07;
	float b08;
	float b09;
	float b10;
	float b11;
	float det;

	m = i_matrix;
	a00 = m[ 0u ][ 0u ];
	a01 = m[ 0u ][ 1u ];
	a02 = m[ 0u ][ 2u ];
	a03 = m[ 0u ][ 3u ];
	a10 = m[ 1u ][ 0u ];
	a11 = m[ 1u ][ 1u ];
	a12 = m[ 1u ][ 2u ];
	a13 = m[ 1u ][ 3u ];
	a20 = m[ 2u ][ 0u ];
	a21 = m[ 2u ][ 1u ];
	a22 = m[ 2u ][ 2u ];
	a23 = m[ 2u ][ 3u ];
	a30 = m[ 3u ][ 0u ];
	a31 = m[ 3u ][ 1u ];
	a32 = m[ 3u ][ 2u ];
	a33 = m[ 3u ][ 3u ];
	b00 = ( ( a00 * a11 ) - ( a01 * a10 ) );
	b01 = ( ( a00 * a12 ) - ( a02 * a10 ) );
	b02 = ( ( a00 * a13 ) - ( a03 * a10 ) );
	b03 = ( ( a01 * a12 ) - ( a02 * a11 ) );
	b04 = ( ( a01 * a13 ) - ( a03 * a11 ) );
	b05 = ( ( a02 * a13 ) - ( a03 * a12 ) );
	b06 = ( ( a20 * a31 ) - ( a21 * a30 ) );
	b07 = ( ( a20 * a32 ) - ( a22 * a30 ) );
	b08 = ( ( a20 * a33 ) - ( a23 * a30 ) );
	b09 = ( ( a21 * a32 ) - ( a22 * a31 ) );
	b10 = ( ( a21 * a33 ) - ( a23 * a31 ) );
	b11 = ( ( a22 * a33 ) - ( a23 * a32 ) );
	det = ( ( ( ( ( b00 * b11 ) - ( b01 * b10 ) ) + ( b02 * b09 ) ) + ( ( b03 * b08 ) - ( b04 * b07 ) ) ) + ( b05 * b06 ) );

	return ( ( 1.0 / det ) * mat4( ( ( ( a11 * b11 ) - ( a12 * b10 ) ) + ( a13 * b09 ) ), ( ( ( a02 * b10 ) - ( a01 * b11 ) ) - ( a03 * b09 ) ), ( ( ( a31 * b05 ) - ( a32 * b04 ) ) + ( a33 * b03 ) ), ( ( ( a22 * b04 ) - ( a21 * b05 ) ) - ( a23 * b03 ) ), ( ( ( a12 * b08 ) - ( a10 * b11 ) ) - ( a13 * b07 ) ), ( ( ( a00 * b11 ) - ( a02 * b08 ) ) + ( a03 * b07 ) ), ( ( ( a32 * b02 ) - ( a30 * b05 ) ) - ( a33 * b01 ) ), ( ( ( a20 * b05 ) - ( a22 * b02 ) ) + ( a23 * b01 ) ), ( ( ( a10 * b10 ) - ( a11 * b08 ) ) + ( a13 * b06 ) ), ( ( ( a01 * b08 ) - ( a00 * b10 ) ) - ( a03 * b06 ) ), ( ( ( a30 * b04 ) - ( a31 * b02 ) ) + ( a33 * b00 ) ), ( ( ( a21 * b02 ) - ( a20 * b04 ) ) - ( a23 * b00 ) ), ( ( ( a11 * b07 ) - ( a10 * b09 ) ) - ( a12 * b06 ) ), ( ( ( a00 * b09 ) - ( a01 * b07 ) ) + ( a02 * b06 ) ), ( ( ( a31 * b01 ) - ( a30 * b03 ) ) - ( a32 * b00 ) ), ( ( ( a20 * b03 ) - ( a21 * b01 ) ) + ( a22 * b00 ) ) ) );

}

vec4 applyInScatter ( vec3 i_o, vec3 i_dir, vec2 i_e, vec3 i_lightDir, float i_lightIntensity, vec3 i_uniforms ) {

	vec3 sum_ray;
	vec3 sum_mie;
	float sum_alpha;
	float nodeVar0;
	float nodeVar1;
	float len;
	vec3 nodeVar2;
	vec3 v;
	float d_ray;
	float d_mie;
	float d_alpha;
	vec2 f;
	vec3 u;
	float n_ray1;
	float n_mie1;
	vec3 att;
	float c;
	float cc;
	vec3 scatter;
	float alpha;

	sum_ray = vec3( 0.0, 0.0, 0.0 );
	sum_mie = vec3( 0.0, 0.0, 0.0 );
	sum_alpha = 0.0;
	nodeVar0 = 0.0;
	nodeVar1 = 0.0;
	len = ( ( i_e.y - i_e.x ) / 10.0 );
	nodeVar2 = ( i_dir * vec3( len ) );
	v = ( i_o + ( i_dir * vec3( ( i_e.x + ( len * 0.5 ) ) ) ) );

	for ( int i = 0; i < 10; i ++ ) {

		d_ray = ( computeDensity( v, 0.15, i_uniforms.y, i_uniforms.z ) * len );
		d_mie = ( computeDensity( v, 0.05, i_uniforms.y, i_uniforms.z ) * len );
		d_alpha = ( computeDensity( v, 0.25, i_uniforms.y, i_uniforms.z ) * len );
		nodeVar0 = ( nodeVar0 + d_ray );
		nodeVar1 = ( nodeVar1 + d_mie );
		f = rayVsSphere( v, i_lightDir, i_uniforms.x );
		u = ( v + ( i_lightDir * vec3( f.y ) ) );
		n_ray1 = optic( v, u, 0.15, i_uniforms.y, i_uniforms.z );
		n_mie1 = optic( v, u, 0.05, i_uniforms.y, i_uniforms.z );
		att = exp( ( ( vec3( ( - ( nodeVar0 + n_ray1 ) ) ) * vec3( 3.8, 13.5, 33.1 ) ) - ( ( vec3( ( nodeVar1 + n_mie1 ) ) * vec3( 21.0, 21.0, 21.0 ) ) * vec3( 1.1 ) ) ) );
		sum_ray = ( sum_ray + ( vec3( d_ray ) * att ) );
		sum_mie = ( sum_mie + ( vec3( d_mie ) * att ) );
		sum_alpha = ( sum_alpha + d_alpha );
		v = ( v + nodeVar2 );

	}

	c = dot( i_dir, ( - i_lightDir ) );
	cc = ( c * c );
	scatter = ( ( ( sum_ray * vec3( 3.8, 13.5, 33.1 ) ) * vec3( computeRayleigh( cc ) ) ) + ( ( sum_mie * vec3( 21.0, 21.0, 21.0 ) ) * vec3( computeMie( -0.78, c, cc ) ) ) );
	alpha = ( sum_alpha * 2.0 );

	return vec4( ( scatter * i_lightIntensity ), alpha );

}

vec3 shiftHue ( vec3 i_color, float i_hue ) {

	float s;
	float c;

	s = sin( i_hue );
	c = cos( i_hue );

	return ( ( ( i_color * vec3( c ) ) + ( ( i_color * vec3( s ) ) * mat3( vec3( 0.167444, 0.329213, -0.496657 ), vec3( -0.327948, 0.035669, 0.292279 ), vec3( 1.250268, -1.047561, -0.202707 ) ) ) ) + vec3( ( dot( vec3( 0.299, 0.587, 0.114 ), i_color ) * ( 1.0 - c ) ) ) );

}

vec4 whitescale ( vec4 i_color ) {

	


	return ( greyscale( i_color ) * vec4( 2.0 ) );

}

mat4 tintToMatrix ( vec4 i_tint ) {

	


	return mat4( vec4( i_tint.x, 0.0, 0.0, 0.0 ), vec4( 0.0, i_tint.y, 0.0, 0.0 ), vec4( 0.0, 0.0, i_tint.z, 0.0 ), vec4( 0.0, 0.0, 0.0, i_tint.w ) );

}

vec4 fragmentNode (  ) {

	mat4 modelViewMatrix;
	vec4 clipSpacePos;
	vec3 ndc;
	vec4 clipRay;
	vec4 inverseRay;
	vec3 viewRay;
	vec4 worldRay;
	vec3 rayDir;
	vec3 eye;
	vec3 sunlightDir;
	vec2 e;
	vec2 f;
	vec4 I;
	vec4 IGamma;
	vec4 IShifted;
	vec4 tint;
	vec4 nodeVar0;

	modelViewMatrix = ( f_cameraViewMatrix * f_nodeUniform2 );
	clipSpacePos = ( ( f_cameraProjectionMatrix * modelViewMatrix ) * vec4( nodeVarying4, 1.0 ) );
	ndc = ( clipSpacePos.xyz / vec3( clipSpacePos.w ) );
	clipRay = vec4( ndc.x, ndc.y, -1.0, 1.0 );
	inverseRay = ( f_cameraProjectionMatrixInverse * clipRay );
	viewRay = vec3( inverseRay.x, inverseRay.y, -1.0 );
	worldRay = ( inverseMat4( f_cameraViewMatrix ) * vec4( viewRay, 0.0 ) );
	rayDir = normalize( worldRay.xyz );
	eye = v_positionWorld;
	sunlightDir = normalize( ( f_uLightPosition - v_positionWorld ) );
	e = rayVsSphere( eye, rayDir, f_uRadius );

	if ( ( e.x > e.y ) ) {

		return vec4( 0.0, 0.0, 0.0, 0.0 );

	}

	f = rayVsSphere( eye, rayDir, f_uSurfaceRadius );
	e.y = min( e.y, f.x );
	I = applyInScatter( eye, rayDir, e, sunlightDir, f_uLightIntensity, vec3( f_uRadius, f_uSurfaceRadius, f_uDensity ) );
	IGamma = pow( I, vec4( 0.45454545454545453, 0.45454545454545453, 0.45454545454545453, 0.45454545454545453 ) );
	IShifted = vec4( shiftHue( IGamma.xyz, ( f_uHue * 3.141592653589793 ) ), IGamma.w );
	tint = vec4( f_uTint, 1.0 );
	nodeVar0 = vec4( 0.0, 0.0, 0.0, 0.0 );

	if ( ( f_uColorMode == 0 ) ) {

		nodeVar0 = ( IShifted * vec4( f_uIntensity ) );
		

	}


	if ( ( f_uColorMode == 1 ) ) {

		nodeVar0 = ( ( whitescale( IGamma ) * tintToMatrix( tint ) ) * vec4( f_uIntensity ) );
		

	}


	if ( ( f_uColorMode == 2 ) ) {

		nodeVar0 = ( ( IShifted * tint ) * vec4( f_uIntensity ) );
		

	}


	return nodeVar0;

}



// structs

layout( location = 0 ) out vec4 fragColor;



void main() {

	// vars
	

	// flow
	// code


	// result
	fragColor = fragmentNode(  );

}