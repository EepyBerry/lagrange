import type { TextureNode, Node, StructNode } from 'three/webgpu';
import { float, step, abs, mix, smoothstep, Fn, vec2, vec4, vec3, min, struct } from 'three/tsl';
import { fbm3 } from '../noise/fbm3';

export const BiomesInput = struct(
  {
    temperatureMode: 'float',
    temperatureNoise: 'vec4',
    humidityMode: 'float',
    humidityNoise: 'vec4',
  },
  'BiomesInput',
);

export const calculateBiomeTextureCoordinates = /*@__PURE__*/ Fn(
  ([i_position, i_heightLimit, i_biomesInput]: [Node<'vec3'>, Node<'float'>, StructNode]) => {
    const vPos = vec3(i_position).toVar('vPos');
    const heightLimit = float(i_heightLimit).toVar('heightLimit');
    const temperatureMode = float(<Node<'float'>>i_biomesInput.get('temperatureMode')).toVar('temperatureMode');
    const temperatureNoise = vec4(<Node<'vec4'>>i_biomesInput.get('temperatureNoise')).toVar('temperatureNoise');
    const humidityMode = float(<Node<'float'>>i_biomesInput.get('humidityMode')).toVar('humidityMode');
    const humidityNoise = vec4(<Node<'vec4'>>i_biomesInput.get('humidityNoise')).toVar('humidityNoise');

    const temp = float(computeTemperature(vPos, temperatureNoise, temperatureMode));
    const humi = float(computeHumidity(vPos, humidityNoise, humidityMode));
    return vec2(min(temp, heightLimit), min(humi, heightLimit));
  },
  {
    name: 'LG_BIOME_calculateBiomeTextureCoordinates',
    type: 'vec2',
    inputs: [
      { name: 'i_position', type: 'vec3' },
      { name: 'i_heightLimit', type: 'float' },
      { name: 'i_biomesInput', type: 'BiomesInput' },
    ],
  },
);

export const renderBiomes = /*@__PURE__*/ Fn(
  ([color, texture, texCoords]: [Node<'vec3'>, TextureNode, Node<'vec2'>]) => {
    const texel = vec4(texture.sample(vec2(texCoords.y, texCoords.x))).toVar('texel');
    return mix(color, texel.xyz, texel.w);
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
  {
    name: 'LG_BIOME_computeTemperature',
    type: 'float',
    inputs: [
      { name: 'position', type: 'vec3' },
      { name: 'noise', type: 'vec4' },
      { name: 'mode', type: 'float' },
    ],
  },
);

export const computeHumidity = /*@__PURE__*/ Fn(
  ([i_position, i_noiseparams, i_mode]: [Node<'vec3'>, Node<'vec4'>, Node<'float'>]) => {
    const FLAG_POLAR = float(step(0.5, i_mode)).toVar('FLAG_POLAR');
    const FLAG_NOISE = float(step(1.5, i_mode)).toVar('FLAG_NOISE');

    const hy = float(mix(abs(i_position.y), i_position.y, FLAG_POLAR)).toVar('hy');
    const adjustedHy = float(smoothstep(FLAG_POLAR.negate(), 1, hy)).toVar('adjustedHy');
    const hHeight = float(mix(adjustedHy, 1, FLAG_NOISE)).toVar('hHeight');
    return hHeight.mul(fbm3(i_position, i_noiseparams));
  },
  {
    name: 'LG_BIOME_computeHumidity',
    type: 'float',
    inputs: [
      { name: 'position', type: 'vec3' },
      { name: 'noise', type: 'vec4' },
      { name: 'mode', type: 'float' },
    ],
  },
);
