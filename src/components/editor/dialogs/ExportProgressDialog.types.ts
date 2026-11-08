export type ExportProgressDialogExposes = {
  open: (mode: 'textures' | 'gltf') => void;
  setProgress: (value: number) => void;
  updateProgressLog: (i18nTranslationKey: string, params: Record<string, string | number>) => void;
  setDone: () => void;
  setError: (err: Error | string | unknown) => void;
};
