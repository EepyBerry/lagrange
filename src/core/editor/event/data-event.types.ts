import type { DataEventEndpoint } from '@core/editor/event/data-event-endpoint.ts';
import type { DataEventPayload } from '@core/editor/event/data-event-payload.ts';
import type { ColorRamp } from '@core/models/planet/color-ramp.model.ts';
import type { DisplacementParameters } from '@core/models/planet/displacement-parameters.model.ts';
import type { BiomeParameters } from '@core/models/planet/features/biome-parameters.model.ts';
import type { FbmNoiseParameters } from '@core/models/planet/noise/fbm-noise-parameters.model.ts';
import type { VoronoiNoiseParameters } from '@core/models/planet/noise/voronoi-noise-parameters.model.ts';
import type { RingParameters } from '@core/models/planet/ring-parameters.model.ts';
import type { AntiAliasingMode } from '@core/models/renderpipeline/render-pipeline-data.model.ts';
import type { Color } from 'three/webgpu';
import {
  type BaseRenderPipelineIdentifier,
  BaseRenderPipelinePixelation,
  BaseRenderPipelineRetro,
} from '@core/models/renderpipeline/base-render-pipeline.model.ts';
import { GradientMode, PlanetClass, type PlanetType } from '@core/types.ts';

export type DataEventEmitOptions = {
  endpointRef: DataEventEndpoint<keyof DataEventPayloadTypeMap>;
  instanceId?: string;
  context?: DataEventContext;
};
export type DataEventContext =
  | 'surface'
  | 'biomes'
  | 'biomesTemperatureNoise'
  | 'biomesHumidityNoise'
  | 'cracks'
  | 'cracksBaseNoise'
  | 'cracksDetailNoise'
  | 'cracksLimiterNoise'
  | 'cracksColorNoise'
  | 'clouds'
  | 'atmosphere'
  | 'ring'
  | 'render-pipeline';

/**
 * Core mapped type for events.
 * Keys should be used as the generic type of {@link DataEventPayload} for correct type-checking
 */
export type DataEventPayloadTypeMap = {
  // ---- planet data object ----
  // lens flare
  lensFlareEnabled: DataEventPayload<boolean>;
  lensFlarePointsIntensity: DataEventPayload<number>;
  lensFlareGlareIntensity: DataEventPayload<number>;
  // lighting
  sunlightAngle: DataEventPayload<number>;
  sunlightColor: DataEventPayload<Color>;
  sunlightIntensity: DataEventPayload<number>;
  ambientLightColor: DataEventPayload<Color>;
  ambientLightIntensity: DataEventPayload<number>;
  // base
  planetType: DataEventPayload<PlanetType>;
  planetClass: DataEventPayload<PlanetClass>;
  meshQuality: DataEventPayload<number>;
  radius: DataEventPayload<{ surface: number; atmosphere: number }>;
  axialTilt: DataEventPayload<number>;
  rotation: DataEventPayload<{ surface: number; clouds: number }>;
  waterLevel: DataEventPayload<number>;
  // pbr
  pbr: DataEventPayload<{
    waterRoughness: number;
    waterMetalness: number;
    groundRoughness: number;
    groundMetalness: number;
  }>;
  // emissive
  showEmissive: DataEventPayload<boolean>;
  emissiveIntensity: DataEventPayload<{ water: number; ground: number }>;
  // bumps
  showBumps: DataEventPayload<boolean>;
  bumpOffset: DataEventPayload<number>;
  bumpStrength: DataEventPayload<number>;
  // warping/displacement
  showWarping: DataEventPayload<boolean>;
  showDisplacement: DataEventPayload<boolean>;
  // biomes
  showBiomes: DataEventPayload<boolean>;
  biomesTemperatureMode: DataEventPayload<GradientMode>;
  biomesHumidityMode: DataEventPayload<GradientMode>;
  biomeAdd: DataEventPayload<BiomeParameters>;
  biomeMoveUp: DataEventPayload<BiomeParameters>;
  biomeMoveDown: DataEventPayload<BiomeParameters>;
  biomeRemove: DataEventPayload<BiomeParameters>;
  // cracks
  showCracks: DataEventPayload<boolean>;
  cracksDistanceToEdge: DataEventPayload<number>;
  cracksEmissiveIntensity: DataEventPayload<number>;
  // clouds
  cloudsEnabled: DataEventPayload<boolean>;
  cloudsRotation: DataEventPayload<{ clouds: number; surface: number }>;
  cloudsShowWarping: DataEventPayload<boolean>;
  cloudsShowDisplacement: DataEventPayload<boolean>;
  cloudsColor: DataEventPayload<Color>;
  // atmosphere
  atmosphereEnabled: DataEventPayload<boolean>;
  atmosphereHeight: DataEventPayload<number>;
  atmosphereDensityScale: DataEventPayload<number>;
  atmosphereIntensity: DataEventPayload<number>;
  atmosphereColorMode: DataEventPayload<number>;
  atmosphereHue: DataEventPayload<number>;
  atmosphereTint: DataEventPayload<Color>;
  atmosphereMieScatteringConstant: DataEventPayload<number>;
  atmosphereRayleighDensityRatio: DataEventPayload<number>;
  atmosphereMieDensityRatio: DataEventPayload<number>;
  atmosphereOpticalDensityRatio: DataEventPayload<number>;
  // rings
  ringsEnabled: DataEventPayload<boolean>;
  ringAdd: DataEventPayload<RingParameters>;
  ringRemove: DataEventPayload<RingParameters>;

  // ---- dependent child objects ----
  colorRampUpdate: DataEventPayload<ColorRamp>;
  biomeParametersUpdate: DataEventPayload<null>;
  ringParametersUpdate: DataEventPayload<RingParameters>;
  displacementParametersUpdate: DataEventPayload<DisplacementParameters>;
  fbmNoiseParametersUpdate: DataEventPayload<FbmNoiseParameters>;
  voronoiNoiseParametersUpdate: DataEventPayload<VoronoiNoiseParameters>;

  // ---- render pipeline ----
  renderBasePipeline: DataEventPayload<BaseRenderPipelineIdentifier>;
  renderPipelinePixelation: DataEventPayload<BaseRenderPipelinePixelation>;
  renderPipelineRetro: DataEventPayload<BaseRenderPipelineRetro>;
  renderEffectRgbShift: DataEventPayload<{ enabled: boolean; angle: number; amount: number }>;
  renderEffectChromaticAberration: DataEventPayload<{ enabled: boolean; strength: number; scale: number }>;
  renderEffectBloom: DataEventPayload<{ enabled: boolean; threshold: number; strength: number; radius: number }>;
  renderEffectVignette: DataEventPayload<{ enabled: boolean; intensity: number; smoothness: number }>;
  renderEffectAntiAliasing: DataEventPayload<{ enabled: boolean; mode: AntiAliasingMode }>;
};

export type DataEventHandlers<K extends keyof DataEventPayloadTypeMap = never> = {
  [P in K]: (event: DataEventPayload<P>) => void;
};
