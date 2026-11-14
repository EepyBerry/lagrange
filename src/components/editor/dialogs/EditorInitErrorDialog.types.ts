export type EditorInitErrorDialogExposes = {
  open: (error: Error | string, isWebGPUError?: boolean) => void;
};
