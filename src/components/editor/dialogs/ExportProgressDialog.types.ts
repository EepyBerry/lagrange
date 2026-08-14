export type ExportProgressDialogExposes = {
  open: (mode: 'textures' | 'gltf') => void;
  setProgress: (value: number) => void;
  setDone: () => void;
  setError: (err: unknown) => void;
};
