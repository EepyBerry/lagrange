export type ExportProgressDialogExposes = {
  open: () => void;
  setProgress: (value: number) => void;
  setDone: () => void;
  setError: (err: unknown) => void;
};
