import type { LogEventTypeMap, LogLevel } from '@lib/components/custom/LgvLogBlock.types.ts';

export type ExportProgressDialogExposes = {
  open: (mode: 'textures' | 'gltf') => void;
  setProgress: (value: number) => void;
  updateProgressLog: <L extends LogLevel>(level: L, params: LogEventTypeMap[L]) => void;
  setDone: () => void;
  setError: (err: Error | string) => void;
};
