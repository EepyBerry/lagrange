export type ExportProgressDialogExposes = {
  open: () => void;
  setProgress: (value: number) => void;
  setError: (err: unknown) => void;
};
