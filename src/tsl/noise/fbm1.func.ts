import { float, sin, fract, Fn, floor, mix, int, Loop } from 'three/tsl';

export const rand = /*#__PURE__*/ Fn(([n_immutable]: unknown[]) => {
	const n = float( n_immutable ).toVar();
	return fract( sin( n ).mul( 43758.5453123 ) );
}).setLayout({
	name: 'rand',
	type: 'float',
	inputs: [{ name: 'n', type: 'float' }]
});

export const noise1 = /*#__PURE__*/ Fn(([p_immutable ]: unknown[]) => {
	const p = float( p_immutable ).toVar();
	const fl = float( floor( p ) ).toVar();
	const fc = float( fract( p ) ).toVar();
	return mix( rand( fl ), rand( fl.add( 1.0 ) ), fc );
}).setLayout({
	name: 'noise1',
	type: 'float',
	inputs: [{ name: 'p', type: 'float' }]
});

export const fbm1 = /*#__PURE__*/ Fn(([x_immutable, freq_immutable, amp_immutable, lac_immutable, octaves_immutable ]: unknown[]) => {
	const octaves = int( octaves_immutable ).toVar();
	const lac = float( lac_immutable ).toVar();
	const amp = float( amp_immutable ).toVar();
	const freq = float( freq_immutable ).toVar();
	const x = float( x_immutable ).toVar();
	const val = float( 0.0 ).toVar();

	Loop({ start: int( 0 ), end: octaves, condition: '' }, () => {
		val.addAssign( amp.mul( noise1( x.mul( freq ) ) ) );
		freq.mulAssign( lac );
		amp.mulAssign( 0.5 );
	});
	return val;
}).setLayout({
	name: 'fbm1',
	type: 'float',
	inputs: [
		{ name: 'x', type: 'float' },
		{ name: 'freq', type: 'float' },
		{ name: 'amp', type: 'float' },
		{ name: 'lac', type: 'float' },
		{ name: 'octaves', type: 'int' }
	]
});
