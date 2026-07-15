import type { TextureNode, Node } from 'three/webgpu';
import { float, step, abs, mix, smoothstep, Fn, vec2, vec4, vec3 } from 'three/tsl';
import { fbm3 } from '../noise/fbm3';

export const calculateBiomeTextureCoordinates = /*@__PURE__*/ Fn(
  ([
    i_position,
    i_heightLimit,
    i_temperatureMode,
    i_temperatureNoise,
    i_humidityMode,
    i_humidityNoise,
    i_FLAG_BIOMES_ENABLED,
  ]: [Node<'vec3'>, Node<'float'>, Node<'float'>, Node<'vec4'>, Node<'float'>, Node<'vec4'>, Node<'float'>]) => {
    const vPos = vec3(i_position).toVar('vPos');
    const heightLimit = float(i_heightLimit).toVar('heightLimit');
    const temperatureMode = float(i_temperatureMode).toVar('temperatureMode');
    const temperatureNoise = vec4(i_temperatureNoise).toVar('temperatureNoise');
    const humidityMode = float(i_humidityMode).toVar('humidityMode');
    const humidityNoise = vec4(i_humidityNoise).toVar('humidityNoise');
    const FLAG_BIOMES_ENABLED = float(i_FLAG_BIOMES_ENABLED).toVar('FLAG_BIOMES_ENABLED');

    const temp = float(computeTemperature(vPos, temperatureNoise, temperatureMode));
    const humi = float(computeHumidity(vPos, humidityNoise, humidityMode));
    return vec2(
      float(mix(0, temp, FLAG_BIOMES_ENABLED)).min(heightLimit),
      float(mix(0, humi, FLAG_BIOMES_ENABLED)).min(heightLimit),
    );
  },
).setLayout({
  name: 'LG_BIOME_calculateBiomeTextureCoordinates',
  type: 'vec2',
  inputs: [
    { name: 'i_position', type: 'vec3' },
    { name: 'i_heightLimit', type: 'float' },
    { name: 'i_temperatureMode', type: 'float' },
    { name: 'i_temperatureNoise', type: 'vec4' },
    { name: 'i_humidityMode', type: 'float' },
    { name: 'i_humidityNoise', type: 'vec4' },
    { name: 'i_FLAG_BIOMES_ENABLED', type: 'float' },
  ],
});

export const renderBiomes = /*@__PURE__*/ Fn(
  ([color, texture, texCoords, FLAG_BIOMES_ENABLED]: [Node<'vec3'>, TextureNode, Node<'vec2'>, Node<'float'>]) => {
    return mix(color, sampleBiomeTexture(texture, texCoords.x, texCoords.y, color), FLAG_BIOMES_ENABLED);
  },
);

// -------------------------------------------------

export const computeTemperature = /*@__PURE__*/ Fn(
  ([i_position, i_noiseparams, i_mode]: [Node<'vec3'>, Node<'vec4'>, Node<'float'>]) => {
    const FLAG_POLAR = float(step(0.5, i_mode)).toVar('FLAG_POLAR');
    const FLAG_NOISE = float(step(1.5, i_mode)).toVar('FLAG_NOISE');

    const ty = float(mix(abs(i_position.y), i_position.y, FLAG_POLAR)).toVar('ty');
    const adjustedTy = float(smoothstep(1, FLAG_POLAR.negate(), ty)).toVar('adjustedTy');
    const tHeight = float(mix(adjustedTy, 1, FLAG_NOISE)).toVar('tHeight');
    return tHeight.mul(fbm3(i_position, i_noiseparams));
  },
).setLayout({
  name: 'LG_BIOME_computeTemperature',
  type: 'float',
  inputs: [
    { name: 'position', type: 'vec3' },
    { name: 'noise', type: 'vec4' },
    { name: 'mode', type: 'float' },
  ],
});

export const computeHumidity = /*@__PURE__*/ Fn(
  ([i_position, i_noiseparams, i_mode]: [Node<'vec3'>, Node<'vec4'>, Node<'float'>]) => {
    const FLAG_POLAR = float(step(0.5, i_mode)).toVar('FLAG_POLAR');
    const FLAG_NOISE = float(step(1.5, i_mode)).toVar('FLAG_NOISE');

    const hy = float(mix(abs(i_position.y), i_position.y, FLAG_POLAR)).toVar('hy');
    const adjustedHy = float(smoothstep(FLAG_POLAR.negate(), 1, hy)).toVar('adjustedHy');
    const hHeight = float(mix(adjustedHy, 1, FLAG_NOISE)).toVar('hHeight');
    return hHeight.mul(fbm3(i_position, i_noiseparams));
  },
).setLayout({
  name: 'LG_BIOME_computeHumidity',
  type: 'float',
  inputs: [
    { name: 'position', type: 'vec3' },
    { name: 'noise', type: 'vec4' },
    { name: 'mode', type: 'float' },
  ],
});

// TODO: add setLayout when feature is ready in TSL
export const sampleBiomeTexture = /*@__PURE__*/ Fn(
  ([i_tex, i_temperature, i_humidity, i_color]: [TextureNode, Node<'float'>, Node<'float'>, Node<'vec3'>]) => {
    const texel = vec4(i_tex.sample(vec2(i_humidity, i_temperature))).toVar('texel');
    return mix(i_color, texel.xyz, texel.w);
  },
); /* .setLayout({
  name: 'LG_BIOME_sampleBiomeTexture',
  type: 'float',
  inputs: [
    { name: 'tex', type: 'texture' },
    { name: 'temperature', type: 'float' },
    { name: 'humidity', type: 'float' },
    { name: 'color', type: 'vec3' },
  ]
}); */
