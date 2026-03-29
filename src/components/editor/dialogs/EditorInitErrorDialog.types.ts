export type EditorInitErrorDialogExposes = {
  open: (error: string, stack?: string, isWebGPUError?: boolean) => void;
};
