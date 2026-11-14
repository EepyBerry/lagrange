export const LogMessage = {
  BakingStep: 'Baking progress: step {curstep} of {maxstep}',
  BakingComplete: 'Baking operation completed',
  BakingSkipped: ' > Skipped, associated meshes disabled or non-existent',
  BakingWorkerTextureReceived: " > Received shader texture '{target}' from worker, type={textype}",
  BakingPart: " > Received baked texture map '{map}' from worker",
  BakingPartIndexed: ' > Received baked texture map {map} from worker, index={index}',
  BakingConvert: " > Converting baked texture map '{map}'...",
  BakingConvertIndexed: " > Converting baked texture map '{map}'...",
} as const;
export type LogMessage = (typeof LogMessage)[keyof typeof LogMessage];

export const getLogMessage = (msg: LogMessage, tokens: Record<string, any> = {}) => {
  return msg.replace(/{(\w+)}/g, (match, key) => tokens[key] || match);
};
